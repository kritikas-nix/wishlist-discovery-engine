"""
survey_analyze.py
Analyses data/survey_responses.csv (Google Form export, Q34 contact column
removed) and writes data/survey_findings.json plus a terminal report.

  python survey_analyze.py

Columns are addressed by position because the three item blocks repeat the
same headers. Every figure is a raw count with n; percentages are left out
below n=20 on purpose.
"""

import csv
import json
import os
from collections import Counter, defaultdict

IN_PATH = "data/survey_responses.csv"
OUT_PATH = "data/survey_findings.json"

# Column positions in the export (contact column already stripped).
COL = {
    "occupation": 3, "myntra_freq": 5, "wishlist_size": 7,
    "wishlist_opened": 8, "usage_type": 9,
    "q27_remembered": 27, "workarounds": 28, "call_optin": 33,
}
# Each item block: (label, first column). Block = item, when saved,
# still want, free-text blocker, tick-box blocker.
ITEM_BLOCKS = [("top", 12), ("third", 17), ("bottom", 22)]

# Survey tick-box option -> engine taxonomy blocker key. Deliberately 1:1
# with taxonomy.BLOCKERS so scraped and survey data compare on one axis.
BLOCKER_MAP = {
    "Not sure about the size or fit": "fit_size",
    "Not sure it would suit me or look good on me": "suitability_on_me",
    "Not sure about the quality or material": "quality_material",
    "Too expensive right now": "price_absolute",
    "Not sure it is worth the price": "price_worth",
    "Waiting for a sale or price drop": "waiting_sale",
    "Waiting for an occasion to wear it": "waiting_occasion",
    "I want someone else's opinion first": "social_validation",
    "Want someone else to give an opinion first": "social_validation",
    "My size is no longer available": "stock_unavailable",
    "The return or exchange process puts me off": "returns_friction",
    "Too many similar options to choose between": "decision_overload",
    "I do not trust the photos or reviews": "trust_platform",
    "I forgot it was in there": "forgot_never_returned",
    "I forgot it was there": "forgot_never_returned",
    "Nothing specific, just have not got round to it": "none_stated",
    "I already bought it": "_bought",   # outcome, not a blocker
}

# Item blocks where the item field is one of these are placeholders from
# people who do not really use the wishlist; they stay out of blocker counts.
NON_ITEMS = {"", "na", "none"}

WORKAROUND_MAP = {
    "Send a screenshot to a friend or a group chat": "ask_friend",
    "Ask a family member": "ask_friend",
    "Look at photos other buyers have posted in the reviews": "review_photos",
    "Read the low star reviews specifically": "negative_reviews",
    "Search the brand or item on YouTube": "youtube_search",
    "Search it on Instagram": "instagram_search",
    "Check the same item on another shopping app": "competitor_check",
    "Measure a garment I own against the size chart": "size_chart_compare",
    "Go to a shop to try the size, then buy online": "offline_try",
    "Order two sizes planning to return one": "order_two_sizes",
    "Check the size chart against something you own": "size_chart_compare",
    "None of these, I just decide or I do not": "none",
}


def parse_multi(cell, mapping):
    """Match known options as substrings; report anything left unmatched."""
    cell = (cell or "").strip()
    found, rest = [], cell
    for option, key in mapping.items():
        if option in rest:
            found.append(key)
            rest = rest.replace(option, "")
    rest = rest.replace(",", " ").strip()
    return found, (rest if len(rest) > 3 else "")


def seg_occupation(v):
    return "student" if "stud" in (v or "").lower() else "working"


def seg_usage(v):
    v = (v or "").lower()
    if "planning to buy" in v:
        return "intent_saver"
    if "might never buy" in v:
        return "bookmark_saver"
    return "other"


