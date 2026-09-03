"use client";

import { useState } from "react";

const EXAMPLE =
  "I added a kurta set to my wishlist last month. The size chart says 38 " +
  "but I don't know if that fits me, reviews say it runs small. Asked my " +
  "sister to check the photos.";

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
