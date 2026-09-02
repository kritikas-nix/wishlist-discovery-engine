# Part 6 — Defining success

Start from the business metric, then the metrics the solution can actually
move, then the guardrails that keep a win honest.

## North star (the company goal, unchanged)

**% of users who purchase at least one wishlisted item within 30 days of
adding it.** The solution influences this through one stage of the chain
(Confidence), so the metrics below ladder up to it.

## Primary product metric

**Doubt-resolution rate:** share of "Worth a look?" briefs after which the
user takes a decisive action on the item — add to cart, or deliberately
remove from wishlist — within the session.
*Why:* the product's promise is turning "not sure" into a decision. Both
decisive outcomes count on purpose: a confident removal is a success for
the user and cleans intent signal for Myntra; only continued limbo is
failure. Measured from brief-view to action events.

## Leading indicators (move within days, predict the north star)

1. **Wishlist-to-cart rate on briefed items vs un-briefed items** — the
   cleanest causal read the metric allows; in-product A/B when integrated.
   *Why:* directly the Confidence stage of the decomposition.
2. **Brief adoption:** share of wishlist item views where the user opens
   the brief. *Why:* no adoption, no effect; also tests whether users
   want the answer where we put it.
3. **Off-platform bounce after brief:** share of users who still leave to
   cross-check (competitor app, YouTube) after reading a brief, versus the
   research baseline where cross-checking is the top workaround.
   *Why:* the brief exists to replace exactly that journey.

## Guardrail metrics (a win is invalid if these degrade)

1. **Return rate of briefed purchases** must be at or below the category
   baseline. *Why:* if briefs talk people into purchases that come back,
   we moved the metric by borrowing from the returns line. An honest brief
   should, if anything, lower returns (better-informed sizing).
2. **"Reviews can't settle it" share stays visible.** The brief must keep
   saying "no evidence" when there is none (target: tracked, never
   optimised down). *Why:* the moment the system stops saying "I don't
   know", it becomes a persuasion engine and both trust and the returns
   guardrail fail. This is the no-invention rule as a metric.
3. **Wishlist save rate does not fall.** *Why:* if honest briefs make
   users save less (fear of being told no), we traded top-of-funnel for
   conversion; watch it.

## Instrumentation honesty

The deployed prototype can log brief requests, doubt chosen, and verdict
shown. Cart and purchase events require Myntra-side integration, so
wishlist-to-cart and return-rate guardrails are specified for the in-product
A/B, not claimed as measured today. Stating that boundary in the deck.
