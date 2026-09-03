# Tag validation audit

A blind check of the engine's labels. 40 items were sampled from the tagged
corpus (20 the model called relevant, 10 post-purchase, 10 irrelevant,
shuffled), stripped of their tags, and labelled again from scratch by a
second reviewer who could not see the model's answers. Files:
`data/validation_blind.json` (what the reviewer saw),
`data/validation_key.json` (the model's answers),
`data/validation_results.json` (the comparison).

## Results (n = 40)

| Check | Agreement |
|---|---|
| Relevant vs not relevant | 32 of 40 |
| Exact relevance class (4-way) | 28 of 40 |
| Blocker identity, when both said relevant | 11 of 12 |
| Doubt type (about_product / about_self / about_context) | 7 of 12 |

## What the disagreements say

All 8 relevance disagreements point the same direction: the model counted
borderline items as purchase decisions that a strict human reads as general
platform chatter (praise for an app, generic "everything on Instagram is a
scam" advice, brand suggestions to a YouTuber). The human never called
something relevant that the model had excluded.

Two consequences, stated honestly:

1. The relevant pool (n=243) is somewhat overcounted, and since several of
   the over-included items carry trust-of-platform language, the top
   blocker's count (trust) is likely a few items generous.
   The finding itself survives: even discounting every audited
   over-inclusion, trust-shaped doubt stays the largest blocker, and the
   survey's free-text answers point the same way independently.
2. When the model and the human agree an item is a real purchase decision,
   they almost always agree on what is blocking it (11 of 12). The blocker
   axis, which the MVP is built on, is the sturdiest part of the schema.
   The doubt-type axis (7 of 12) is fuzzier and is treated as directional
   evidence, not precise measurement.

## Limits of the audit itself

One reviewer, 40 items, and the reviewer is part of the project team. A
proper study would use two independent labellers and a larger sample. This
audit is a spot check, run because an unchecked model label is not
evidence; it found a real bias and its direction, which is what a spot
check is for.
