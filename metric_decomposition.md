# Part 2 — Breaking down the business metric

**Business metric:** % of users who purchase at least one item from their
wishlist within 30 days of adding it.

## The outcome tree a saved item has to survive

The business metric is user-level: a user converts if any one of their saved
items gets bought within 30 days. So this is an outcome tree, not a strict
multiplication: one user has many items, and conversion can come from any of
them. Three product outcomes have to happen for at least one item:

```
Goal: user buys >= 1 wishlisted item within 30 days
  1. Re-engage            the user returns to / reconsiders a saved item
  2. Resolve consideration the doubt blocking that item gets resolved
  3. Complete purchase    the chosen item moves to cart and order
```

Under "resolve consideration", the doubt splits into: product-evidence
uncertainty, self-fit uncertainty, affordability, and comparison overload.
The research below measures which of those is biggest. None of the stage
rates were directly measurable from outside Myntra, and this document does
not pretend otherwise: the tree tells us where to look, the evidence tells
us which branch binds.

## Stage by stage

### 1. Save — was there ever an intent to buy?
Not every save is a shortlist. Some are mood-boarding, some are "get this out
of my feed". A user whose saves are all bookmarks can't convert no matter what
the product does, so segmentation by saving intent has to come before any
average.
- **Product outcome to influence:** share of saves that carry purchase intent
  (or: knowing which ones do).
- **What the data says so far:** engine, n=243 relevant items: intent_to_buy 49,
  compare 40, bookmark 2, unclear 152. Public text rarely states intent, which
  is exactly why the survey asks it directly (Q9).

### 2. Return — does anything bring the user back to the list?
An item nobody looks at again cannot be bought. This stage is about memory and
re-entry: does the user reopen the wishlist at all in 30 days, and does the
item get seen.
- **Product outcome:** wishlist revisit rate; share of saved items re-viewed
  within 30 days.
- **What the data says so far:** the engine can barely see this stage —
  forgot_never_returned was tagged once in 243, but people don't write public
  posts about items they forgot. **Survey Q27 (did you remember the bottom item
  existed?) is the real test of this stage.** If the forgotten rate is high,
  this stage, not doubt, is the binding constraint.

### 3. Reconsider — is the item still wanted when seen again?
Wants decay. Occasions pass, budgets close, the item sells out, a competitor
wins the purchase.
- **Product outcome:** share of re-viewed items still relevant (in stock, in
  budget, in season) at re-view.
- **What the data says so far:** engine: stock_unavailable 9, waiting_occasion 1,
  waiting_sale 5, bought_elsewhere signals in the outcome field. Small numbers
  individually; the survey's "still want it?" question (asked per item, by
  position) measures the decay curve directly.

### 4. Resolve the doubt — can the user get to "yes, this one"?
The user is looking at an item they want and still doesn't buy, because some
question is open. Whose question it is matters:
- doubt **about the product** — can't trust or can't find information (photos,
  fabric, real reviews, seller);
- doubt **about themselves** — has the information, can't map it to their own
  body, taste, or plans;
- doubt **about context** — event, budget, timing outside the app.
- **Product outcome:** share of wishlist item views that end in add-to-cart
  (doubt resolved) rather than another postponement.
- **What the data says so far (the engine's headline):** of 243 relevant items,
  trust_platform 76 and quality_material 34 dwarf fit_size 31; and doubts split
  **about_product 118 vs about_self 29 — 4 to 1**. The dominant open question
  is "can I believe what the listing shows me", not "will it suit me".
  Workarounds confirm it: checking the same item on another app (45) is the top
  invented workaround — users leave Myntra to verify Myntra.

### 5. Complete — does the purchase go through?
Cart to payment. Mostly checkout mechanics, delivery/return terms, COD
availability. The engine filters most of this out as post-purchase or
irrelevant; nothing here suggests it's the binding stage for wishlist
conversion specifically, and it's the best-instrumented stage internally.

## Where the leak seems to be, and what decides it

Two candidate binding constraints have survived the analysis so far:

1. **Confidence (stage 4), specifically information credibility** — backed by
   the engine at scale, but from review-shaped public text that over-represents
   people mid-decision.
2. **Return (stage 2), items simply forgotten** — nearly invisible to the
   engine by construction, and exactly what survey Q27 measures on real
   wishlists.

The survey decides between them (or shows they bind for different segments —
the brief's own fit-vs-price example, transposed). The blocker lists in the
survey (Q16/Q21/Q26) share keys with the engine's taxonomy, so the two sources
compare on one axis, and divergence is itself a finding.

## Notes on honesty
- Engine n's are small once cross-tabbed; counts are reported, not
  percentages, below n=20.
- Public feedback is self-selected; forgotten items and silent churn are
  structurally under-counted there. Stated in the deck, not hidden.