def main():
    if not os.path.exists(IN_PATH):
        raise SystemExit(f"{IN_PATH} not found.")
    with open(IN_PATH, encoding="utf-8") as f:
        rows = [r for r in csv.reader(f)][1:]
    rows = [r for r in rows if len(r) > COL["workarounds"]]
    n = len(rows)

    unmatched = Counter()
    items = []          # one record per item block per respondent
    for ri, r in enumerate(rows):
        for label, c in ITEM_BLOCKS:
            if r[c].strip().lower() in NON_ITEMS:
                continue
            ticks, rest = parse_multi(r[c + 4], BLOCKER_MAP)
            if rest:
                unmatched[rest] += 1
            items.append({
                "resp": ri,
                "position": label,
                "when_saved": r[c + 1].strip(),
                "still_want": r[c + 2].strip(),
                "freetext": r[c + 3].strip(),
                "blockers": [t for t in ticks if t != "_bought"],
                "bought": "_bought" in ticks,
                "occupation": seg_occupation(r[COL["occupation"]]),
                "usage": seg_usage(r[COL["usage_type"]]),
            })

    def blocker_mix(subset):
        c = Counter()
        for it in subset:
            for b in it["blockers"]:
                c[b] += 1
        return dict(c.most_common())

    answered = [it for it in items if it["blockers"] or it["bought"]]

    findings = {
        "n_respondents": n,
        "n_item_answers": len(answered),
        "note": "Raw counts only; n is far below 20 in every cell.",
        "blockers_all_positions": {
            "n_items": len(answered), "counts": blocker_mix(answered)},
        "blockers_by_position": {
            pos: {"n_items": len([i for i in answered if i["position"] == pos]),
                  "counts": blocker_mix(
                      [i for i in answered if i["position"] == pos])}
            for pos, _ in ITEM_BLOCKS},
        "q27_bottom_item_memory": dict(Counter(
            r[COL["q27_remembered"]].strip() for r in rows)),
        "still_want_by_when_saved": {},
        "app_often_wishlist_rarely": [],
        "blockers_by_occupation": {
            seg: blocker_mix([i for i in answered if i["occupation"] == seg])
            for seg in ("student", "working")},
        "blockers_by_usage": {
            seg: blocker_mix([i for i in answered if i["usage"] == seg])
            for seg in ("intent_saver", "bookmark_saver")},
        "workarounds": {},
        "already_bought_items": sum(1 for i in items if i["bought"]),
        "call_optins": sum(1 for r in rows
                           if (r[COL["call_optin"]] or "").startswith("Yes")),
        "unmatched_blocker_text": dict(unmatched),
    }

    decay = defaultdict(Counter)
    for it in items:
        if it["when_saved"] and it["still_want"]:
            decay[it["when_saved"]][it["still_want"]] += 1
    findings["still_want_by_when_saved"] = {
        k: dict(v) for k, v in decay.items()}

    wa = Counter()
    for r in rows:
        found, _ = parse_multi(r[COL["workarounds"]], WORKAROUND_MAP)
        for w in set(found):
            wa[w] += 1
    findings["workarounds"] = dict(wa.most_common())

    for r in rows:
        opens_often = "week" in r[COL["myntra_freq"]].lower()
        wl = r[COL["wishlist_opened"]].lower()
        wl_rarely = ("cannot remember" in wl) or ("longer ago" in wl)
        if opens_often and wl_rarely:
            findings["app_often_wishlist_rarely"].append(
                f"respondent {rows.index(r) + 1}")

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(findings, f, ensure_ascii=False, indent=2)

    print(f"n = {n} respondents, {len(answered)} item answers\n")
    print("Blockers, all item positions combined:")
    for k, v in findings["blockers_all_positions"]["counts"].items():
        print(f"  {k:20s} {v}")
    print("\nBottom item — remembered it existed? (Q27)")
    for k, v in findings["q27_bottom_item_memory"].items():
        print(f"  {k:40s} {v}")
    print("\nTop vs bottom blocker mix:")
    for pos in ("top", "bottom"):
        d = findings["blockers_by_position"][pos]
        print(f"  {pos}: n={d['n_items']} {d['counts']}")
    print("\nBy usage type:")
    for seg, d in findings["blockers_by_usage"].items():
        print(f"  {seg}: {d}")
    print("\nOpens app weekly but wishlist rarely:",
          len(findings["app_often_wishlist_rarely"]), "of", n)
    if unmatched:
        print("\nUNMATCHED blocker text (extend BLOCKER_MAP):")
        for k, v in unmatched.items():
            print(f"  {v}x  {k[:80]}")
    print(f"\nWrote {OUT_PATH}")


if __name__ == "__main__":
    main()
