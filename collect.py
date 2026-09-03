"""
collect.py
Pulls public conversations about Myntra and online fashion shopping in India.

Run this on your own machine. Output: data/raw_corpus.csv

  python collect.py

Sources:
  1. Google Play reviews      no API key needed
  2. Reddit via Apify         needs APIFY_TOKEN (reddit blocks direct access)
  3. Myntra product reviews   needs FIRECRAWL_API_KEY
  4. YouTube comments         needs a free API key, optional

Keys are read from the environment or a .env file in this directory.
Set TARGET_N below. 800 to 1500 items is enough to quantify credibly.
"""

import csv
import json
import os
import random
import re
import time
from datetime import datetime

import requests


def _load_dotenv(path=".env"):
    """Tiny .env reader so keys can live in a local file. No new dependency."""
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

TARGET_N = 4000
OUT_DIR = "data"
UA = "Mozilla/5.0 (research script for a student project)"

# name -> (package id, reviews to fetch). Myntra gets more, it is the subject.
PLAY_APPS = {
    "myntra": ("com.myntra.android", 2000),
    "ajio": ("com.ril.ajio", 1000),
    "nykaafashion": ("com.fsn.nds", 1000),
}

# Reddit goes through Apify's reddit-scraper-lite actor. Direct access to
# reddit's public JSON now returns 403 for everything, so keyless is not an
# option any more.
APIFY_TOKEN = os.environ.get("APIFY_TOKEN", "")
REDDIT_ACTOR = "trudax/reddit-scraper-lite"

# One sitewide run over the myntra-specific queries, then targeted runs inside
# the two most on-topic communities. Kept to three runs to control cost.
# Reddit search yields very little through the actor, so the bulk comes from
# startUrls runs over the fashion subreddits' top-of-year pages instead.
REDDIT_RUNS = [
    {
        "searches": ["myntra", "myntra size", "myntra wishlist",
                     "ajio vs myntra", "buying clothes online size india"],
        "searchCommunityName": "",
        "maxItems": 250,
    },
    {
        "searches": ["myntra", "size help", "online shopping"],
        "searchCommunityName": "IndianFashionAdvice",
        "maxItems": 120,
    },
    {
        "searches": ["myntra", "online shopping clothes"],
        "searchCommunityName": "TwoXIndia",
        "maxItems": 80,
    },
    {
        "startUrls": [
            "https://www.reddit.com/r/IndianFashionAdvice/top/?t=year",
            "https://www.reddit.com/r/IndianFashionAdvice/top/?t=all",
            "https://www.reddit.com/r/DesiFashionAdvice/top/?t=year",
            "https://www.reddit.com/r/IndianStreetwear/top/?t=year",
            "https://www.reddit.com/r/TwoXIndia/top/?t=year",
        ],
        "maxItems": 700,
    },
]

# Myntra's own product review pages, scraped through Firecrawl (myntra.com is
# JS-rendered and bot-protected, plain requests cannot read it).
FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")
MYNTRA_CATEGORY_PAGES = [
    "https://www.myntra.com/kurtas",
    "https://www.myntra.com/dresses",
    "https://www.myntra.com/tshirts",
    "https://www.myntra.com/jeans",
    "https://www.myntra.com/shirts",
    "https://www.myntra.com/sarees",
    "https://www.myntra.com/tops",
    "https://www.myntra.com/trousers",
]
MYNTRA_PRODUCTS_PER_CATEGORY = 10

# Optional. Get a key at console.cloud.google.com, enable YouTube Data API v3.
YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
YOUTUBE_QUERIES = [
    "myntra haul review",
    "myntra size guide",
    "online shopping clothes india honest review",
    "myntra wishlist",
    "ajio haul honest",
    "online shopping size problem india",
]

