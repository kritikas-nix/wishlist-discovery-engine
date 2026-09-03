# NL Myntra deck: the full content of every slide

For each slide: what it must communicate, the complete content with every
number and its source, the visual, and the question a grader is most likely
to ask with its answer.

---

## Slide 1: Title

**Message:** Saved. Never bought.

**What this slide must communicate.** The whole project in one breath: users
save things they want and then do not buy them; this project found out why
and built the fix. It must also establish, immediately, that everything is
real and live, because that is the project's biggest differentiator.

**Full content.**
- The tension: wishlists on Myntra fill up, purchases do not follow. The
  brief deliberately did not name the reason. Finding it was the assignment.
- The scale of the work, in one line: 3,183 public conversations read by an
  AI engine, 16 real wishlists surveyed item by item, three 15-minute depth
  calls, and a deployed working product.
- The live links: the research site, the engine, the prototype. These are
  clickable in the PDF.

**Visual.** Dark berry background, huge serif title, a small grid of real
Myntra product photos (the actual items the prototype analyses).

**Likely question:** "Why should I believe any of this?" Answer: every claim
in the deck links to a live artifact you can test yourself, and every number
carries its sample size.

---

## Slide 2: The metric decomposition (Part 2)

**Message:** A saved item must survive four stages. The leak is at Confidence.

**What this slide must communicate.** That the business metric was broken
into parts before any research began, so the research had somewhere to look;
and that the evidence later pointed at one specific stage.

**Full content.**
- The company goal, verbatim: increase the percentage of users who purchase
  at least one item from their wishlist within 30 days of adding it.
- The decomposition: Wishlist conversion = Return rate x Reconsider rate x
  Confidence rate x Completion rate. In words: an item only converts if the
  user (1) comes back to the list, (2) still wants the item when they see it
  again, (3) resolves whatever doubt is blocking the purchase, and (4) gets
  through checkout. Miss any one stage and the metric does not move.
- Why each stage could have been the leak, and what the evidence said:
  - Return: items could simply be forgotten. Tested directly by survey Q27:
    6 of 16 respondents had completely forgotten their bottom wishlist item
    existed. Real, but moderate. Sent to the roadmap.
  - Reconsider: wants decay. Survey shows most saved items drift to "not
    sure I still want it" within a month or two. A symptom of stage 3, not
    a separate cause.
  - Confidence: the doubt stage. Both the engine (n=427) and the survey
    (n=16) put doubt-shaped blockers far ahead of everything else. This is
    the binding leak.
  - Complete: checkout mechanics. The engine filters these complaints out;
    nothing suggested this stage binds wishlist conversion specifically,
    and it is Myntra's best-instrumented stage already.
- The analytical discipline stated once, up front: every number in the deck
  carries its sample size; raw counts, not percentages, wherever n is under
  20; no invented data anywhere.

**Visual.** The four stages as boxes joined by multiplication signs, with
Confidence highlighted.

**Likely question:** "Why multiply the stages?" Answer: because they are
sequential dependencies; a saved item must pass through all four, so the
overall rate behaves like a product, and the smallest factor is the one
worth fixing first.

---

## Slide 3: The AI discovery engine (Part 1, Deliverable 1)

**Message:** A machine read 3,183 conversations. The #1 blocker is trust,
not price.

**What this slide must communicate.** How the engine works (the brief asks
for exactly this), why it is more than summarising, and its headline
finding with real numbers.

**Full content.**
- How it works, four steps:
  1. Collect: 3,183 real public posts and reviews. Sources: Google Play
     reviews of Myntra, Ajio and Nykaa Fashion (1,649); Myntra's own product
     review pages (843); YouTube comments on haul and sizing videos (521);
     Reddit posts and comments from Indian fashion communities (170).
  2. Filter: 1,381 items about deliveries, refunds and app crashes are
     removed first. They are complaints about operations, not purchase
     doubts. Without this filter every denominator would be meaningless.
  3. Tag: an AI model labels each remaining item against a fixed schema:
     what blocks the purchase (14 blocker categories), whose doubt it is
     (about the product / about oneself / about context), why the item was
     saved, what workaround the person used. The model is instructed never
     to guess: "unclear" and empty are valid answers.
  4. Count: the tags are counted and cross-tabulated. That turns stories
     into comparable numbers. This is what "beyond summarising" means: the
     output is a ranked, quantified list of opportunity areas, not a mood.
