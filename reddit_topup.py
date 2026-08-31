"""
reddit_topup.py
One-off: runs only the startUrls Reddit pass and appends any new rows to
data/raw_corpus.csv, without touching the other already-collected sources.

  python reddit_topup.py

Safe to run while classify.py is running: classify reads the CSV once at
start, and a later rerun of classify picks up the appended rows by id.
"""

import csv
import os

import collect

CSV_PATH = "data/raw_corpus.csv"
FIELDS = ["id", "source", "platform", "date", "rating", "text", "url"]


def main():
    if not os.path.exists(CSV_PATH):
        raise SystemExit(f"{CSV_PATH} not found. Run collect.py first.")

    with open(CSV_PATH, encoding="utf-8") as f:
        existing = list(csv.DictReader(f))
    known_ids = {r["id"] for r in existing}
    known_text = {r["text"][:160].lower() for r in existing}

    runs = [r for r in collect.REDDIT_RUNS if r.get("startUrls")]
    rows = collect.clean(collect.collect_reddit(runs=runs))

    new = [r for r in rows
           if r["id"] not in known_ids
           and r["text"][:160].lower() not in known_text]

    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writerows(new)

    print(f"\nAppended {len(new)} new reddit rows "
          f"({len(rows) - len(new)} were duplicates). "
          f"Corpus is now {len(existing) + len(new)} items.")
    print("Next: python classify.py   (only the new rows get tagged)")


if __name__ == "__main__":
    main()
