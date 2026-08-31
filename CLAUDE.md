# Myntra wishlist to purchase — PM assignment

Context file for Claude Code. Read this before making changes.

---

## 1. The assignment

Final assignment of a PM fellowship. The framing: you are a Product Manager on
the Growth Team at **Myntra**, an Indian fashion e-commerce platform.

Users browse, save items, and accumulate dozens or hundreds of wishlisted
products, while only a small proportion ever convert. A wishlist is an
unusually strong signal: explicit interest, stopped short of purchase.

**Company goal handed down:**

> Increase the percentage of users who purchase at least one item from their
> wishlist within 30 days of adding it.

**Two hard constraints:**

1. **The underlying user problem is not given.** Discovering it is the
   assignment. Do not assume the answer is fit, or price, or anything else.
   The research determines which problem gets pursued.
2. **No monetary incentives in the solution.** No discounts, coupons, cashback,
   or price-drop bribes. Telling a user that a price changed is information;
   offering money to convert is not permitted.

**Deadline: 5 September 2026, 3:59 PM IST.** No late submissions, not by
seconds.

---

## 2. The seven parts

### Part 1 — Build an AI-powered discovery engine
Build a system that analyses public user feedback at scale. Sources: app store
and Play Store reviews, Reddit, fashion and shopping communities, social media,
YouTube comments, product reviews and Q&A.

It must answer questions like: why do users wishlist items, what prevents
purchase, what uncertainties remain after they've found something they like,
what makes them postpone, how do they compare shortlisted items, what
information do they seek outside Myntra, what role do fit / size / styling /
price / reviews / occasion / social validation play, when is a wishlist genuine
intent versus a bookmark, how does this differ by segment, what unmet needs
recur.

**Explicitly must go beyond summarising reviews or sentiment analysis.** It has
to identify, quantify where possible, and *compare* opportunity areas.

### Part 2 — Break down the business metric
Decompose wishlist → purchase conversion into the product outcomes and user
behaviours that influence it. What has to change for the metric to move. Use
the decomposition alongside the engine output to find where the highest-
potential opportunities are.

### Part 3 — Validate through user research
Pick a target segment and opportunity area from the initial analysis, then run
5–6 user interviews with that segment. Cover: why they saved each item, whether
they still intend to buy, what is stopping them, what would make them purchase,
what information they still need, whether they are considering alternatives,
what happens outside the app before deciding, how they currently overcome
uncertainty.

*Note: mentors have permitted a survey in place of live interviews. See section
6 — a form is running, with a call opt-in for depth on top.*

### Part 4 — Define the problem
Articulate: the target segment, the product outcome to influence, the root
cause preventing the desired behaviour, existing user workarounds, why solving
it creates user value, why it makes business sense.

Must show how the thinking evolved across:

```
Business Metric → Product Outcomes → AI Discovery → Primary Research → Problem Definition
```

The brief's own example: research might reveal conversion is constrained by fit
confidence for one segment and price uncertainty for another. The research
decides which one gets pursued.

### Part 5 — Build an MVP
Design and build a *functional* MVP addressing the identified problem. May be a
feature within Myntra, an AI workflow, an AI agent, or a standalone experience
connected to the shopping journey. **Must be deployed to production so it can
be interacted with and tested.**

### Part 6 — Define success
Start from the business metric, then the metrics the solution influences.
Leading indicators, guardrail metrics, and for each one the definition and the
rationale for choosing it.

### Part 7 — Risks and mitigation
Why the solution might fail. The most important risks specific to this
solution, with mitigation plans.

---

## 3. Deliverables

| # | Deliverable | Form | Status |
|---|---|---|---|
| 1 | AI discovery engine | Public link where the workflow can be **tested**, plus one slide explaining how it works | this repo, not deployed |
| 2 | Deck | PDF, 10 slides max, under 40MB | not started |
| 3 | Deployed MVP | Publicly accessible prototype, workflow or agent that can be tested | not started |

Deck must cover: metric decomposition, discovery engine findings, primary
research, problem definition, solution rationale, MVP, success metrics, risks
and mitigation.

**Deck rules, strictly enforced:**

- Fellow's name must NOT appear anywhere in the deck
- 10 slides maximum, title slide counts within the 10
- Slide titles state the key message, not the topic. Not "Problem" but the
  problem stated succinctly
- Minimum font size 14pt for PPT or Google Slides. Strict
- Colourblind-safe palette; readable text on any background colour
- Supporting artifacts (survey URL, engine, MVP) linked via hyperlink, and the
  reader **must have access**. No access means reduced score
- File under 40MB, named in the form `NL Myntra`

---

## 4. Why each piece exists

The engine and the survey are not the deliverable. They exist to answer one
question: **which problem do we solve?** Everything downstream depends on that
answer being earned rather than assumed.

- The **engine** gives breadth and quantification. Hundreds of real people, but
  self-selected and shallow.
- The **survey** gives item-anchored specifics from real wishlists. Narrower,
  but grounded in actual saved items rather than generalities.
- **Where the two disagree is the most valuable finding available.** Public
  reviews skew toward whatever is easiest to complain about. Anchored questions
  surface what is actually blocking a specific purchase. If they diverge, that
  divergence is a slide.

