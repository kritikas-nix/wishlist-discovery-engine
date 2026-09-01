# MVP candidates — decision doc

Two candidates, one per surviving problem hypothesis. The research (survey +
follow-ups, read against the engine) picks one on Tue 1 Sep evening. Build
window is Wed–Thu, deployed and testable by Thu night. Both respect the hard
rule: no discounts, coupons, cashback or price-drop bribes.

---

## Candidate A — "Worth a look?" (confidence brief on a saved item)

**Problem it solves (if information credibility wins):** the doubt blocking
purchase is about the product — can I trust the photos, the reviews, the
seller. Users currently resolve it by leaving Myntra: checking the item on
other apps (top workaround in the engine, 45 of 243), reading low-star
reviews, searching YouTube. The engine says these doubts outnumber
self-fit doubts 4 to 1.

**What it is:** paste a Myntra product link (as if tapped from your wishlist)
and say what's holding you back (size / quality / worth it / photos look off).
The tool fetches the live product page and its reviews, and produces a
structured brief answering *your* doubt from evidence:

- **Size consensus:** what buyers actually say — runs small / true / large,
  with counts and verbatim lines.
- **Quality read:** what the low-star reviews complain about, separated into
  product problems vs delivery problems.
- **Photo reality:** mentions of "looked different from photos", either way.
- **Bottom line:** what a careful friend would tell you, including "the
  reviews don't answer your question" when they don't. Never invents.

**Why it can't recommend buying junk:** it summarises evidence, it doesn't
persuade. "Reviews consistently say the fabric is thin" is a legitimate
output. Honesty is the feature; that is also what makes it non-monetary.

**Architecture (all proven in this repo already):**
Streamlit app → Firecrawl scrape of the product + reviews pages (the
`/reviews/<styleid>` pattern from collect.py) → one Claude call with a
structured prompt → rendered brief. Same stack as the engine, deployed the
same way on Streamlit Cloud.

**Build plan:** Day 1: scrape + prompt + brief rendering for pasted URLs;
handle pages with few/no reviews honestly. Day 2: doubt-picker, 3 pre-loaded
demo items (so graders without a Myntra link still get the experience),
polish, deploy, incognito test.

**Metric hook (Part 6):** leading — share of wishlist item views that reach
add-to-cart; brief usage rate; "did this answer your doubt" thumbs.
Guardrails — return rate (must not rise), time-to-decision.

**Risks:** Myntra bot-blocks Firecrawl at demo time (mitigate: cached demo
items); reviews too thin on some items (mitigate: the brief says so
honestly); LLM overclaims (mitigate: quotes-with-evidence format, same
discipline as the engine).

---

## Candidate B — "Wishlist triage" (resurfacing what you forgot)

**Problem it solves (if forgotten items win):** nothing brings users back to
the list. Q27-style evidence would show saved items are simply never seen
again; the doubt never even gets a chance to block.

**What it is:** a weekly "your wishlist, five at a time" ritual. Import items
(paste Myntra links; no public wishlist API exists), then a swipe-style
triage: for each resurfaced item — still want it? The three outcomes are
buy-intent (deep-link back to Myntra), keep (resurface later), drop
(declutter). Items carry their age ("saved 2 months ago") and a one-line
evidence nudge pulled from reviews (the Candidate A engine, minaturised) so
the return visit is a decision, not just a reminder.

**Architecture:** Streamlit (or simple web app), item store per session,
Firecrawl fetch for item metadata, optional Claude one-liner per item.

**Build plan:** Day 1: import + triage flow + item ageing. Day 2: the nudge
line, summary screen ("you cleared 5, kept 2, dropped 3"), deploy, test.

**Risks:** without real wishlist access the demo is a simulation of a Myntra
feature rather than a usable standalone tool — weaker "functional MVP" claim;
the resurfacing trigger (push/notification) can only be described, not built,
in two days.

---

## Decision rule (Tue evening)

1. **Q27 forgotten rate low** (most people remember their bottom item) →
   forgotten-items hypothesis weakens → **Candidate A**.
2. **Q27 forgotten rate high AND survey blockers echo the engine's
   credibility skew** → the two problems stack: forgotten is the visible
   symptom, unresolved doubt is why returning never leads anywhere →
   **Candidate A still wins on buildability**, and the deck says the
   resurfacing layer is the roadmap next step.
3. **Q27 high AND blockers show no credibility skew** (mostly occasion/price
   timing) → **Candidate B**, because then the constraint really is
   attention, not confidence.

Current evidence going in: engine (n=243) points hard at A; the 5-response
structure check is too small to count but shows both suitability doubts and
one fully forgotten bottom item. The survey decides.
