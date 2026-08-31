"""
taxonomy.py
The classification schema for the Myntra wishlist discovery engine.

This file is the part that makes this a discovery engine rather than a
summariser. Everything else is plumbing. Each piece of collected text gets
tagged against these fields, which is what lets you count, cross-tab and
compare opportunity areas instead of just describing sentiment.
"""

# ---------------------------------------------------------------------------
# 1. RELEVANCE
# Most scraped text is about delivery, refunds or app bugs. Filter first,
# so your denominators mean something.
# ---------------------------------------------------------------------------

RELEVANCE = [
    "deferred_purchase",   # saved, shortlisted, thinking about buying, did not buy yet
    "purchase_decision",   # deciding between options, researching before buying
    "post_purchase",       # arrived and was wrong, returns, sizing after delivery
    "irrelevant",          # app crashes, delivery delays, refunds, customer service
]

# ---------------------------------------------------------------------------
# 2. BLOCKER TYPE
# What is stopping the purchase. Multi-label: one comment can carry two.
# These map 1:1 to the tick box list in your survey (Q16/Q21/Q26) so the
# scraped data and the survey data can be compared on the same axis.
# ---------------------------------------------------------------------------

BLOCKERS = {
    "fit_size":            "Unsure of size or measurements",
    "suitability_on_me":   "Unsure it will look good on their body or skin tone",
    "quality_material":    "Unsure of fabric, build or durability",
    "price_absolute":      "Cannot afford it right now",
    "price_worth":         "Can afford it, unsure it is worth the money",
    "waiting_sale":        "Waiting for a discount or price drop",
    "waiting_occasion":    "Waiting for an event or season",
    "social_validation":   "Wants someone else's opinion first",
    "forgot_never_returned": "Saved it and never came back to the list",
    "stock_unavailable":   "Size or item went out of stock",
    "returns_friction":    "Return or exchange process is the deterrent",
    "decision_overload":   "Too many options, cannot choose",
    "trust_platform":      "Does not trust the seller, photos or reviews",
    "none_stated":         "No blocker given",
}

# ---------------------------------------------------------------------------
# 3. UNCERTAINTY OBJECT
# The axis that most teams miss, and the one most likely to earn you a slide.
#
# Two people both say "not sure about the fit" and mean completely different
# things. One does not know the garment's measurements, which is a product
# information problem. The other knows the measurements and does not know how
# they map to her own body, which is a self-knowledge problem.
#
# These need different solutions, so counting them separately is how you
# choose what to build in Part 5.
# ---------------------------------------------------------------------------

UNCERTAINTY_OBJECT = [
    "about_product",    # I do not know enough about the item
    "about_self",       # I do not know how it relates to me, my body, my plans
    "about_context",    # depends on an event, budget or timing outside the app
    "not_applicable",
]

# ---------------------------------------------------------------------------
# 4. WORKAROUND
# Part 4 asks you to name existing workarounds. A workaround someone invented
# without being asked is the strongest evidence of an unmet need there is.
# ---------------------------------------------------------------------------

WORKAROUNDS = {
    "ask_friend":        "Screenshot or share to a person or group chat",
    "review_photos":     "Looks for customer photos in reviews",
    "negative_reviews":  "Reads low star reviews specifically",
    "youtube_search":    "Searches YouTube for the brand or item",
    "instagram_search":  "Searches Instagram or looks at creators",
    "competitor_check":  "Checks the same item on another app",
    "size_chart_compare":"Measures a garment they own against the chart",
    "offline_try":       "Tries the size in a physical store first",
    "order_two_sizes":   "Orders multiple sizes intending to return one",
    "none":              "No workaround mentioned",
}

# ---------------------------------------------------------------------------
# 5. SAVING INTENT
# The bookmark versus intent question the brief asks directly.
# ---------------------------------------------------------------------------

SAVING_INTENT = [
    "intent_to_buy",    # shortlist, planning to purchase
    "bookmark",         # collecting, mood board, might never buy
    "compare",          # saved several to choose between
    "declutter",        # saved to remove it from the feed
    "unclear",
]

# ---------------------------------------------------------------------------
# 6. SEGMENT SIGNAL
# Weak but occasionally present. Never invent it. "unclear" is the honest
# default and will be the majority of your corpus.
# ---------------------------------------------------------------------------

SEGMENT = ["student", "working_early", "working_established", "unclear"]

# ---------------------------------------------------------------------------
# 7. OUTCOME
# Whether the deferred purchase ever resolved.
# ---------------------------------------------------------------------------

OUTCOME = [
    "bought_eventually",
    "bought_elsewhere",
    "abandoned",
    "still_pending",
    "unclear",
]


# ---------------------------------------------------------------------------
# The prompt sent to the model for each item.
# ---------------------------------------------------------------------------

def build_prompt(text: str, source: str) -> str:
    blockers = "\n".join(f"  {k}: {v}" for k, v in BLOCKERS.items())
    workarounds = "\n".join(f"  {k}: {v}" for k, v in WORKAROUNDS.items())

    return f"""You are tagging a piece of public user feedback about online fashion shopping in India, for product research.

SOURCE: {source}

TEXT:
\"\"\"{text}\"\"\"

Tag it against the schema below. Return ONLY a JSON object, no preamble, no markdown fences.

relevance: one of {RELEVANCE}
  Use "irrelevant" for anything about delivery delays, refunds already in
  progress, app crashes or customer service. Be strict. Most text is irrelevant.

blockers: array of keys from this list. Empty array if none apply.
{blockers}

uncertainty_object: one of {UNCERTAINTY_OBJECT}
  "about_product" = they lack information about the item itself.
  "about_self" = they have the information and cannot map it to their own body,
     taste or life. e.g. knows the measurements, does not know if it suits her.
  "about_context" = blocked on an event, budget or date outside the platform.

workarounds: array of keys from this list. Empty array if none mentioned.
{workarounds}

saving_intent: one of {SAVING_INTENT}
segment: one of {SEGMENT}
outcome: one of {OUTCOME}

evidence: a verbatim quote of at most 20 words from the text that best supports
  your blocker tags. Empty string if relevance is "irrelevant".

confidence: "high", "medium" or "low". Use "low" when you are inferring rather
  than reading. Do not guess to fill fields. "unclear" and empty arrays are
  correct answers when the text does not say.

JSON only."""