The MVP is what gets graded hardest, because it is the only part that can't be
faked. Do not let engine polish eat MVP time. The engine is done when it
produces defensible numbers and has a working public link.

---

## 5. Pipeline

```
collect.py    public conversations        -> data/raw_corpus.csv
classify.py   LLM tagging pass            -> data/tagged_corpus.jsonl
analyze.py    aggregation and cross-tabs  -> data/findings.json
app.py        Streamlit, the public link  -> deployed
```

```bash
pip install -r requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...
python collect.py      # 10-20 min
python classify.py     # 10-15 min, resumable
python analyze.py
streamlit run app.py
```

`classify.py` appends one JSON line per item and skips already-tagged ids on
rerun. Safe to kill and restart. Do not refactor that away.

### Files

- `taxonomy.py` — classification schema and tagging prompt. The core of the
  project. Changing a field invalidates everything already tagged.
- `collect.py` — Play Store (no key), Reddit public JSON (no key), YouTube
  (optional, `YOUTUBE_API_KEY`).
- `classify.py` — concurrent, resumable. Validates model output against the
  schema and coerces off-schema values to explicit in-schema fallbacks rather
  than dropping rows.
- `analyze.py` — not written yet.
- `app.py` — not written yet.

### Design decisions that should not be casually undone

**Relevance filtering runs first.** Most Play Store reviews are about delivery
delays, refunds and app crashes. Without the filter, denominators are
meaningless. Be strict about `irrelevant`.

**`uncertainty_object` is the differentiating axis.** Two people both say "not
sure about fit". One lacks information about the garment (`about_product`). The
other has the measurements and cannot map them to her own body (`about_self`).
Different problems, different solutions. A heavy skew here likely determines the
MVP. Do not collapse this field.

**Blocker keys map 1:1 to the survey tick boxes** (Q16, Q21, Q26). Deliberate,
so scraped and survey data can be compared on one axis. Adding a key here breaks
that match.

**Low confidence and `unclear` are correct answers.** The prompt tells the model
not to guess. Do not tune it toward fuller-looking output.

**The engine's public app must let a visitor paste text and see it classified
live**, not just browse precomputed results. The brief asks for a workflow that
can be *tested*.

---

## 6. Parallel research track

A Google Form is live. 34 questions, 8 sections, item-anchored: respondents open
their real Myntra wishlist and answer the same five questions about the top
item, the third item, and the item at the very bottom. Target 25–30 responses.
Q33/Q34 collect an opt-in for a 15-minute follow-up call, so a few live
conversations sit on top of the survey scale.

Most valuable question is **Q27**: whether they remembered the bottom item was
in their wishlist at all. A high forgotten rate would mean the problem is that
nothing brings users back to the list, not that any specific doubt blocks them.
That points at a very different MVP than a fit-confidence finding would.

Analysis to run once responses land:

- Blocker mix across all three item positions combined
- Blocker mix top item vs bottom item separately — the difference is a finding
- Share of bottom items completely forgotten (Q27)
- Still-wants split by when saved — the decay curve
- Q5 against Q8 — people who open the app often but the wishlist rarely
- Blocker mix split by Q3 (student vs working) and Q9 (intent vs bookmark saver)

The last two splits are what make this a PM analysis rather than a survey
summary, and they are how the brief's own fit-versus-price example gets tested.

---

## 7. Rules

**Never fabricate data.** No invented quotes, respondent counts, percentages or
findings, not even as placeholders in a chart or draft slide. If a number is not
computed from a real file, it does not go in. Sample data used in tests must be
labelled unmistakably.

**State n everywhere.** Every chart and claim carries its sample size. Under 20
responses, report raw counts not percentages. "7 of 18" is fine; "39% of 18" is
not. Flag any finding resting on a handful of people, next to the finding.

**Self-reported behaviour is not observed behaviour.** Saying so in the deck is
a strength, not a weakness.

**Anonymise.** No names, contact details or identifying information in anything
that might be linked publicly. The Q34 contact column is stripped from any
exported or linked copy of the response sheet.

**Check public access.** Every linked artifact opened in an incognito window
before submission. Missing access costs marks directly.

---

## 8. Writing style for anything user-facing

Plain English. No PM jargon, no em-dashes. Short direct sentences. Say the thing
rather than framing it. Honest about limitations.

---

## 9. Status and plan

**Built:** `taxonomy.py`, `collect.py`, `classify.py`. Parsing and validation
tested against malformed output. Nothing run against live data yet.

**Next, in order:**

1. Run collect + classify, check source counts came back healthy
2. `analyze.py` — cross-tabs, especially blocker mix by `uncertainty_object`
   and by `saving_intent`
3. `app.py`, deployed to Streamlit Community Cloud, for the public link
4. Metric decomposition (Part 2)
5. Survey analysis once responses land (Part 3)
6. Problem definition (Part 4), then MVP (Part 5)

**Schedule:**

| Day | Focus |
|---|---|
| Sun 30 Aug | Engine collect + classify |
| Mon 31 Aug | analyze.py, deploy engine, metric decomposition |
| Tue 1 Sep | Survey analysis, 2–3 follow-up calls, problem definition |
| Wed 2 – Thu 3 Sep | Build and deploy MVP |
| Fri 4 Sep | Deck, success metrics, risks |
| Sat 5 Sep | Check every link in incognito, submit by 1 PM |