- The headline result (n = 427 items about a purchase being considered; one
  item can carry several blockers):
  - Cannot trust the photos, reviews or seller: 106 (25%)
  - Can afford it, unsure it is worth the money: 99 (23%)
  - Unsure of size or fit: 53 (12%)
  - Unsure of quality or fabric: 42 (10%)
  - Cannot afford it right now: 24 (6%)
  - Waiting for a sale: 17 (4%)
  Read the order: the two biggest blockers are credibility problems, not
  price or fit problems.
- The verbatim voice of the finding (Hindi, from a YouTube comment, tagged
  trust_platform): "इनके बहकावे में मत आना कोई बहुत बड़ा फ्रॉड चल रहा है
  mintra पर" (roughly: "don't fall for it, a huge fraud is running on
  Myntra").
- Rigor, stated on the slide because it is rare and earns marks:
  - The tagging was audited: 40 items re-labelled blind by a human;
    agreement 32/40 on relevance, 11/12 on the blocker when both called an
    item relevant. The model's one bias (counting borderline platform
    chatter as relevant) is disclosed on the live page.
  - The findings were stress-tested by growing the corpus 2.4x (1,309 to
    3,183 items); every conclusion held. That is the stopping rule: we
    stopped collecting when the findings stopped moving.
- The engine is live and testable: visitors can paste any text and watch it
  get tagged by the same prompt that built the dataset.

**Visual.** One horizontal bar chart of the top blockers (trust bar in
berry, rest in blue), plus a compact Collect-Filter-Tag-Count strip.

**Likely question:** "How do you know the AI tags are right?" Answer: we
checked; blind human re-labelling of 40 items agreed 80% on relevance and
92% on blockers, and the one bias it found is disclosed rather than hidden.

---

## Slide 4: The differentiating finding

**Message:** The doubt is about the product's information, not the
shopper's body. More than four to one.

**What this slide must communicate.** The single insight that decided what
to build. Two people can say "not sure about the fit" and mean different
things; separating them is what made the research decidable.

**Full content.**
- The split, defined: about_product = the shopper cannot find or believe
  facts about the item (its real look, fabric, sizing behaviour).
  about_self = the shopper has the facts but cannot map them to their own
  body, taste or plans.
- The numbers: 172 items carry product-doubt vs 38 self-doubt (n=427).
  Inside the 172, the leading blockers are trust (71), worth-the-money (43)
  and quality (42). Inside the 38: size or fit (23), suits-me (8).
- Why this decided the build: virtual try-ons, body scanners and style
  advisors all serve the 38. The 172 need something else entirely:
  believable information about the item. Solve for the majority.
- The corroborating behaviour, from the same data: the most common
  workaround users invented is checking the same item on a rival app
  (53 of 427). Others: reading one-star reviews specifically, hunting
  buyer photos, screenshotting to friends and family, trying sizes in
  offline stores. Every workaround is an attempt to obtain one credible
  answer, and every one happens off Myntra at the exact moment the user is
  closest to buying.
- The frame that ties it together: buying moved online, assurance did not.
  Every top blocker is a missing offline assurance channel: seeing the
  item, touching the fabric, trying the size, asking someone who knows.

**Visual.** The ratio itself, huge: 172 : 38. Nothing else needs to be big.

**Likely question:** "Why not build a fit/size solution? Fit is famous."
Answer: because the counted data says fit-style self-doubt is a quarter the
size of information-doubt, and fit doubts that do exist are mostly missing
product information (measurements, size-run behaviour) rather than
self-mapping problems.

---

## Slide 5: Primary research (Part 3)

**Message:** 16 real wishlists and three calls said the same thing, in
personal words.

**What this slide must communicate.** That the engine's finding was tested
against real people's actual saved items, using an instrument designed to
be comparable, plus depth interviews; and that the two methods have
opposite biases yet point the same way.

**Full content.**
- The instrument: an item-anchored survey. Each respondent opened their
  real Myntra wishlist and answered the same questions about their top
  item, a middle item, and the very bottom item. 16 respondents, 39 usable
  item answers. The survey's blocker tick-boxes deliberately mirror the
  engine's categories so the two datasets compare on one axis.
- Blocker results (raw counts, n under 20 per cell by design):
  - Not sure it would suit me: 12
  - Unsure of quality: 10
  - Not sure it is worth the price: 10
  - Unsure of size or fit: 8
  - "I forgot it was there": 5
  Doubt-shaped blockers dominate; timing and stock trail.