os.makedirs(OUT_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# 1. GOOGLE PLAY
# ---------------------------------------------------------------------------

def collect_play():
    try:
        from google_play_scraper import Sort, reviews
    except ImportError:
        print("  ! pip install google-play-scraper")
        return []

    out = []
    for name, (pkg, per_app) in PLAY_APPS.items():
        got = []
        token = None
        while len(got) < per_app:
            try:
                batch, token = reviews(
                    pkg, lang="en", country="in",
                    sort=Sort.NEWEST, count=200,
                    continuation_token=token,
                )
            except Exception as e:
                print(f"  ! {name}: {e}")
                break
            if not batch:
                break
            got.extend(batch)
            if token is None:
                break
            time.sleep(1)

        for r in got[:per_app]:
            body = (r.get("content") or "").strip()
            if len(body) < 25:
                continue
            out.append({
                "id": f"play_{name}_{r.get('reviewId','')}",
                "source": "play_store",
                "platform": name,
                "date": str(r.get("at", "")),
                "rating": r.get("score", ""),
                "text": body,
                "url": "",
            })
        print(f"  play/{name}: {len(got)} fetched")
    return out


# ---------------------------------------------------------------------------
# 2. REDDIT  (via Apify)
# ---------------------------------------------------------------------------

def collect_reddit(runs=None):
    if not APIFY_TOKEN:
        print("  reddit: skipped, no APIFY_TOKEN set")
        return []
    try:
        from apify_client import ApifyClient
    except ImportError:
        print("  ! pip install apify-client")
        return []

    client = ApifyClient(APIFY_TOKEN)
    out = []
    seen = set()

    for run_cfg in (runs if runs is not None else REDDIT_RUNS):
        run_input = {
            "skipComments": False,
            "skipCommunity": True,
            "skipUserPosts": True,
            "includeNSFW": False,
            "maxItems": run_cfg["maxItems"],
            "maxPostCount": 20,
            "maxComments": 15,
            "proxy": {"useApifyProxy": True,
                      "apifyProxyGroups": ["RESIDENTIAL"]},
        }
        if run_cfg.get("startUrls"):
            where = "startUrls"
            run_input["startUrls"] = [{"url": u}
                                      for u in run_cfg["startUrls"]]
            run_input["maxPostCount"] = 40
        else:
            where = run_cfg.get("searchCommunityName") or "all of reddit"
            run_input.update({
                "searches": run_cfg["searches"],
                "searchPosts": True,
                "searchComments": False,
                "sort": "relevance",
            })
            if run_cfg.get("searchCommunityName"):
                run_input["searchCommunityName"] = \
                    run_cfg["searchCommunityName"]

        try:
            # apify-client 3.x returns a typed Run model, not a dict
            run = client.actor(REDDIT_ACTOR).call(run_input=run_input)
            if run is None or run.status != "SUCCEEDED":
                status = getattr(run, "status", "no run")
                print(f"  ! reddit ({where}): run ended with {status}")
                continue
            items = list(client.dataset(
                run.default_dataset_id).iterate_items())
        except Exception as e:
            print(f"  ! reddit ({where}): {type(e).__name__} {e}")
            continue

        for it in items:
            dtype = it.get("dataType", "")
            rid = it.get("id") or it.get("parsedId") or ""
            if not rid or rid in seen:
                continue
            seen.add(rid)

            community = (it.get("communityName") or
                         it.get("parsedCommunityName") or "reddit")
            date = str(it.get("createdAt", ""))[:10]
            url = it.get("url") or it.get("link") or ""

            if dtype == "post":
                title = (it.get("title") or "").strip()
                body = (it.get("body") or "").strip()
                text = f"{title}. {body}".strip(". ")
                kind = "reddit_post"
            elif dtype == "comment":
                text = (it.get("body") or "").strip()
                kind = "reddit_comment"
            else:
                continue

            if len(text) < 40 or text in ("[deleted]", "[removed]"):
                continue
            out.append({
                "id": f"rd_{rid}",
                "source": kind,
                "platform": community,
                "date": date,
                "rating": "",
                "text": text[:4000],
                "url": url,
            })
        print(f"  reddit ({where}): {len(items)} items, running total {len(out)}")
    return out


# ---------------------------------------------------------------------------
# 3. MYNTRA PRODUCT REVIEWS  (via Firecrawl)
# ---------------------------------------------------------------------------

def collect_myntra_reviews():
    if not FIRECRAWL_API_KEY:
        print("  myntra reviews: skipped, no FIRECRAWL_API_KEY set")
        return []
    try:
        from firecrawl import Firecrawl
    except ImportError:
        print("  ! pip install firecrawl-py")
        return []

    client = Firecrawl(api_key=FIRECRAWL_API_KEY)
    out = []

    for cat_url in MYNTRA_CATEGORY_PAGES:
        category = cat_url.rsplit("/", 1)[-1]

        # Step 1: listing page -> product style ids
        try:
            doc = client.scrape(cat_url, formats=["links"], wait_for=3000)
            links = getattr(doc, "links", None) or []
        except Exception as e:
            print(f"  ! myntra {category} listing: {type(e).__name__} {e}")
            continue

        style_ids = []
        for link in links:
            m = re.search(r"myntra\.com/.+/(\d{6,9})/buy", str(link))
            if m and m.group(1) not in style_ids:
                style_ids.append(m.group(1))
            if len(style_ids) >= MYNTRA_PRODUCTS_PER_CATEGORY:
                break

        # Step 2: each product's review page, reviews extracted as JSON
        got = 0
        for sid in style_ids:
            try:
                doc = client.scrape(
                    f"https://www.myntra.com/reviews/{sid}",
                    formats=[{
                        "type": "json",
                        "prompt": (
                            "Extract every customer review on this page as a "
                            "list under key 'reviews', each with 'text' (the "
                            "full review text) and 'rating' (1-5 if shown, "
                            "else null). Do not invent reviews; return an "
                            "empty list if there are none."),
                    }],
                    wait_for=3000,
                )
                data = getattr(doc, "json", None) or {}
                reviews = data.get("reviews") or []
            except Exception as e:
                print(f"  ! myntra review {sid}: {type(e).__name__} {e}")
                continue

            for i, rv in enumerate(reviews):
                text = str(rv.get("text") or "").strip()
                if len(text) < 25:
                    continue
                out.append({
                    "id": f"myntra_{sid}_{i}",
                    "source": "myntra_reviews",
                    "platform": category,
                    "date": "",
                    "rating": rv.get("rating") or "",
                    "text": text[:4000],
                    "url": f"https://www.myntra.com/reviews/{sid}",
                })
                got += 1
            time.sleep(0.5)
        print(f"  myntra {category}: {len(style_ids)} products, "
              f"{got} reviews, running total {len(out)}")
    return out


# ---------------------------------------------------------------------------
# 4. YOUTUBE  (optional, needs key)
# ---------------------------------------------------------------------------

def collect_youtube(videos_per_query=6, comments_per_video=80):
    if not YOUTUBE_API_KEY:
        print("  youtube: skipped, no YOUTUBE_API_KEY set")
        return []

    out = []
    base = "https://www.googleapis.com/youtube/v3"

    for query in YOUTUBE_QUERIES:
        s = requests.get(f"{base}/search", params={
            "part": "id", "q": query, "type": "video",
            "maxResults": videos_per_query, "regionCode": "IN",
            "relevanceLanguage": "en", "key": YOUTUBE_API_KEY,
        }, timeout=20)
        if s.status_code != 200:
            print(f"  ! youtube search: {s.status_code} {s.text[:120]}")
            continue

        for item in s.json().get("items", []):
            vid = item.get("id", {}).get("videoId")
            if not vid:
                continue
            c = requests.get(f"{base}/commentThreads", params={
                "part": "snippet", "videoId": vid,
                "maxResults": min(comments_per_video, 100),
                "order": "relevance", "textFormat": "plainText",
                "key": YOUTUBE_API_KEY,
            }, timeout=20)
            if c.status_code != 200:
                continue

            for th in c.json().get("items", []):
                sn = th["snippet"]["topLevelComment"]["snippet"]
                body = (sn.get("textDisplay") or "").strip()
                if len(body) < 40:
                    continue
                out.append({
                    "id": f"yt_{th.get('id','')}",
                    "source": "youtube_comment",
                    "platform": "youtube",
                    "date": sn.get("publishedAt", "")[:10],
                    "rating": "",
                    "text": body[:4000],
                    "url": f"https://youtube.com/watch?v={vid}",
                })
            time.sleep(0.5)
        print(f"  youtube '{query}': running total {len(out)}")
    return out


# ---------------------------------------------------------------------------
# CLEAN AND WRITE
# ---------------------------------------------------------------------------

def clean(rows):
    seen_text = set()
    out = []
    for r in rows:
        t = re.sub(r"\s+", " ", r["text"]).strip()
        if len(t) < 25:
            continue
        key = t[:160].lower()
        if key in seen_text:
            continue
        seen_text.add(key)
        r["text"] = t
        out.append(r)
    return out


def main():
    print("Collecting. This takes 10 to 20 minutes, mostly Reddit rate limits.\n")

    rows = []
    print("Google Play")
    rows += collect_play()
    print("\nReddit")
    rows += collect_reddit()
    print("\nMyntra product reviews")
    rows += collect_myntra_reviews()
    print("\nYouTube")
    rows += collect_youtube()

    rows = clean(rows)
    print(f"\n{len(rows)} unique items after cleaning")

    if len(rows) > TARGET_N:
        # Shuffle with a fixed seed before cutting, so the cap trims every
        # source proportionally instead of dropping whichever ran last.
        random.Random(42).shuffle(rows)
        rows = rows[:TARGET_N]

    path = os.path.join(OUT_DIR, "raw_corpus.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=[
            "id", "source", "platform", "date", "rating", "text", "url"])
        w.writeheader()
        w.writerows(rows)

    by_source = {}
    for r in rows:
        by_source[r["source"]] = by_source.get(r["source"], 0) + 1

    print(f"\nWrote {path}")
    for k, v in sorted(by_source.items(), key=lambda x: -x[1]):
        print(f"  {k:20s} {v}")
    print("\nNext: python classify.py")


if __name__ == "__main__":
    main()
