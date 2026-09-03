# Deck outline: NL Myntra (10 slides)

Rules honored: titles state the message, not the topic. No name anywhere.
Minimum 14pt. Colourblind-safe palette (the site's berry/blue/green set,
already validated). Numbers marked [R] refresh after the scaled corpus is
tagged tonight; everything else is final.

---

## Slide 1 (title)
**Saved. Never bought.**
Sub: Why Myntra wishlists fill up while purchases don't follow, and the
working product that fixes the reason.
Footer links: Live site (worth-a-look-sable.vercel.app) · Discovery engine
(/engine) · Prototype (/mvp) · Survey form
Visual: the product-image strip from the site, muted.

## Slide 2
**The metric leaks at one stage: Confidence.**
Wishlist conversion = Return x Reconsider x Confidence x Complete.
One line per stage, plain words. The evidence arrow: both research streams
point at Confidence as the binding leak.
Visual: 4-stage chain diagram with the Confidence stage highlighted.

## Slide 3
**We didn't guess the problem. We counted it: 1,309 [R] real conversations.**
The engine in one strip: Collect, Filter, Tag, Count (the site's 4 cards).
Blocker chart, n=243 [R]: trust 76 leads, worth 48, quality 34, size 31.
Note under chart: tagging audited by a blind 40-item human re-check
(32/40 relevance, 11/12 blocker agreement; bias direction disclosed).
Link: the engine page, live and testable.

## Slide 4
**The doubt is about the product's information, not the shopper's body. 4:1.**
Split chart: about_product 118 vs about_self 29 [R].
Right side: the workarounds users invented, topped by checking the same
item on a rival app (45) [R]. Line: the decision is being made off Myntra.

## Slide 5
**16 real wishlists said the same thing, in personal words.**
Survey: item-anchored, 39 item answers. Top blockers: suit me 12, quality
10, worth 10. Verbatim asks: "Will this still feel worth the money after
six months?"
Honesty box: engine and survey have opposite biases and point the same
way; forgotten items exist (6 of 16) but doubt dominates, so resurfacing
went to the roadmap, not the MVP.

## Slide 6
**Problem: at the decision moment, the information needed to commit does
not exist or is not believed.**
The evolution chain in one line: Business metric -> decomposition ->
engine -> survey -> this problem.
Segment: wishlist users with purchase intent, 19 to 30, mid-range fashion.
Why business: purchases leak to rivals during off-platform homework; no
discounting needed, the fix monetises information Myntra already owns.

## Slide 7
**Worth a look? does the shopper's homework. Evidence, not persuasion.**
Product shots: doubt chips + a real brief (the kurta example), the
wishlist ranking with safety badges.
Coverage line: directly answers the blockers on 160 of 243 [R] relevant
items; zero monetary incentives.
Link: the prototype, live, works on any real Myntra link.

## Slide 8
**Its yes is worth believing, because the same voice says no.**
The honesty mechanics: quotes machine-checked verbatim, real counts,
"reviews can't settle it" as a first-class verdict, earned decisiveness.
A real screenshot of a "has risks" verdict. Line: because the #1 blocker
is distrust, credibility is the growth mechanic.

## Slide 9
**Success: doubt resolved, carts filled. Guarded by returns and honesty.**
Primary: doubt-resolution rate (brief -> decisive action). Leading:
wishlist-to-cart on briefed items (A/B), brief adoption, off-platform
bounce. Guardrails: return rate must not rise; the "can't settle" share
stays visible; save rate holds. Note: the prototype already logs the
primary signal.

## Slide 10
**What could break it, and what's next.**
Top risks with mitigations (honesty costs sales -> account-level A/B;
hallucination -> mechanical quote check, already built; thin reviews ->
says so; latency -> precompute in product). Roadmap: inside the wishlist
UI, resurfacing layer, review-vetted alternatives, brand-level evidence,
any catalog with reviews.

---

Build plan: PPTX via python-pptx, charts rendered from findings.json with
the validated palette, then export PDF, name "NL Myntra", check under
40MB, verify every link in incognito.