- The memory test (Q27): before scrolling, did you remember your bottom
  item existed? Knew: 5. Vaguely: 5. Completely forgotten: 6 of 16.
  Forgetting is real but not dominant; it became the roadmap's resurfacing
  item rather than the MVP.
- The three depth calls (survey opt-ins; all three tested the prototype
  live on their own wishlist items, covered on slide 8). Their words:
  - "Will this still feel worth the money after six months?" (survey
    free text, about an item saved and never bought)
  - "What the photos show and what gets delivered are two different
    stories." (caller, 30, working, Rs 5,999 salwar suit saved 15 days,
    burned by a past purchase)
  - "Will they look good on me or not?" (caller, 35, working, office wear
    saved 30 to 40 days)
- The honest methodological note, which is a strength: the survey form had
  no "don't trust" tick-box, yet trust surfaced anyway in free text and in
  the calls. Public complaints blame the platform; people facing their own
  wishlist phrase the same gap as unanswered personal questions. Two
  methods, opposite biases, one direction.
- Link the survey form here (rules require reader access).

**Visual.** The three quotes large; four small stat tiles for the numbers.

**Likely question:** "n=16 is small." Answer: agreed, and it is treated
accordingly: raw counts only, no percentages, and the survey's job was
never statistical proof; it was to confirm or contradict a 427-item signal
with item-anchored evidence, which it did, in the same direction.

---

## Slide 6: The problem definition (Part 4)

**Message:** At the moment of decision, the information needed to commit
does not exist, or is not believed.

**What this slide must communicate.** The formal problem statement the
brief requires, with segment, root cause, and the evolution chain showing
the thinking was earned, not assumed.

**Full content.**
- The problem, in full: shoppers save items they genuinely want; at the
  moment of decision, the information that would let them commit (will it
  fit, is the quality real, is it worth this price, do these photos tell
  the truth) either does not exist on the page or is not believed; so the
  purchase is postponed indefinitely and the wishlist becomes a parking
  lot for unresolved doubt.
- Target segment: wishlist users with purchase intent. Survey: 7 of 16
  describe their wishlist as "things I plan to buy soon", 5 more as a mix.
  Ages 19 to 30 in the survey, up to 35 in calls. Students and working
  shoppers saving Rs 500 to 6,000 fashion items.
- Root cause: buying moved online, assurance did not. The offline channels
  that resolved doubt (seeing, touching, trying, asking a shopkeeper or a
  companion) have no online equivalent, so doubt accumulates in the
  wishlist.
- Existing workarounds (evidence the need is real): rival-app checking
  (53 of 427 in the engine), one-star review reading, buyer photo hunting,
  screenshots to friends (10 of 16 in the survey), offline try-ons.
- Why solving it creates user value: the user is not asking to be
  persuaded; they are asking for their own question to be answered
  truthfully, and for the 20 to 40 minutes of cross-checking homework to
  disappear.
- Why it makes business sense: the doubt is resolved off-platform today,
  where rivals win the purchase; keeping resolution inside Myntra keeps
  the purchase inside Myntra; and the fix monetises information Myntra
  already owns (its review corpus) instead of margin. No discounts, which
  the brief forbids anyway.
- The evolution chain, explicit because the brief demands it: business
  metric -> four-stage decomposition -> engine locates the leak at
  Confidence and splits doubt 4.5:1 toward the product -> survey and calls
  confirm on real wishlists -> problem defined -> product built to answer
  the doubt.

**Visual.** Dark statement slide; the problem in large type; the chain as
one line at the bottom.

**Likely question:** "What alternatives did the research reject?" Answer:
fit-confidence tooling (self-doubt is the 38, not the 172) and a
resurfacing/reminder product (forgetting is 6 of 16, real but secondary);
both documented with counts, both on the roadmap in their right size.

---

## Slide 7: The MVP (Part 5, Deliverable 3)

**Message:** "Worth a look?" does the shopper's homework. Evidence, not
persuasion.

**What this slide must communicate.** What the product is, how it works,
that it is deployed and genuinely testable, and that it descends directly
from the research.

**Full content.**
- What it is: a deployed web product. The shopper pastes any saved Myntra
  item's link (or picks from real sample items) and states their doubt.
  The doubt options are the engine's own top blocker categories turned
  into buttons: size, quality, worth the price, photos vs reality.
