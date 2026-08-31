"""
analyze.py
Aggregates data/tagged_corpus.jsonl into data/findings.json.

  python analyze.py

Everything downstream (the app, the deck) reads findings.json, so every number
in it carries its n. Percentages are left to the presentation layer, which must
not show them for any cell under 20.
"""

import json
import os
from collections import Counter, defaultdict
from datetime import datetime

import taxonomy

IN_PATH = "data/tagged_corpus.jsonl"
OUT_PATH = "data/findings.json"

# The denominator for blocker analysis. post_purchase is kept out: it describes
# what went wrong after buying, not what is stopping a purchase now. It is
# reported separately as context.
RELEVANT = ("deferred_purchase", "purchase_decision")

QUOTES_PER_BLOCKER = 5


def load():
    rows = []
    with open(IN_PATH, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return rows


def count(rows, field):
    return dict(Counter(r.get(field, "unclear") for r in rows))


def count_multi(rows, field):
    c = Counter()
    for r in rows:
        for v in r.get(field) or []:
            c[v] += 1
    return dict(c)


def cross_tab(rows, by_field, allowed=None):
    """blocker counts split by the value of by_field. Each cell carries its n."""
    groups = defaultdict(list)
    for r in rows:
        key = r.get(by_field, "unclear")
        if allowed and key not in allowed:
            key = "unclear"
        groups[key].append(r)
    return {
        key: {"n": len(items), "blockers": count_multi(items, "blockers")}
        for key, items in sorted(groups.items())
    }


def pick_quotes(rows):
    """Verbatim evidence per blocker, highest-confidence first. Never edited."""
    rank = {"high": 0, "medium": 1, "low": 2}
    by_blocker = defaultdict(list)
    for r in rows:
        if not (r.get("evidence") or "").strip():
            continue
        for b in r.get("blockers") or []:
            by_blocker[b].append(r)

    out = {}
    for blocker, items in by_blocker.items():
        items.sort(key=lambda r: rank.get(r.get("confidence"), 3))
        seen = set()
        picked = []
        for r in items:
            ev = r["evidence"].strip()
            if ev.lower() in seen:
                continue
            seen.add(ev.lower())
            picked.append({
                "evidence": ev,
                "text": r.get("text", "")[:300],
                "source": r.get("source", ""),
                "platform": r.get("platform", ""),
                "date": r.get("date", ""),
                "url": r.get("url", ""),
                "confidence": r.get("confidence", ""),
            })
            if len(picked) >= QUOTES_PER_BLOCKER:
                break
        out[blocker] = picked
    return out


def main():
    if not os.path.exists(IN_PATH):
        raise SystemExit(f"{IN_PATH} not found. Run classify.py first.")

    rows = load()
    relevant = [r for r in rows if r.get("relevance") in RELEVANT]

    findings = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "denominator_note": (
            "Blocker analysis counts only relevance in "
            f"{list(RELEVANT)}. post_purchase and irrelevant are excluded "
            "from every blocker figure and reported only in corpus counts."
        ),
        "corpus": {
            "total_tagged": len(rows),
            "by_source": count(rows, "source"),
            "by_relevance": count(rows, "relevance"),
            "relevant_n": len(relevant),
        },
        "blockers": {
            "n": len(relevant),
            "items_with_blocker": sum(1 for r in relevant if r.get("blockers")),
            "overall": count_multi(relevant, "blockers"),
            "labels": taxonomy.BLOCKERS,
        },
        # The differentiating cross-tab: same blocker, different uncertainty.
        "blockers_by_uncertainty": cross_tab(
            relevant, "uncertainty_object", set(taxonomy.UNCERTAINTY_OBJECT)),
        "blockers_by_intent": cross_tab(
            relevant, "saving_intent", set(taxonomy.SAVING_INTENT)),
        "blockers_by_source": cross_tab(relevant, "source"),
        "uncertainty_overall": count(relevant, "uncertainty_object"),
        "saving_intent_overall": count(relevant, "saving_intent"),
        "workarounds_overall": {
            "n": len(relevant),
            "counts": count_multi(relevant, "workarounds"),
            "labels": taxonomy.WORKAROUNDS,
        },
        "outcome_overall": count(relevant, "outcome"),
        "segment_overall": count(relevant, "segment"),
        "confidence_overall": count(relevant, "confidence"),
        "quotes": pick_quotes(relevant),
    }

    os.makedirs("data", exist_ok=True)
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(findings, f, ensure_ascii=False, indent=2)

    # Terminal summary
    c = findings["corpus"]
    print(f"{c['total_tagged']} tagged items")
    for k, v in sorted(c["by_relevance"].items(), key=lambda x: -x[1]):
        print(f"  {k:20s} {v}")
    print(f"\nBlocker mix (n={len(relevant)} relevant items):")
    for k, v in sorted(findings["blockers"]["overall"].items(),
                       key=lambda x: -x[1]):
        print(f"  {k:22s} {v}")
    print("\nBlockers by uncertainty_object:")
    for unc, cell in findings["blockers_by_uncertainty"].items():
        top = sorted(cell["blockers"].items(), key=lambda x: -x[1])[:3]
        top_s = ", ".join(f"{k} {v}" for k, v in top) or "none"
        print(f"  {unc:16s} n={cell['n']:<5d} top: {top_s}")
    print(f"\nWrote {OUT_PATH}")
    print("\nNext: streamlit run app.py")


if __name__ == "__main__":
    main()
