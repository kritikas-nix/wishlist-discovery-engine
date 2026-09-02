# Part 7 — Why this could fail, and what we do about it

Risks specific to this solution, ranked by how much damage each could do.

## 1. The brief is honest and honesty reduces short-term sales
An evidence-only brief will sometimes say "buyers report thin fabric" or
"the reviews cannot settle your question". Some of those users will not buy.
*Mitigation:* measure at the account level and over 30 days, not per item:
the research shows undecided users currently leave to cross-check and often
buy elsewhere or nowhere. A trusted "no" that keeps the user's next decision
on Myntra beats an untrusted silence that loses the session. The A/B is
designed on the north-star window, so this trade is measured, not assumed.
If briefed cohorts show lower 30-day wishlist conversion, the bet is wrong
and we stop — the metric design makes that visible fast.

## 2. Model hallucination breaks the one thing the product sells: trust
One invented quote and the credibility premise collapses.
*Mitigation already built, not planned:* every quote is machine-checked as a
verbatim substring of a fetched review and dropped if it is not; counts are
counts of real reviews; "no_evidence" is a first-class verdict. Guardrail
metric 2 keeps the "can't settle it" share visible so nobody tunes honesty
out. Residual risk: summaries (not quotes) can still overreach; periodic
human audit of a brief sample against source reviews.

## 3. Thin or gamed review bases give confident-sounding nonsense
Many items have few reviews; some categories have incentivised ones.
*Mitigation:* the brief states evidence strength ("only 4 of 22 reviews
mention fit") and degrades to "reviews cannot settle it" below a floor;
roadmap: weight verified purchases and brand-level evidence when the item's
own base is thin.

## 4. Latency kills adoption
A 30–60 second wait is fine in a prototype, fatal in a product flow.
*Mitigation:* in production the brief is precomputed per item (batch, cached,
refreshed as reviews arrive), not generated per view; the per-user doubt
then selects which precomputed section leads. Cost falls with caching too:
one generation serves every viewer of that item.

## 5. Research base is small and skewed
Survey n=14, no trust tick-box in the form; public data over-represents
complainers; both are self-reported.
*Mitigation:* stated openly in the deck; the two sources have opposite
biases and point the same way, which is why the problem was chosen; the
in-product A/B is the real test and is specified before scaling.

## 6. Prototype-specific fragility (demo day risk)
Myntra can block live scraping at the moment a grader tests the app.
*Mitigation already built:* three real items are pre-cached, so the full
workflow is testable even if live fetching is blocked; the app says so
honestly instead of erroring.
