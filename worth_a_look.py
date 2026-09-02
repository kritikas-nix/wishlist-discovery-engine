"""
worth_a_look.py
"Worth a look?" - the MVP. Paste a Myntra item you have wishlisted, say what
is holding you back, and get an evidence-only brief built from that item's
real buyer reviews.

  streamlit run worth_a_look.py

Deployed as its own Streamlit app from this repo (main file: worth_a_look.py).
Needs FIRECRAWL_API_KEY and ANTHROPIC_API_KEY in secrets or env.
"""

import json
import os

import streamlit as st

import mvp_engine

DEMO_PATH = "data/demo_items.json"

VERDICT_LABEL = {
    "runs_small": "Runs small", "true_to_size": "True to size",
    "runs_large": "Runs large", "mixed": "Buyers disagree",
    "no_evidence": "Reviews don't say",
    "positive": "Buyers are happy", "negative": "Buyers complain",
    "matches": "Matches the photos", "differs": "Differs from photos",
    "worth_it": "Buyers say worth it", "not_worth_it": "Buyers say not worth it",
}
SECTION_TITLES = {
    "size_read": "Size and fit",
    "quality_read": "Quality and material",
    "photo_reality": "Photos vs reality",
    "worth_read": "Worth the price",
}
DOUBT_LABELS = {
    "size": "Will it fit me?",
    "quality": "Is the quality actually good?",
    "worth": "Is it worth the price?",
    "photos": "Will it look like the photos?",
    "general": "Just tell me what buyers say",
}
DOUBT_SECTION = {"size": "size_read", "quality": "quality_read",
                 "worth": "worth_read", "photos": "photo_reality"}

st.set_page_config(page_title="Worth a look?", page_icon="🛍️",
                   layout="centered")


def secrets_to_env():
    for k in ("FIRECRAWL_API_KEY", "ANTHROPIC_API_KEY"):
        try:
            if k in st.secrets:
                os.environ[k] = st.secrets[k]
        except Exception:
            pass


secrets_to_env()


@st.cache_data(ttl=3600, show_spinner=False)
def cached_fetch(style_id):
    return mvp_engine.fetch_product(style_id)


@st.cache_data(show_spinner=False)
def demo_items():
    if os.path.exists(DEMO_PATH):
        with open(DEMO_PATH, encoding="utf-8") as f:
            return json.load(f)
    return []


def render_section(key, sec, highlight):
    title = SECTION_TITLES[key]
    verdict = VERDICT_LABEL.get(sec.get("verdict", ""), "")
    n = sec.get("n_mentions", 0)
    header = f"**{title}** — {verdict}"
    if n:
        header += f"  ·  {n} review{'s' if n != 1 else ''} mention this"
    box = st.container(border=True)
    with box:
        st.markdown(("🔎 " if highlight else "") + header)
        if sec.get("summary"):
            st.markdown(sec["summary"])
        for q in (sec.get("quotes") or [])[:4]:
            st.markdown(f"> “{q['text']}”  \n> — buyer review "
                        f"[{q.get('n', '?')}]")


def run_brief(product, doubt_key):
    st.markdown("---")
    meta = f"**{product['brand']}** · {product['name']}"
    st.markdown(meta)
    bits = []
    if product.get("price"):
        bits.append(product["price"])
    if product.get("rating"):
        bits.append(f"rated {product['rating']} by "
                    f"{product.get('rating_count', '?')} buyers")
    bits.append(f"[view on Myntra]({product['url']})")
    st.caption(" · ".join(bits))

    if not product["reviews"]:
        st.warning("This item has no readable buyer reviews, so there is no "
                   "evidence to build a brief from. That itself is worth "
                   "knowing before you buy.")
        return

    with st.spinner(f"Reading {len(product['reviews'])} buyer reviews..."):
        try:
            brief = mvp_engine.make_brief(product, doubt_key)
        except Exception as e:
            st.error(f"Could not build the brief: {type(e).__name__}. "
                     "Try again in a moment.")
            return

    st.subheader("The bottom line")
    st.markdown(brief.get("bottom_line", ""))
    st.caption(f"Built only from the {len(product['reviews'])} buyer reviews "
               "fetched just now. Quotes are verbatim and machine-checked "
               "against the review text.")

    focus = DOUBT_SECTION.get(doubt_key)
    order = ([focus] if focus else []) + \
        [k for k in SECTION_TITLES if k != focus]
    for key in order:
        sec = brief.get(key) or {}
        if sec:
            render_section(key, sec, highlight=(key == focus))

    gaps = brief.get("gaps") or []
    if gaps:
        with st.expander("What these reviews do not answer"):
            for g in gaps:
                st.markdown(f"- {g}")


# ---------------------------------------------------------------------------

st.title("Worth a look?")
st.markdown(
    "Those items have been sitting in your wishlist for a reason. Paste "
    "them here and get straight answers built only from what real buyers "
    "wrote in their reviews: your whole list ranked by how safe each item "
    "is to buy, or one item examined in depth. No pushing, no invented "
    "claims. When the reviews do not settle it, this says so.")

SAFETY_BADGE = {
    "looks_safe": ("🟢", "Looks safe to buy"),
    "has_risks": ("🟠", "Has real risks"),
    "reviews_cant_settle": ("⚪", "Reviews can't settle it"),
}


