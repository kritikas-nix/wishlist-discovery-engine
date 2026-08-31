"""
app.py
Streamlit app for the discovery engine. Two jobs:

  1. Show the findings from data/findings.json, with n on every chart.
  2. Let a visitor paste any text and see it classified live through the
     same prompt the batch pipeline uses.

  streamlit run app.py

Deployed, this is the public testable link the brief asks for. The API key
comes from st.secrets["ANTHROPIC_API_KEY"] or the environment.
"""

import json
import os

import plotly.graph_objects as go
import streamlit as st

import taxonomy
from collect import _load_dotenv

_load_dotenv()

FINDINGS_PATH = "data/findings.json"

# Validated colorblind-safe palette (light mode).
BLUE = "#2a78d6"
CAT = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"]  # slots 1-4, fixed order
INK = "#0b0b0b"
MUTED = "#898781"
GRID = "#e1e0d9"

st.set_page_config(page_title="Wishlist discovery engine", page_icon="🔎",
                   layout="wide")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_api_key():
    try:
        if "ANTHROPIC_API_KEY" in st.secrets:
            return st.secrets["ANTHROPIC_API_KEY"]
    except Exception:
        pass
    return os.environ.get("ANTHROPIC_API_KEY", "")


@st.cache_data
def load_findings():
    if not os.path.exists(FINDINGS_PATH):
        return None
    with open(FINDINGS_PATH, encoding="utf-8") as f:
        return json.load(f)


def fmt_count(count, n):
    """Counts always. Percentages only when the denominator is 20 or more."""
    if n >= 20:
        return f"{count} ({count / n:.0%})"
    return str(count)


def hbar(counts, labels, n, title, color=BLUE):
    """Horizontal bar of raw counts, largest first, count labels on the bars."""
    items = sorted(counts.items(), key=lambda x: x[1])
    ys = [labels.get(k, k) for k, _ in items]
    xs = [v for _, v in items]
    fig = go.Figure(go.Bar(
        x=xs, y=ys, orientation="h",
        marker=dict(color=color),
        text=[fmt_count(v, n) for v in xs],
        textposition="outside",
        hovertemplate="%{y}: %{x} of " + str(n) + "<extra></extra>",
    ))
    fig.update_layout(
        title=dict(text=f"{title}  (n={n})", font=dict(color=INK, size=16)),
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color=MUTED, size=13),
        xaxis=dict(gridcolor=GRID, zerolinecolor=GRID),
        yaxis=dict(automargin=True),
        margin=dict(l=10, r=60, t=50, b=10),
        height=max(300, 30 * len(xs) + 90),
        bargap=0.35,
    )
    return fig


def grouped_bar(cross, labels, title):
    """Blocker counts split by a field. One trace per split value, n in legend."""
    all_blockers = sorted(
        {b for cell in cross.values() for b in cell["blockers"]},
        key=lambda b: -sum(cell["blockers"].get(b, 0) for cell in cross.values()),
    )
    fig = go.Figure()
    keys = [k for k in cross if cross[k]["n"] > 0]
    for i, key in enumerate(keys):
        cell = cross[key]
        fig.add_bar(
            name=f"{key} (n={cell['n']})",
            x=[labels.get(b, b) for b in all_blockers],
            y=[cell["blockers"].get(b, 0) for b in all_blockers],
            marker=dict(color=CAT[i % len(CAT)]),
            hovertemplate="%{x}: %{y}<extra>" + key + "</extra>",
        )
    fig.update_layout(
        barmode="group",
        title=dict(text=title, font=dict(color=INK, size=16)),
        plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
        font=dict(color=MUTED, size=12),
        yaxis=dict(gridcolor=GRID, zerolinecolor=GRID, title="items"),
        xaxis=dict(automargin=True, tickangle=30),
        legend=dict(orientation="h", y=-0.5),
        margin=dict(l=10, r=10, t=50, b=10),
        height=460,
    )
    return fig


