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

const NICE: Record<string, string> = {
  deferred_purchase: "Deferred purchase", purchase_decision: "Purchase decision",
  post_purchase: "Post-purchase", irrelevant: "Irrelevant",
  about_product: "About the product", about_self: "About themselves",
  about_context: "About context (budget, occasion)", not_applicable: "Not applicable",
  intent_to_buy: "Intent to buy", bookmark: "Bookmark", compare: "Comparison",
  declutter: "Declutter", unclear: "Unclear",
  high: "High", medium: "Medium", low: "Low",
};
const nice = (v: string) => NICE[v] ?? v;

export default function Classifier({
  blockerLabels, workaroundLabels, totalTagged,
}: {
  blockerLabels: Record<string, string>;
  workaroundLabels: Record<string, string>;
  totalTagged: number;
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
          The same tagging schema and rules that built the dataset above,
          running live. Whatever you type gets the same treatment as the{" "}
          {totalTagged.toLocaleString()} collected items: is it a real
          purchase deliberation, what is blocking it, whose doubt it is,
          and the words that prove it.
        </p>
        <p style={{ fontWeight: 600, marginTop: 12 }}>How to use it</p>
        <p className="small">
          1. Type anything a shopper might say, or tap an example below.
          {" "}2. Press Classify it. 3. In about ten seconds the tags
          appear, with the exact phrase the model used as evidence. Try to
          trick it: vague text comes back{" "}
          <span className="tag-code">Unclear</span>, complaints come back{" "}
          <span className="tag-code">Irrelevant</span>. When evidence is
          insufficient, the model is instructed to return Unclear rather
          than infer.
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
          <p><strong>Relevance:</strong> <span className="tag-code">{nice(tags.relevance)}</span></p>
          <p><strong>The doubt is about:</strong> <span className="tag-code">{nice(tags.uncertainty_object)}</span></p>
          <p><strong>Saving intent:</strong> <span className="tag-code">{nice(tags.saving_intent)}</span>
            {"  "}<strong style={{ marginLeft: 14 }}>Confidence:</strong> <span className="tag-code">{nice(tags.confidence)}</span></p>
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
