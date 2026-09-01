"""
mvp_engine.py
The working parts of "Worth a look?": fetch a Myntra product and its buyer
reviews, then produce an evidence-only brief answering the shopper's doubt.

Rules the brief must obey, enforced by prompt and by post-check:
- every claim is grounded in the fetched reviews, quotes are verbatim
- "the reviews do not answer this" is a valid and expected output
- it never urges buying; it reports what buyers said
"""

import json
import os
import re

from collect import _load_dotenv

_load_dotenv()

BRIEF_MODEL = "claude-opus-5"
MAX_REVIEWS = 60


# ---------------------------------------------------------------------------
# Fetching
# ---------------------------------------------------------------------------

def extract_style_id(url: str):
    """Myntra product URLs end in /<style-id>/buy; review pages are
    /reviews/<style-id>. Accept either, or a bare numeric id."""
    url = (url or "").strip()
    m = (re.search(r"/(\d{6,9})/buy", url)
         or re.search(r"/reviews/(\d{6,9})", url)
         or re.fullmatch(r"(\d{6,9})", url))
    return m.group(1) if m else None


def _firecrawl():
    from firecrawl import Firecrawl
    key = os.environ.get("FIRECRAWL_API_KEY", "")
    if not key:
        raise RuntimeError("FIRECRAWL_API_KEY not set")
    return Firecrawl(api_key=key)


def fetch_product(style_id: str):
    """Product metadata + all visible reviews, via two Firecrawl scrapes."""
    fc = _firecrawl()

    meta_doc = fc.scrape(
        f"https://www.myntra.com/reviews/{style_id}",
        formats=[{
            "type": "json",
            "prompt": (
                "From this product reviews page extract: 'brand', 'name' "
                "(product name), 'price' (displayed price as shown), "
                "'rating' (average rating if shown, else null), "
                "'rating_count' (number of ratings if shown, else null), and "
                "'reviews': every customer review on the page as a list of "
                "{'text': full review text, 'rating': 1-5 or null, "
                "'size_bought': size mentioned as bought if shown else null}. "
                "Do not invent anything; empty list if no reviews."),
        }],
        wait_for=3000,
    )
    data = getattr(meta_doc, "json", None) or {}
    reviews = [r for r in (data.get("reviews") or [])
               if len(str(r.get("text") or "").strip()) >= 15]
    return {
        "style_id": style_id,
        "brand": data.get("brand") or "",
        "name": data.get("name") or "",
        "price": str(data.get("price") or ""),
        "rating": data.get("rating"),
        "rating_count": data.get("rating_count"),
        "url": f"https://www.myntra.com/reviews/{style_id}",
        "reviews": reviews[:MAX_REVIEWS],
    }


# ---------------------------------------------------------------------------
# The brief
# ---------------------------------------------------------------------------

DOUBTS = {
    "size": "Will it fit me? Does the sizing run true?",
    "quality": "Is the fabric / build quality actually good?",
    "worth": "Is it worth the price?",
    "photos": "Will it look like the photos when it arrives?",
    "general": "Should I take this off my wishlist or buy it?",
}


def build_brief_prompt(product, doubt_key):
    reviews_block = "\n".join(
        f'[{i + 1}] rating={r.get("rating", "?")}'
        + (f' size_bought={r["size_bought"]}' if r.get("size_bought") else "")
        + f' :: {str(r["text"]).strip()[:400]}'
        for i, r in enumerate(product["reviews"]))

    return f"""You are helping an online shopper in India decide about an item sitting in
their wishlist. You have the item's real buyer reviews, and nothing else.
Answer ONLY from these reviews. Quoting is verbatim. If the reviews do not
answer something, say so plainly - that is a useful answer, not a failure.
Never urge the shopper to buy. You are the careful friend who read everything.

ITEM: {product['brand']} - {product['name']} - price {product['price']}
Average rating: {product['rating']} from {product['rating_count']} ratings.

THE SHOPPER'S DOUBT: {DOUBTS[doubt_key]}

BUYER REVIEWS ({len(product['reviews'])} total), format [n] rating :: text:
{reviews_block}

Return ONLY a JSON object, no markdown fences:
{{
  "size_read": {{
    "verdict": "runs_small" | "true_to_size" | "runs_large" | "mixed" | "no_evidence",
    "n_mentions": <how many reviews mention size or fit>,
    "summary": "<one or two plain sentences, only if there is evidence>",
    "quotes": [{{"n": <review number>, "text": "<verbatim, max 25 words>"}}]
  }},
  "quality_read": {{
    "verdict": "positive" | "negative" | "mixed" | "no_evidence",
    "n_mentions": <count>,
    "summary": "<plain sentences on fabric/material/build, from reviews only>",
    "quotes": [...]
  }},
  "photo_reality": {{
    "verdict": "matches" | "differs" | "mixed" | "no_evidence",
    "n_mentions": <count>,
    "summary": "<...>",
    "quotes": [...]
  }},
  "worth_read": {{
    "verdict": "worth_it" | "not_worth_it" | "mixed" | "no_evidence",
    "n_mentions": <count>,
    "summary": "<what buyers say about value for the price>",
    "quotes": [...]
  }},
  "bottom_line": "<2-4 sentences answering the shopper's doubt directly, in
    the voice of a straight-talking friend. Ground every claim in the counts
    above. If the honest answer is 'the reviews do not settle this', say so
    and say what is known instead.>",
  "gaps": ["<questions of the shopper's kind that these reviews do not answer>"]
}}

At most 4 quotes per section, each verbatim from a review, max 25 words.
Counts must be real counts of reviews, not guesses."""


def parse_brief(raw: str):
    t = raw.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[1] if "\n" in t else t
        t = t.rsplit("```", 1)[0]
    start = t.find("{")
    if start == -1:
        raise ValueError("no JSON in model output")
    obj, _ = json.JSONDecoder().raw_decode(t[start:])
    return obj


def verify_quotes(brief, product):
    """Drop any quote that is not actually a substring of a fetched review.
    The no-invention rule, enforced mechanically."""
    texts = " ||| ".join(str(r["text"]) for r in product["reviews"]).lower()
    for section in ("size_read", "quality_read", "photo_reality", "worth_read"):
        sec = brief.get(section) or {}
        kept = []
        for q in (sec.get("quotes") or []):
            qt = str(q.get("text") or "").strip()
            if qt and qt.lower().strip('."’“” ') in texts:
                kept.append({"n": q.get("n"), "text": qt})
        sec["quotes"] = kept
        brief[section] = sec
    return brief


def make_brief(product, doubt_key):
    import anthropic
    client = anthropic.Anthropic()
    resp = client.messages.create(
        model=BRIEF_MODEL,
        max_tokens=4000,
        messages=[{"role": "user",
                   "content": build_brief_prompt(product, doubt_key)}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text")
    return verify_quotes(parse_brief(text), product)
