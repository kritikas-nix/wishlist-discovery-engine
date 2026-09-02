# Part 4 — Problem definition

## The problem, in one sentence

Shoppers save items they genuinely want, but at the moment of decision the
information that would let them commit — will it fit me, is the quality real,
is it worth this price — either does not exist on the page or is not believed,
so the purchase is postponed indefinitely and the wishlist becomes a parking
lot for unresolved doubt.

## Target segment

Wishlist users with purchase intent: people who save items planning or
seriously considering buying them (survey: 6 of 14 respondents describe their
wishlist use as "planning to buy soon", another 4 as "a mix"). Age 19–30 in
our sample, students and early-career working shoppers, buying mid-range
fashion (₹500–6,000 items in their actual wishlists).

## The product outcome to influence

The confidence stage of the conversion chain (see metric decomposition):
share of wishlist item re-views that end in add-to-cart rather than another
postponement. The chain is Return x Reconsider x Confidence x Complete; the
evidence puts the binding leak at Confidence.

## Root cause

The information needed to commit is not credible or not personal enough at
the point of decision:

- Engine (n=243 relevant public items): the top blocker is distrust of the
  seller, photos or reviews (76), ahead of worth-the-money doubt (48),
  quality doubt (34) and size doubt (31). Doubts about the product's
  information outnumber doubts about oneself 118 to 29.
- Survey (n=14, 33 item-anchored answers): the same doubt expressed
  personally — "not sure it would suit me" (11), quality (9), worth the
  price (9), size (8). Asked what one guaranteed-true fact they would want,
  respondents wrote: "Will this still feel worth the money after six
  months", "What is the biggest reason I might regret buying this",
  "size is accurate or not", "Does it have polyester".
- The two sources describe one gap from two angles: public complaints blame
  the platform's information ("can't trust the photos"); item-anchored
  answers phrase it as unanswered personal questions ("will it suit ME").

## Existing workarounds (evidence the need is real)

Users already do the work our solution automates, manually and off-platform:
- Engine: checking the same item on another app is the most common invented
  workaround (45 of 243); reading low-star reviews specifically (180
  mention no workaround, making this the largest named one).
- Survey: 9 of 14 read low-star reviews, 8 check other buyers' photos,
  6 screenshot to a friend or family member, 5 check the item on a rival
  app, 4 measure against a garment they own.
Every workaround is an attempt to obtain one credible answer. Each one takes
the user off Myntra at the exact moment they were closest to buying.

## Why solving it creates user value

The user is not asking to be persuaded; they are asking for their own
question to be answered truthfully. Doing their review-homework for them
saves the 20–40 minutes of cross-checking they currently spend, and an
honest "the reviews do not settle this" saves them from a regretted
purchase — the exact regret their free-text answers fear.

## Why it makes business sense

- Every resolved doubt moves an item across the last stage before checkout;
  the business metric counts exactly these conversions.
- The workaround data shows the decision currently happens off-platform,
  where a competitor can win it (engine: bought_elsewhere outcomes).
  Keeping doubt-resolution inside Myntra keeps the purchase inside Myntra.
- It requires no discounting: it monetises information Myntra already owns
  (its own review corpus) instead of margin.

## How the thinking evolved (the required chain)

Business metric (buy within 30 days of saving) → decomposed into
Return x Reconsider x Confidence x Complete → engine located the leak at
Confidence and split doubt into about-product vs about-self (4:1
about-product, led by trust) → survey on real wishlists confirmed the
doubt-shape and personalised it (suit ME, worth MY money), while testing
and weakening the rival hypothesis (forgotten items: only 4 of 14 had
completely forgotten their bottom item; "I forgot" ticked twice in 33
item answers even though the option existed) → problem defined as
credibility-of-information at the decision moment → MVP answers the
shopper's stated doubt from verbatim buyer evidence.

## Honest limits

Survey n=14 (raw counts only); its blocker list has no explicit "don't
trust" option, so the trust framing rests on the engine and free text.
Public feedback over-represents complainers. Self-reported behaviour is
not observed behaviour. The follow-up call channel exists (one opt-in) for
depth. None of these limits change the direction all sources point.