# ---------------------------------------------------------------------------
# Layout
# ---------------------------------------------------------------------------

st.title("Why saved items don't get bought")
st.markdown(
    "This engine collects public conversations about online fashion shopping "
    "in India (Play Store reviews, Reddit, YouTube), tags each one against a "
    "fixed schema with an LLM, and counts the results. It is built to answer "
    "one question: **what stops people from buying the things they saved?**"
)

tab_findings, tab_live, tab_how = st.tabs(
    ["Findings", "Try the classifier", "How it works"])

findings = load_findings()

# ---------------------------------------------------------------------------
# Tab 1: findings
# ---------------------------------------------------------------------------

with tab_findings:
    if not findings:
        st.info("No findings yet. Run the pipeline: collect.py, classify.py, "
                "analyze.py.")
    else:
        c = findings["corpus"]
        rel_n = c["relevant_n"]

        col1, col2, col3 = st.columns(3)
        col1.metric("Items collected and tagged", c["total_tagged"])
        col2.metric("Relevant to a purchase decision", rel_n)
        col3.metric("Filtered out as irrelevant",
                    c["by_relevance"].get("irrelevant", 0))
        st.caption(
            "Relevant means the text is about a purchase being considered or "
            "deferred. Delivery complaints, refunds and app bugs are excluded "
            "so the numbers below describe purchase hesitation, not app "
            "quality. Post-purchase items are also excluded from blocker "
            "figures. Generated " + findings.get("generated_at", "") + "."
        )

        st.plotly_chart(
            hbar(findings["blockers"]["overall"], taxonomy.BLOCKERS, rel_n,
                 "What is blocking the purchase"),
            use_container_width=True)
        st.caption(
            "One item can carry more than one blocker, so counts can sum to "
            "more than n.")

        st.plotly_chart(
            grouped_bar(findings["blockers_by_uncertainty"], taxonomy.BLOCKERS,
                        "Same blockers, split by what the doubt is about"),
            use_container_width=True)
        st.caption(
            "about_product = they lack information about the item. "
            "about_self = they have the information and cannot map it to "
            "their own body, taste or plans. These need different fixes, "
            "which is why they are counted separately.")

        cA, cB = st.columns(2)
        with cA:
            st.plotly_chart(
                hbar(findings["saving_intent_overall"],
                     {k: k for k in taxonomy.SAVING_INTENT}, rel_n,
                     "Why the item was saved"),
                use_container_width=True)
        with cB:
            st.plotly_chart(
                hbar(findings["workarounds_overall"]["counts"],
                     taxonomy.WORKAROUNDS, rel_n,
                     "Workarounds people invented"),
                use_container_width=True)

        st.plotly_chart(
            hbar(c["by_source"], {}, c["total_tagged"], "Where the data came from"),
            use_container_width=True)

        st.subheader("Real quotes behind the numbers")
        st.caption("Verbatim, chosen by tagging confidence. Nothing is edited.")
        quotes = findings.get("quotes", {})
        top_blockers = sorted(findings["blockers"]["overall"].items(),
                              key=lambda x: -x[1])
        for key, count in top_blockers:
            qs = quotes.get(key) or []
            if not qs:
                continue
            with st.expander(f"{taxonomy.BLOCKERS.get(key, key)} — {count} items"):
                for q in qs:
                    st.markdown(f"> {q['evidence']}")
                    src = f"{q['source']} · {q['platform']} · {q['date']}"
                    if q.get("url"):
                        st.caption(f"[{src}]({q['url']})")
                    else:
                        st.caption(src)

        st.markdown("---")
        st.caption(
            "Limitations, stated plainly: this is public, self-selected "
            "feedback. People complain about what is easiest to describe, "
            "and app store reviewers are not a random sample of wishlist "
            "users. Tagging is done by a model and carries error. These "
            "numbers locate where to look; a parallel survey anchored to "
            "real wishlist items tests what they suggest.")

