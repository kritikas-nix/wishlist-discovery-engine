# Part 6 — Defining success

Start from the business metric, then the metrics the solution can move,
then guardrails so a win cannot be faked. Metrics are layered so that no
single one can be gamed in the wrong direction.

## Experiment success (the north star, made testable)

**30-day wishlist-to-purchase conversion uplift:** % of treatment users who
purchase at least one previously wishlisted item within 30 days, versus
control.
*Design:* randomize **users, not items**, because the metric is user-level
and one person holds many saved items; item-level randomization would let
a user learn from a briefed item while another of their items sits in
control. Treatment: the wishlist carries the evidence brief. Control: the
normal wishlist.
*Why:* this is the assignment's metric, verbatim, made falsifiable.

## Primary leading indicator

**Wishlist-to-cart conversion among treatment users versus control users**
(item-level briefed-vs-unbriefed analysis as a secondary read).
*Why:* the closest measurable step to purchase that the product directly
influences, and it moves within days rather than 30.

## User-value diagnostic (not a growth metric)

**Decision-resolution rate:** share of briefs followed by a decisive
action, either add-to-cart or deliberate removal from the wishlist.
*Why it is diagnostic, not primary:* a confident removal is a good outcome
for the user and cleans intent signal, but a product that only produced
removals would score perfectly on this while conversion collapsed. So it
lives here, as a check that the product creates decisions, never as the
success claim. The deployed prototype already logs this signal (settled?
buy / keep / remove).

## Secondary leading indicators (all internally measurable)

1. **Brief adoption:** share of wishlist item views where the brief is
   opened. No adoption, no effect.
2. **Time-to-decision:** days from save to cart-or-removal, briefed vs
   un-briefed. The product's mechanism is collapsing "later" into "now".
3. **Wishlist revisits before cart:** briefed items should need fewer
   return visits before a decision.
4. **In-product micro-question during the experiment** ("did this answer
   your doubt?"), replacing any attempt to observe off-platform behaviour,
   which is not reliably measurable without inappropriate tracking.

## Guardrails (a win is invalid if these degrade)

1. **Return rate of briefed purchases** at or below category baseline. If
   briefs talk people into purchases that come back, the metric was moved
   by borrowing from the returns line. An honest brief should, if
   anything, lower returns through better-informed sizing.
2. **The "reviews can't settle it" share stays visible** and is never
   optimised downward. The moment the system stops saying "I don't know",
   it becomes a persuasion engine and the trust premise dies. This is the
   no-invention rule expressed as a metric.
3. **Wishlist save rate does not fall**, guarding against honest briefs
   making users afraid to save.

## The honest boundary

The research proves the constraint (evidence doubt blocks 211 of 427
deliberations) and the mechanism (three real users moved from limbo to
decisions). The experiment measures the lift. No lift number is claimed
before it runs.
