"""
classify.py
Tags every item in data/raw_corpus.csv against the taxonomy.

  export ANTHROPIC_API_KEY=sk-ant-...
  python classify.py

Writes data/tagged_corpus.jsonl one line at a time, so it is safe to stop and
restart. Already-tagged ids are skipped on a rerun.
"""

import csv
import json
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

import anthropic

import taxonomy
from collect import _load_dotenv

_load_dotenv()

MODEL = "claude-sonnet-4-6"      # swap to claude-haiku-4-5 to cut cost ~4x
WORKERS = 8
IN_PATH = "data/raw_corpus.csv"
OUT_PATH = "data/tagged_corpus.jsonl"

client = anthropic.Anthropic()
write_lock = threading.Lock()

# field -> (allowed values, fallback when the model returns something off-schema)
VALID = {
    "relevance":          (set(taxonomy.RELEVANCE), "irrelevant"),
    "uncertainty_object": (set(taxonomy.UNCERTAINTY_OBJECT), "not_applicable"),
    "saving_intent":      (set(taxonomy.SAVING_INTENT), "unclear"),
    "segment":            (set(taxonomy.SEGMENT), "unclear"),
    "outcome":            (set(taxonomy.OUTCOME), "unclear"),
}


def load_done():
    done = set()
    if os.path.exists(OUT_PATH):
        with open(OUT_PATH, encoding="utf-8") as f:
            for line in f:
                try:
                    done.add(json.loads(line)["id"])
                except Exception:
                    pass
    return done


def parse(raw):
    """Model should return bare JSON. Strip fences defensively."""
    t = raw.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[1] if "\n" in t else t
        t = t.rsplit("```", 1)[0]
    t = t.strip()
    start = t.find("{")
    if start == -1:
        raise ValueError("no JSON object found")
    # raw_decode takes the first complete object and ignores anything after
    # it, so a model that emits two objects back to back still parses.
    obj, _ = json.JSONDecoder().raw_decode(t[start:])
    return obj


def validate(tags):
    """Coerce anything off-schema to a safe default rather than dropping the row."""
    for field, (allowed, fallback) in VALID.items():
        if tags.get(field) not in allowed:
            tags[field] = fallback

    tags["blockers"] = [b for b in (tags.get("blockers") or [])
                        if b in taxonomy.BLOCKERS]
    tags["workarounds"] = [w for w in (tags.get("workarounds") or [])
                           if w in taxonomy.WORKAROUNDS]

    if tags.get("confidence") not in ("high", "medium", "low"):
        tags["confidence"] = "low"

    ev = tags.get("evidence") or ""
    tags["evidence"] = " ".join(str(ev).split()[:20])
    return tags


def tag_one(row):
    prompt = taxonomy.build_prompt(row["text"], row["source"])
    resp = client.messages.create(
        model=MODEL,
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    text = "".join(b.text for b in resp.content if b.type == "text")
    tags = validate(parse(text))

    return {
        "id": row["id"],
        "source": row["source"],
        "platform": row["platform"],
        "date": row["date"],
        "rating": row["rating"],
        "url": row["url"],
        "text": row["text"][:600],
        **tags,
        "_in_tokens": resp.usage.input_tokens,
        "_out_tokens": resp.usage.output_tokens,
    }


def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        sys.exit("Set ANTHROPIC_API_KEY first")
    if not os.path.exists(IN_PATH):
        sys.exit(f"{IN_PATH} not found. Run collect.py first.")

    with open(IN_PATH, encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    done = load_done()
    todo = [r for r in rows if r["id"] not in done]
    print(f"{len(rows)} items, {len(done)} already tagged, {len(todo)} to do\n")
    if not todo:
        print("Nothing to do. Next: python analyze.py")
        return

    ok = err = 0
    tok_in = tok_out = 0

    with open(OUT_PATH, "a", encoding="utf-8") as out:
        with ThreadPoolExecutor(max_workers=WORKERS) as pool:
            futures = {pool.submit(tag_one, r): r for r in todo}
            for i, fut in enumerate(as_completed(futures), 1):
                row = futures[fut]
                try:
                    rec = fut.result()
                    tok_in += rec.pop("_in_tokens", 0)
                    tok_out += rec.pop("_out_tokens", 0)
                    with write_lock:
                        out.write(json.dumps(rec, ensure_ascii=False) + "\n")
                        out.flush()
                    ok += 1
                except Exception as e:
                    err += 1
                    if err <= 5:
                        print(f"  ! {row['id']}: {type(e).__name__} {e}")

                if i % 50 == 0 or i == len(todo):
                    print(f"  {i}/{len(todo)}   ok {ok}  err {err}")

    print(f"\nDone. {ok} tagged, {err} failed.")
    print(f"Tokens: {tok_in:,} in / {tok_out:,} out")
    print(f"Wrote {OUT_PATH}")
    if err:
        print("Rerun to retry the failures, already-done items are skipped.")
    print("\nNext: python analyze.py")


if __name__ == "__main__":
    main()