def run_wishlist(products):
    from concurrent.futures import ThreadPoolExecutor
    progress = st.progress(0.0, text="Reading reviews for each item...")
    results = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = {pool.submit(mvp_engine.make_verdict, p): p
                   for p in products}
        done = 0
        for fut, p in list(futures.items()):
            try:
                results.append({"product": p, "verdict": fut.result()})
            except Exception:
                results.append({"product": p, "verdict": {
                    "safety": "reviews_cant_settle",
                    "headline": "Could not read this item's reviews "
                                "right now.",
                    "risk": "", "size_note": "", "key_quote": None,
                    "evidence_strength": "thin"}})
            done += 1
            progress.progress(done / len(futures),
                              text=f"Read {done} of {len(futures)} items")
    progress.empty()

    ranked = mvp_engine.rank_wishlist(results)
    counts = {}
    for rv in ranked:
        counts[rv["verdict"]["safety"]] = \
            counts.get(rv["verdict"]["safety"], 0) + 1
    summary_word = {"looks_safe": "safe to buy", "has_risks":
                    "with real risks", "reviews_cant_settle": "unsettled"}
    bits = [f"{counts[k]} {summary_word[k]}"
            for k in summary_word if counts.get(k)]
    st.markdown(f"**Your {len(ranked)} saved items, safest first** "
                f"— {', '.join(bits)}.")

    for i, rv in enumerate(ranked, 1):
        p, v = rv["product"], rv["verdict"]
        dot, label = SAFETY_BADGE[v["safety"]]
        box = st.container(border=True)
        with box:
            st.markdown(
                f"**{i}. {dot} {p['brand']} — {p['name'][:70]}**  \n"
                f"{label} · {p['price']} · "
                f"{len(p['reviews'])} reviews read · "
                f"[view on Myntra]({p['url']})")
            st.markdown(v.get("headline", ""))
            if v.get("risk"):
                st.markdown(f"⚠️ {v['risk']}")
            if v.get("size_note"):
                st.markdown(f"📏 {v['size_note']}")
            if v.get("key_quote"):
                st.markdown(f"> “{v['key_quote']['text']}” — buyer review")
            if v.get("evidence_strength") == "thin":
                st.caption("Thin evidence: few usable reviews on this item.")
    st.caption("Ranked only by what buyer reviews show: consistent praise "
               "ranks above repeated complaints, and items whose reviews "
               "answer nothing rank last. For any item, get the full brief "
               "in the 'One item in depth' tab.")


demos = demo_items()
tab_list, tab_link, tab_demo = st.tabs(
    ["Rank my wishlist", "One item in depth", "Sample items"])

with tab_list:
    st.markdown(
        "Paste up to five saved items, one link per line. Each item's "
        "buyer reviews get read, then your list comes back ranked: safest "
        "buy first, real risks flagged, unanswerable ones called out.")
    urls_text = st.text_area(
        "Your saved items", height=120,
        placeholder="https://www.myntra.com/…/31034107/buy\n"
                    "https://www.myntra.com/…/33720581/buy")
    c1, c2 = st.columns([1, 1])
    go_list = c1.button("Rank my items", type="primary")
    go_demo_list = c2.button("Rank the 3 sample items instead") if demos \
        else False
    if go_list:
        sids = []
        for line in urls_text.splitlines():
            sid = mvp_engine.extract_style_id(line)
            if sid and sid not in sids:
                sids.append(sid)
        if not sids:
            st.error("No Myntra product links found. One link per line, "
                     "each containing /…/buy or /reviews/… with a number.")
        else:
            sids = sids[:5]
            products = []
            fetch_bar = st.progress(
                0.0, text=f"Fetching {len(sids)} items from Myntra...")
            for i, sid in enumerate(sids, 1):
                try:
                    products.append(cached_fetch(sid))
                except Exception:
                    st.warning(f"Could not fetch item {sid}; skipping it.")
                fetch_bar.progress(i / len(sids),
                                   text=f"Fetched {i} of {len(sids)}")
            fetch_bar.empty()
            if products:
                run_wishlist(products)
    if go_demo_list:
        run_wishlist(demos)

with tab_link:
    st.markdown("One item, one doubt, and the full evidence brief on it.")
    url = st.text_input(
        "Myntra product link",
        placeholder="https://www.myntra.com/dresses/brand/…/31034107/buy")
    doubt = st.radio("What is holding you back?",
                     list(DOUBT_LABELS), format_func=DOUBT_LABELS.get,
                     horizontal=True, key="doubt_link")
    if st.button("Read the reviews for me", type="primary"):
        sid = mvp_engine.extract_style_id(url)
        if not sid:
            st.error("That does not look like a Myntra product link. It "
                     "should contain /…/buy or /reviews/… with a number.")
        else:
            try:
                with st.spinner("Fetching the product and its reviews..."):
                    product = cached_fetch(sid)
                run_brief(product, doubt)
            except Exception as e:
                st.error("Could not fetch this item right now "
                         f"({type(e).__name__}). Myntra sometimes blocks "
                         "automated fetching; try the sample items tab to "
                         "see the workflow.")

with tab_demo:
    if not demos:
        st.info("No sample items cached.")
    else:
        names = [f"{d['brand']} — {d['name'][:60]} ({d['price']})"
                 for d in demos]
        pick = st.selectbox("Pick a real Myntra item", range(len(demos)),
                            format_func=lambda i: names[i])
        doubt2 = st.radio("What is holding you back?",
                          list(DOUBT_LABELS), format_func=DOUBT_LABELS.get,
                          horizontal=True, key="doubt_demo")
        if st.button("Read the reviews for me", type="primary",
                     key="btn_demo"):
            run_brief(demos[pick], doubt2)

st.markdown("---")
st.caption(
    "A research prototype: it answers the doubt that keeps wishlisted items "
    "unbought, using only evidence that already exists in buyer reviews. It "
    "never offers discounts and never invents a claim. Sample items were "
    "fetched from myntra.com; pasted links are fetched live.")