- What it does: fetches that item's real buyer reviews live from
  myntra.com, reads them with AI, and answers the shopper's specific
  question with evidence: a bottom line in plain words, per-question
  verdicts (runs small / true to size; buyers happy / buyers complain;
  worth it / not), the number of reviews behind each claim, and word for
  word quotes from real buyers.
- The wishlist mode: paste up to five saved items and the whole list comes
  back ranked by buy-safety: Looks safe to buy / Has real risks / Reviews
  can't settle it, with the safest item crowned "best first buy from your
  list". This matches the metric's shape: the metric needs one item per
  user to convert, and ranking finds that item.
- The honesty machinery (because the #1 blocker is distrust, credibility
  is the product's growth mechanic): every quote is machine-checked to be
  a verbatim substring of a fetched review and dropped if not; counts are
  real counts; "the reviews can't settle it" is a first-class verdict; and
  confidence must be earned in both directions: a strongly positive review
  base produces a plainly confident yes, a weak one never gets inflated.
- Coverage, computed from the tagged corpus: the product directly answers
  the blockers found on 259 of 427 relevant items (trust, quality, size,
  worth); 280 of 427 counting partially-served blockers (suits-me,
  wants-an-opinion, too-many-options). Zero monetary incentives.
- Instrumentation already running: after every brief and ranking the
  product asks "did this settle your doubt?" and "what will you do now:
  buy, keep, remove?" and logs the answers server-side.
- It is live, works on arbitrary real Myntra links (not only samples), was
  verified across Chrome, Safari and Firefox engines on desktop and phone
  sizes, and gracefully falls back to cached sample items if Myntra blocks
  live fetching at that moment.

**Visual.** Two real screenshots: a bottom-line brief from an actual item,
and a ranked item card with its safety badge.

**Likely question:** "Why would this move purchases rather than just
comfort people?" Answer: the research shows the purchase is postponed
specifically to do review-homework off-platform; the product removes the
homework at the decision moment, and the three real-user tests on slide 8
show the mechanism producing decisions.

---

## Slide 8: The mechanism, tested on real users

**Message:** Its yes is worth believing, because the same voice says no.

**What this slide must communicate.** That real target users used the real
product on their real saved items, and every one of them reached a
decision. Also the product's philosophical core: honesty as strategy.

**Full content.**
- Caller 1: 24, first job. A bodycon dress, about Rs 3,699, saved a month.
  Her doubt: worth the price, and where would she wear it. She said she
  needed "someone to push me, say yes that will look great on you". She
  ran the prototype on her own item's link. The reviews were positive; her
  reaction: "good enough to buy". Outcome: buying it. Note what happened:
  the brief acted as the trusted second opinion she said she was missing.
- Caller 2: 30, working. A salwar suit, about Rs 5,999, saved 15 days.
  Burned before: "last time the material was so bad"; "what the photos
  show and what gets delivered are two different stories". That is the
  engine's #1 blocker, spoken. Brief was positive; she moved toward buying
  but was not fully convinced at that price after being scammed once.
  Honest reading: one good answer starts rebuilding trust; it does not
  finish it. That argues for the tool living permanently inside the
  wishlist, not as a one-off.
- Caller 3: 35, working. Office wear (shirt and pants around Rs 3,000
  each), saved 30 to 40 days. Her doubt was suits-me, the axis the tool
  deliberately does not answer. The reviews surfaced real risks; she
  confidently decided not to buy and to look for something else: she
  "wants to invest, but in something right". Outcome: a cleaned wishlist
  and a likely prevented return. This is why "remove it" counts as success
  in the product's own metrics.
- The synthesis: all three left limbo. One buy, one lean, one confident
  removal. The product's promise is decisions, not purchases at any cost;
  purchases follow because a voice that says no is the only voice whose
  yes means anything to a shopper whose top blocker is distrust.

**Visual.** Three outcome cards, color-coded (green: bought; blue: moved
toward buying; amber: confident removal).

**Likely question:** "Three users is nothing." Answer: correct, and they
are not presented as proof of lift; they are qualitative evidence that the
mechanism produces decisions on real items, which is exactly what the A/B
in Part 6 is designed to measure at scale.

---

## Slide 9: Defining success (Part 6)

**Message:** Doubts resolved, carts filled. Guarded by returns and honesty.

**What this slide must communicate.** A metric system that starts from the
business metric, adds the metrics the product can actually move, and locks
in guardrails so a win cannot be faked.

**Full content.**
- North star, unchanged from the brief: % of users who purchase at least
  one wishlisted item within 30 days of adding it.
- Primary product metric: doubt-resolution rate: the share of briefs
  followed by a decisive action, either add-to-cart or deliberate removal
  from the wishlist. Both count as success on purpose: a confident removal
  is a good outcome for the user and cleans intent signal for Myntra; only
  continued limbo is failure. The deployed prototype already logs this
  signal (settled? buy, keep, remove?).
- Leading indicators:
  1. Wishlist-to-cart rate on briefed vs un-briefed items: the in-product
     A/B, and the cleanest causal read available.
  2. Brief adoption: share of wishlist item views where the brief is
     opened. No adoption, no effect.
  3. Off-platform bounce after a brief: does rival-checking (the top
     observed workaround) actually decline?
- Guardrails, each with its reason:
  1. Return rate of briefed purchases at or below category baseline: if
     briefs talk people into purchases that come back, the metric was
     moved by borrowing from the returns line. An honest brief should
     lower returns via better-informed sizing.
  2. The "reviews can't settle it" share stays visible and is never
     optimised downward: the moment the system stops saying "I don't
     know", it becomes a persuasion engine and the trust premise dies.
     This is the no-invention rule expressed as a metric.
  3. Wishlist save rate does not fall: guarding against honest briefs
     making users afraid to save.
- The honest boundary, stated: the research proves the constraint and the
  mechanism; the A/B measures the lift. No lift number is claimed in this
  deck.

**Visual.** Three columns: north star and primary; leading; guardrails.

**Likely question:** "What if honesty reduces sales?" Answer: measured at
the account level over 30 days, not per item; the bet, grounded in the
off-platform workaround data, is that trusted answers keep the user's
purchases on Myntra even when one item loses; and the A/B makes the trade
visible quickly either way.

---

## Slide 10: Risks and roadmap (Part 7)

**Message:** What could break it, and what we do about it.

**What this slide must communicate.** Solution-specific risks (not generic
ones) with mitigations, several already built rather than promised; and a
roadmap where every item traces to a research finding.

**Full content.**
- Risk 1: honesty reduces short-term sales. Some truthful briefs will say
  "buyers report thin fabric" and lose that sale. Mitigation: measure at
  account level over the 30-day window where a trusted no beats an
  untrusted silence; the A/B is designed to make this trade visible fast,
  and if briefed cohorts convert worse over 30 days, the bet is wrong and
  we stop.
- Risk 2: model hallucination destroys the one thing the product sells.
  Mitigation already built, not planned: every quote is machine-verified
  verbatim against the fetched reviews and dropped if invented; counts are
  real counts; no-evidence verdicts are first-class; the tagging pipeline
  itself was human-audited.
- Risk 3: thin or gamed review bases produce confident nonsense.
  Mitigation: the brief states evidence strength ("only 4 of 22 reviews
  mention fit") and degrades to "can't settle it" below a floor;
  verified-purchase weighting and brand-level evidence are next.
- Risk 4: latency kills adoption (live reads take 20 to 60 seconds).
  Mitigation: in production, briefs are precomputed per item in batch,
  cached, and refreshed as reviews arrive; one generation serves every
  viewer; the per-user doubt only chooses which section leads.
- Risk 5: the research base is small and biased. Mitigation: stated
  openly; two methods with opposite biases agreeing, a 2.4x stability
  test, and a published tagging audit; the A/B is the real test.
- Roadmap, each item tied to its finding:
  1. Inside the wishlist UI: an answer on every saved item (from the
     placement logic and Caller 2's trust-rebuilding arc).
  2. Resurfacing layer for forgotten items (the 6 of 16), now with a
     reason to return attached.
  3. Review-vetted alternatives when a verdict is risky (from Caller 3's
     redirect and the compare-saving behaviour).
  4. "Ask about this item" in the cart: the assurance channel, scaled
     (from the interviewer's synthesis about offline assurance).
  5. Any catalog with reviews: nothing in the mechanism is Myntra-specific
     beyond one URL parser.
- Close with the three live links: the site, the engine, the prototype.

**Visual.** Two columns: risks left, roadmap right.

**Likely question:** "What would make you kill this product?" Answer: the
A/B showing briefed cohorts convert no better (or worse) over 30 days, or
the returns guardrail degrading; both are defined before scaling, which is
the point of Part 6.
