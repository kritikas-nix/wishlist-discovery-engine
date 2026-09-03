# Part 4 — Problem definition

## The problem, in one sentence

Shoppers save items they genuinely want, but at the moment of decision the
information that would let them commit — will it fit me, is the quality real,
is it worth this price — either does not exist on the page or is not believed,
so the purchase is postponed indefinitely and the wishlist becomes a parking
lot for unresolved doubt.

## Target segment

Wishlist users with purchase intent: people who save items planning or
seriously considering buying them (survey: 7 of 16 respondents describe their
wishlist use as "planning to buy soon", another 5 as "a mix"). Ages 19 to 30
in the survey, 24 to 42 in the six interviews; students and working shoppers, buying mid-range
fashion (₹500–6,000 items in their actual wishlists).

## The product outcome to influence

Increase the share of high-intent wishlist users who resolve
product-evidence uncertainty and progress at least one saved item toward
purchase. (Outcome tree: re-engage, resolve consideration, complete; the
evidence puts the binding leak at resolve-consideration.)

## Root cause

The information needed to commit is not credible or not personal enough at
the point of decision:

- Engine (n=427 relevant public items, from 3,183 collected): the top
  blocker is distrust of the seller, photos or reviews (106), with
  worth-the-money doubt a close second (99), then size (53) and quality
  (42). Doubts about the product's information outnumber doubts about
  oneself 172 to 38.
- Survey (n=16, 39 item-anchored answers): the same doubt expressed
  personally, "not sure it would suit me" (12), quality (10), worth the
  price (10), size (8). Asked what one guaranteed-true fact they would want,
  respondents wrote: "Will this still feel worth the money after six
  months", "What is the biggest reason I might regret buying this",
  "size is accurate or not", "Does it have polyester".
- The two evidence streams are distinct, not fully independent (the survey's
  options were informed by engine themes, with open text left free), and
  they describe one gap from two angles: public complaints blame the
  platform's information; item-anchored answers phrase the same gap as
  unanswered personal questions.
- Sharper root cause: Myntra already has the evidence shoppers need, but it
  is scattered across photos, ratings and hundreds of buyer reviews, and
  the platform never converts it into a trustworthy answer to the shopper's
  specific doubt. So users perform that synthesis themselves, across
  reviews, friends and competing apps.

## Existing workarounds (evidence the need is real)

Users already do the work our solution automates, manually and off-platform:
- Engine: checking the same item on another app is the most common named
  workaround (53 of 427; most items mention no workaround at all, which is
  counted honestly rather than guessed).
- Survey: 10 of 16 screenshot to a friend or family member, 9 check other
  buyers' photos, 8 read low-star reviews specifically, 4 measure against
  a garment they own, 3 check the item on a rival app.
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
- The workaround data shows the decision work currently happens
  off-platform (53 of 427 check the same item on a rival app), creating
  purchase-leakage risk to competing platforms. Keeping doubt-resolution
  inside Myntra keeps the decision, and its purchase, inside Myntra.
- It requires no discounting: it monetises information Myntra already owns
  (its own review corpus) instead of margin.

## How the thinking evolved (the required chain)

Business metric (buy within 30 days of saving) → decomposed into
Return x Reconsider x Confidence x Complete → engine located the leak at
Confidence and split doubt into about-product vs about-self (4:1
about-product, led by trust) → survey on real wishlists confirmed the
doubt-shape and personalised it (suit ME, worth MY money), while testing
and weakening the rival hypothesis (forgotten items: 6 of 16 had
completely forgotten their bottom item; "I forgot" ticked 5 times in 39
item answers, far behind the doubt blockers) → problem defined as
credibility-of-information at the decision moment → MVP answers the
shopper's stated doubt from verbatim buyer evidence.

## Honest limits

Survey n=16 (raw counts only); its blocker list has no explicit "don't
trust" option, so the trust framing rests on the engine, free text, and
the calls (Caller 2: "what photos show and what gets delivered are two
different stories").
Public feedback over-represents complainers. Self-reported behaviour is
not observed behaviour. Six depth interviews were completed (interviews 4 to 6 discovery-first,
prototype shown only at the end); all six tested it live on their own
wishlist items. None of
these limits change the direction all sources point.
