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
Counts must be real counts of reviews, not guesses.

Decisiveness rule: confidence must match the evidence, in both directions.
When the reviews are strongly positive and nothing in them argues against
the purchase, say that plainly, e.g. "Nothing in these reviews argues
against buying this one." Never soften an earned yes. Never inflate a
weak one."""


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


VERDICT_SAFETIES = ("looks_safe", "has_risks", "reviews_cant_settle")


def build_verdict_prompt(product):
    reviews_block = "\n".join(
        f'[{i + 1}] rating={r.get("rating", "?")} :: '
        + str(r["text"]).strip()[:300]
        for i, r in enumerate(product["reviews"]))
    return f"""You are ranking items in an online shopper's wishlist by how safe each is
to buy, using ONLY that item's real buyer reviews. Be the careful friend:
grounded, honest, never pushy. "The reviews cannot settle it" is a valid
verdict.

ITEM: {product['brand']} - {product['name']} - price {product['price']}
Average rating: {product['rating']} from {product['rating_count']} ratings.

BUYER REVIEWS ({len(product['reviews'])} total):
{reviews_block}

Return ONLY a JSON object, no fences:
{{
  "safety": "looks_safe" | "has_risks" | "reviews_cant_settle",
  "headline": "<one sentence: the single most decision-relevant fact from
    these reviews>",
  "risk": "<the main risk a buyer should know, one sentence, or empty
    string if none surfaced>",
  "size_note": "<one short sentence on sizing if reviews mention it,
    else empty string>",
  "key_quote": {{"n": <review number>, "text": "<the single most useful
    verbatim quote, max 25 words>"}},
  "evidence_strength": "strong" | "thin"
}}

"looks_safe" needs consistent positive evidence with no repeated complaint.
"has_risks" means a concrete repeated problem (sizing, quality, colour).
"reviews_cant_settle" means too few or too vague reviews. Never invent.
For a "looks_safe" item, the headline should be plainly confident, not
hedged: the evidence earned it."""


def make_verdict(product):
    """Compact per-item verdict for the wishlist ranking view."""
    import anthropic
    client = anthropic.Anthropic()
    resp = client.messages.create(
        model=BRIEF_MODEL,
        max_tokens=1000,
        messages=[{"role": "user",
                   "content": build_verdict_prompt(product)}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text")
    v = parse_brief(text)
    if v.get("safety") not in VERDICT_SAFETIES:
        v["safety"] = "reviews_cant_settle"
    # the no-invention rule, applied to the quote
    q = v.get("key_quote") or {}
    texts = " ||| ".join(str(r["text"]) for r in product["reviews"]).lower()
    qt = str(q.get("text") or "").strip()
    if not qt or qt.lower().strip('."’“” ') not in texts:
        v["key_quote"] = None
    return v


def rank_wishlist(verdicts):
    """Order: safest first, unsettled last; more reviews break ties."""
    order = {"looks_safe": 0, "has_risks": 1, "reviews_cant_settle": 2}
    return sorted(
        verdicts,
        key=lambda pv: (order.get(pv["verdict"]["safety"], 3),
                        -len(pv["product"]["reviews"])))


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
