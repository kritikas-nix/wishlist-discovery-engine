"use client";

import { useState } from "react";

const EXAMPLE =
  "I added a kurta set to my wishlist last month. The size chart says 38 " +
  "but I don't know if that fits me, reviews say it runs small. Asked my " +
  "sister to check the photos.";

const SAMPLES: { label: string; text: string; hint: string }[] = [
  {
    label: "A size doubt",
    text: EXAMPLE,
    hint: "watch it find the blocker and the workaround",
  },
  {
    label: "A worth-it doubt",
    text: "Saved a Rs 4000 dress weeks ago. I can afford it but I keep " +
      "wondering if it is really worth that much. Checked the same one on " +
      "Ajio too.",
    hint: "watch it separate can't-afford from not-sure-it's-worth-it",
  },
  {
    label: "A delivery complaint",
    text: "Delivery guy came at 11 pm and my refund for the cancelled " +
      "order is still pending after two weeks. Worst customer service.",
    hint: "watch the filter reject it as irrelevant",
  },
];

type Tags = {
  relevance: string; uncertainty_object: string; saving_intent: string;
  confidence: string; blockers: string[]; workarounds: string[];
  evidence: string;
};

export default function Classifier({
  blockerLabels, workaroundLabels,
}: {
  blockerLabels: Record<string, string>;
  workaroundLabels: Record<string, string>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [tags, setTags] = useState<Tags | null>(null);
  const [error, setError] = useState("");

  async function go() {
    setBusy(true); setError(""); setTags(null);
    try {
      const r = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "failed");
      setTags(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Classification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <p style={{ fontWeight: 600 }}>What this is</p>
        <p className="small">
          The exact AI tagging step that built the dataset above, running
          live. Whatever you type gets the same treatment as the 1,309
          collected items: is it a real purchase deliberation, what is
          blocking it, whose doubt it is, and the words that prove it.
        </p>
        <p style={{ fontWeight: 600, marginTop: 12 }}>How to use it</p>
        <p className="small">
          1. Type anything a shopper might say, or tap an example below.
          {" "}2. Press Classify it. 3. In about ten seconds the tags
          appear, with the exact phrase the model used as evidence. Try to
          trick it: vague text comes back{" "}
          <span className="tag-code">unclear</span>, complaints come back{" "}
          <span className="tag-code">irrelevant</span>. Refusing to guess is
          the point.
        </p>
      </div>
      <div className="choices" style={{ marginTop: 0 }}>
        {SAMPLES.map((s) => (
          <button key={s.label} className="chip" type="button"
            title={s.hint} onClick={() => { setText(s.text); setTags(null); setError(""); }}>
            Try: {s.label}
          </button>
        ))}
      </div>
      <textarea
        rows={4}
        value={text}
        placeholder={EXAMPLE}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ marginTop: 14 }}>
        <button className="btn" onClick={go} disabled={busy || !text.trim()}>
          {busy ? <><span className="spin" />Classifying…</> : "Classify it"}
        </button>
      </div>
      {error && <div className="error-box">{error}</div>}
      {tags && (
        <div className="card reveal">
          <p><strong>Relevance:</strong> <span className="tag-code">{tags.relevance}</span></p>
          <p><strong>The doubt is about:</strong> <span className="tag-code">{tags.uncertainty_object}</span></p>
          <p><strong>Saving intent:</strong> <span className="tag-code">{tags.saving_intent}</span>
            {"  "}<strong style={{ marginLeft: 14 }}>Confidence:</strong> <span className="tag-code">{tags.confidence}</span></p>
          <p style={{ marginTop: 10 }}><strong>Blockers:</strong>{" "}
            {tags.blockers.length
              ? tags.blockers.map((b) => blockerLabels[b] ?? b).join(" · ")
              : "none tagged"}</p>
          {tags.workarounds.filter((w) => w !== "none").length > 0 && (
            <p><strong>Workarounds:</strong>{" "}
              {tags.workarounds.filter((w) => w !== "none")
                .map((w) => workaroundLabels[w] ?? w).join(" · ")}</p>
          )}
          {tags.evidence && (
            <blockquote>
              “{tags.evidence}”
              <span className="who">the evidence span the model points to</span>
            </blockquote>
          )}
        </div>
      )}
    </div>
  );
}