# ---------------------------------------------------------------------------
# Tab 2: live classifier
# ---------------------------------------------------------------------------

with tab_live:
    st.markdown(
        "Paste any piece of shopping-related text, in your own words or "
        "copied from anywhere, and see exactly how the engine tags it. "
        "This runs the same prompt used on the full corpus.")

    example = ("I added a kurta set to my wishlist last month. The size chart "
               "says 38 but I don't know if that fits me, reviews say it runs "
               "small. Asked my sister to check the photos.")
    text = st.text_area("Text to classify", height=140, placeholder=example)

    if st.button("Classify", type="primary"):
        if not text.strip():
            st.warning("Paste some text first.")
        elif not get_api_key():
            st.error("No API key configured, so live classification is off. "
                     "The findings tab still works.")
        else:
            os.environ["ANTHROPIC_API_KEY"] = get_api_key()
            import classify  # reuses the batch pipeline's parse + validate
            with st.spinner("Classifying..."):
                try:
                    resp = classify.client.messages.create(
                        model=classify.MODEL,
                        max_tokens=600,
                        messages=[{"role": "user", "content":
                                   taxonomy.build_prompt(text, "live_demo")}],
                    )
                    raw = "".join(b.text for b in resp.content
                                  if b.type == "text")
                    tags = classify.validate(classify.parse(raw))
                except Exception as e:
                    st.error(f"Classification failed: {type(e).__name__}: {e}")
                    tags = None

            if tags:
                c1, c2 = st.columns(2)
                with c1:
                    st.markdown(f"**Relevance:** `{tags['relevance']}`")
                    st.markdown(f"**Doubt is about:** "
                                f"`{tags['uncertainty_object']}`")
                    st.markdown(f"**Saving intent:** `{tags['saving_intent']}`")
                    st.markdown(f"**Confidence:** `{tags['confidence']}`")
                with c2:
                    bl = [taxonomy.BLOCKERS.get(b, b)
                          for b in tags["blockers"]] or ["none tagged"]
                    st.markdown("**Blockers:**")
                    for b in bl:
                        st.markdown(f"- {b}")
                    wk = [taxonomy.WORKAROUNDS.get(w, w)
                          for w in tags["workarounds"]]
                    if wk:
                        st.markdown("**Workarounds:**")
                        for w in wk:
                            st.markdown(f"- {w}")
                if tags.get("evidence"):
                    st.markdown(f"**Evidence the model points to:** "
                                f"“{tags['evidence']}”")
                with st.expander("Raw JSON"):
                    st.json(tags)

# ---------------------------------------------------------------------------
# Tab 3: how it works
# ---------------------------------------------------------------------------

with tab_how:
    st.markdown("""
**Pipeline**

1. **Collect** — public conversations: Google Play reviews of Myntra, Ajio and
   Nykaa Fashion, Reddit threads from Indian fashion and city subreddits, and
   YouTube comments on haul and sizing videos.
2. **Filter** — most scraped text is about delivery, refunds or app crashes.
   Everything is tagged for relevance first and only purchase-decision text
   counts toward the findings, so the denominators mean something.
3. **Tag** — each relevant item is classified by an LLM against a fixed schema:
   what blocks the purchase, what the doubt is about (the product, yourself, or
   your context), why the item was saved, and what workaround the person
   invented. The model is told not to guess: `unclear` and empty are valid
   answers.
4. **Count** — the tagged corpus is aggregated into the charts on the findings
   tab. Every figure carries its sample size.

**Why this is more than sentiment analysis**

Two people who both say "not sure about the fit" can mean different things.
One does not know the garment's measurements. The other knows them and cannot
map them to her own body. The schema separates those, because they need
different product solutions. Counting that split, rather than summarising
complaints, is what makes the output decidable.

**What it cannot do**

Public feedback is self-selected and skews toward what is easy to complain
about. This engine finds and sizes candidate problems; it does not prove
which one matters most for a specific segment. That is tested separately with
item-anchored primary research on real wishlists.
""")
