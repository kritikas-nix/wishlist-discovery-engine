# Myntra wishlist discovery engine

Pulls public conversations about online fashion shopping in India, tags each
one against a fixed schema, and aggregates the result so opportunity areas can
be counted and compared rather than described.

## Setup

    pip install -r requirements.txt
    export ANTHROPIC_API_KEY=sk-ant-...

## Run

    python collect.py      # -> data/raw_corpus.csv      (10-20 min)
    python classify.py     # -> data/tagged_corpus.jsonl (10-15 min)
    python analyze.py      # -> data/findings.json + charts

`classify.py` is resumable. Stop it any time and rerun, already-tagged items
are skipped.

## Files

- `taxonomy.py`  the classification schema and the tagging prompt
- `collect.py`   Play Store, Reddit, YouTube collection
- `classify.py`  LLM tagging pass, resumable, concurrent
- `analyze.py`   aggregation and cross-tabs
- `app.py`       Streamlit app, the public testable link

## Optional

YouTube needs a free key from console.cloud.google.com with YouTube Data API v3
enabled. Without it the script skips that source.

    export YOUTUBE_API_KEY=...
