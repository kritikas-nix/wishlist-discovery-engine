# Part 7 — Why this could fail, and what we do about it

Risks specific to this solution, ranked by damage. Each has a mitigation,
several already built rather than promised, and the first has an explicit
kill criterion.

## 1. Honesty reduces short-term sales
Truthful briefs will sometimes say "buyers report thin fabric" and lose
that sale.
*Mitigation:* measured at the user level over the 30-day window, where a
trusted no beats an untrusted silence; the experiment makes the trade
visible fast. *Kill criterion:* if treatment users convert no better, or
worse, than control over 30 days, the bet is wrong and the feature stops.

## 2. The AI creates a second trust problem
The #1 blocker is "I don't trust Myntra's reviews", and the solution asks
users to accept an AI reading of those same reviews. "If I don't trust the
reviews, why trust your AI's summary of them?"
*Mitigation, visible in the product, not promised:* the product never asks
the shopper to trust an AI opinion. Every conclusion is traceable: the
count of reviews behind it is shown, quotes are word for word and
machine-checked against the source, negative evidence is surfaced rather
than smoothed over, nothing is sponsored or ranked for commercial reasons,
and the shopper can always open the source reviews themselves. The next
priority on this axis is verified-purchase weighting, because otherwise
the AI is only processing possibly-manipulated evidence more efficiently.

## 3. Model hallucination breaks the product's one asset
One invented quote and the credibility premise collapses.
*Mitigation already built:* every quote is machine-verified as a verbatim
substring of a fetched review and dropped if it is not; counts are counts;
"no evidence" is a first-class verdict; the tagging pipeline itself was
blind-audited by a human (32/40 relevance, 11/12 blocker agreement, bias
direction published).

## 4. Thin or gamed review bases give confident nonsense
Many items have few reviews; some categories attract incentivised ones.
*Mitigation:* the brief states evidence strength ("only 4 of 22 reviews
mention fit") and degrades to "not enough evidence" below a floor;
verified-purchase weighting and brand-level evidence come next.

## 5. Latency kills adoption
20 to 60 seconds per live read is acceptable in a prototype, fatal in a
product flow.
*Mitigation:* in production, briefs are precomputed per item in batch,
cached, and refreshed as reviews arrive; one generation serves every
viewer; the shopper's chosen doubt only selects which section leads.

## 6. The prototype's live fetching is brittle
Scraping myntra.com can fail from anti-bot measures or page changes, and a
grader may hit that moment.
*Prototype mitigation:* one automatic retry, honest error copy, and real
cached sample items that always work.
*Production distinction, stated deliberately:* the production mitigation
is not better scraping; it is that Myntra's own product would read its
internal reviews and catalog services directly. The scraping exists only
because this prototype lives outside the company.

## 7. The research base is small and biased
Survey n=16; public feedback over-represents complainers; the two evidence
streams are distinct but not fully independent.
*Mitigation:* stated openly everywhere; opposite-bias sources agree;
trust share is stable across sources (24% Play Store, 27% YouTube, 29%
Reddit among deliberations); the corpus was grown 2.4x and findings held;
the tagging audit is published. The experiment is the real test and is
specified before scaling.
