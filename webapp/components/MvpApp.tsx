"use client";

import Image from "next/image";
import { useState } from "react";

type Review = { text: string; rating: number | null };
type Product = {
  style_id: string; brand: string; name: string; price: string;
  rating: number | null; rating_count: number | null; url: string;
  image?: string | null;
  reviews: Review[];
};
type Quote = { n?: number; text: string } | null;
type Verdict = {
  safety: "looks_safe" | "has_risks" | "reviews_cant_settle";
  headline: string; risk: string; size_note: string;
  key_quote: Quote; evidence_strength: string;
};
type BriefSection = {
  verdict: string; n_mentions: number; summary: string;
  quotes: { n?: number; text: string }[];
};
type Brief = {
  size_read: BriefSection; quality_read: BriefSection;
  photo_reality: BriefSection; worth_read: BriefSection;
  bottom_line: string; gaps: string[];
};
type Progress = { steps: string[]; current: number } | null;

const SAFETY = {
  looks_safe: { cls: "safe", label: "Evidence supports buying" },
  has_risks: { cls: "risk", label: "Evidence shows risks" },
  reviews_cant_settle: { cls: "unsettled", label: "Not enough evidence" },
} as const;

const DOUBTS: Record<string, string> = {
  size: "Will it fit me?",
  quality: "Is the quality good?",
  worth: "Worth the price?",
  photos: "Like the photos?",
  general: "Just tell me",
};

const SECTION_TITLES: Record<keyof Omit<Brief, "bottom_line" | "gaps">, string> = {
  size_read: "Size and fit",
  quality_read: "Quality and material",
  photo_reality: "Photos vs reality",
  worth_read: "Worth the price",
};

const SECTION_VERDICTS: Record<string, string> = {
  runs_small: "Runs small", true_to_size: "True to size",
  runs_large: "Runs large", mixed: "Buyers disagree",
  no_evidence: "Reviews don't say", positive: "Buyers are happy",
  negative: "Buyers complain", matches: "Matches the photos",
  differs: "Differs from photos", worth_it: "Buyers say worth it",
  not_worth_it: "Buyers say not worth it",
};

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "request failed");
  return j as T;
}

function ProgressCard({ prog }: { prog: Progress }) {
  if (!prog) return null;
  return (
    <div className="progress-card reveal">
      <div className="ptitle"><span className="spin" />Working on it</div>
      <div className="psub">
        Real reviews are being fetched and read right now. This usually takes
        20 to 60 seconds. Nothing is cached and nothing is invented.
      </div>
      <ol>
        {prog.steps.map((s, i) => (
          <li key={i} className={i < prog.current ? "done" : i === prog.current ? "now" : ""}>
            <span className="dot">✓</span>{s}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FeedbackRow({ kind, styleId, doubt }: {
  kind: string; styleId: string; doubt?: string;
}) {
  const [settled, setSettled] = useState("");
  const [action, setAction] = useState("");
  const [sent, setSent] = useState(false);

  async function send(s: string, a: string) {
    if (!s || !a || sent) return;
    setSent(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, settled: s, action: a, style_id: styleId, doubt }),
      });
    } catch { /* logging must never break the page */ }
  }

  if (sent) {
    return (
      <div className="notice reveal">
        Noted, thank you. This is the exact signal the product would measure
        at scale: did the answer settle the doubt, and what happened next.
      </div>
    );
  }
  return (
    <div className="card" style={{ background: "var(--paper-deep)" }}>
      <p style={{ fontWeight: 600 }}>Did this settle your doubt?</p>
      <div className="choices" style={{ marginBottom: 6 }}>
        {["Yes", "Partly", "No"].map((s) => (
          <button key={s} className={`chip${settled === s ? " on" : ""}`}
            type="button"
            onClick={() => { setSettled(s); send(s, action); }}>{s}</button>
        ))}
      </div>
      <p style={{ fontWeight: 600 }}>And what would you do with this item now?</p>
      <div className="choices" style={{ marginBottom: 0 }}>
        {["Buy it", "Keep it saved", "Remove it"].map((a) => (
          <button key={a} className={`chip${action === a ? " on" : ""}`}
            type="button"
            onClick={() => { setAction(a); send(settled, a); }}>{a}</button>
        ))}
      </div>
    </div>
  );
}

function Thumb({ p, size = 74 }: { p: Product; size?: number }) {
  if (!p.image) return null;
  return (
    <div className="thumb" style={{ width: size }}>
      <Image src={p.image} alt={p.name} width={size} height={Math.round(size * 4 / 3)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

function PickGrid({ demos, selected, toggle }: {
  demos: Product[]; selected: Set<string>;
  toggle: (id: string) => void;
}) {
  return (
    <div className="pick-grid">
      {demos.map((p) => {
        const on = selected.has(p.style_id);
        return (
          <button key={p.style_id} className={`pcard${on ? " on" : ""}`}
            onClick={() => toggle(p.style_id)} type="button">
            <div className="ph">
              {p.image && (
                <Image src={p.image} alt={p.name} fill sizes="180px"
                  style={{ objectFit: "cover" }} />
              )}
              {on && <span className="tick">✓</span>}
            </div>
            <div className="info">
              <div className="b">{p.brand}</div>
              <div className="nm">{p.name}</div>
              <div className="pr">{p.price}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MetaLine({ p }: { p: Product }) {
  return (
    <div className="muted" style={{ marginTop: 3 }}>
      {p.price && <>{p.price} · </>}
      {p.rating != null && <>rated {p.rating} by {p.rating_count ?? "?"} buyers · </>}
      {p.reviews.length} reviews read ·{" "}
      <a href={p.url} target="_blank" rel="noreferrer"
        style={{ color: "var(--berry)" }}>view on Myntra</a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single-item deep brief
// ---------------------------------------------------------------------------

function BriefMode({ demos }: { demos: Product[] }) {
  const [picked, setPicked] = useState<string | null>(demos[0]?.style_id ?? null);
  const [url, setUrl] = useState("");
  const [doubt, setDoubt] = useState("size");
  const [prog, setProg] = useState<Progress>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ product: Product; brief: Brief } | null>(null);

  async function go() {
    setError(""); setResult(null);
    const live = !!url.trim();
    const steps = live
      ? ["Fetching the product and its reviews from Myntra",
         "Reading every review", "Writing your answer"]
      : ["Loading the item", "Reading every review", "Writing your answer"];
    try {
      let product: Product;
      if (live) {
        setProg({ steps, current: 0 });
        product = await post<Product>("/api/product", { url });
        if (!product.reviews.length) {
          throw new Error("This item has no readable buyer reviews. That is itself worth knowing before you buy.");
        }
      } else {
        const p = demos.find((d) => d.style_id === picked);
        if (!p) { setError("Pick an item or paste a link."); return; }
        product = p;
      }
      setProg({ steps, current: 2 });
      const brief = await post<Brief>("/api/brief", { product, doubt });
      setResult({ product, brief });
      setProg(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProg(null);
    }
  }

  const focusKey = ({ size: "size_read", quality: "quality_read", worth: "worth_read", photos: "photo_reality" } as Record<string, string>)[doubt];
  const selectedSet = new Set(picked && !url.trim() ? [picked] : []);

  return (
    <div>
      <p className="small">Pick one item, or paste a live link, and say your doubt.</p>
      <PickGrid demos={demos} selected={selectedSet}
        toggle={(id) => { setPicked(id); setUrl(""); }} />
      <div className="live-panel">
        <div className="live-head">
          <span className="live-badge">Live</span>
          Or any item on Myntra, right now
        </div>
        <div className="sub">
          Paste any myntra.com product link. It is fetched live with its real
          buyer reviews.
        </div>
        <input type="text" value={url}
          placeholder="https://www.myntra.com/dresses/brand/…/31034107/buy"
          onChange={(e) => setUrl(e.target.value)} />
      </div>
      <div className="choices">
        {Object.entries(DOUBTS).map(([k, label]) => (
          <button key={k} className={`chip${doubt === k ? " on" : ""}`}
            onClick={() => setDoubt(k)} type="button">{label}</button>
        ))}
      </div>
      <button className="btn" onClick={go} disabled={!!prog}>
        Read the reviews for me
      </button>
      <ProgressCard prog={prog} />
      {error && <div className="error-box">{error}</div>}
      {result && (
        <div className="reveal" style={{ marginTop: 22 }}>
          <div className="card-flex">
            <Thumb p={result.product} size={92} />
            <div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20 }}>
                {result.product.brand}: {result.product.name}
              </h3>
              <MetaLine p={result.product} />
            </div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid var(--berry)" }}>
            <div className="kicker">The bottom line</div>
            <p>{result.brief.bottom_line}</p>
            <p className="muted" style={{ marginTop: 8 }}>
              Built only from the {result.product.reviews.length} buyer
              reviews fetched for this item. Quotes are word for word,
              checked by the system against the review text.
            </p>
            <a className="btn" href={result.product.url} target="_blank"
              rel="noreferrer" style={{ marginTop: 14 }}>
              Open it on Myntra
            </a>
          </div>
          {(Object.keys(SECTION_TITLES) as (keyof typeof SECTION_TITLES)[])
            .sort((a, b) => (a === focusKey ? -1 : b === focusKey ? 1 : 0))
            .map((key) => {
              const sec = result.brief[key];
              if (!sec) return null;
              return (
                <div className="card" key={key}>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3>{key === focusKey ? "🔎 " : ""}{SECTION_TITLES[key]}</h3>
                    <span className="badge plain">
                      {SECTION_VERDICTS[sec.verdict] ?? sec.verdict}
                    </span>
                    {sec.n_mentions > 0 && (
                      <span className="muted">{sec.n_mentions} review{sec.n_mentions !== 1 ? "s" : ""} mention this</span>
                    )}
                  </div>
                  {sec.summary && <p style={{ marginTop: 8 }}>{sec.summary}</p>}
                  {(sec.quotes ?? []).slice(0, 4).map((q, i) => (
                    <blockquote key={i}>
                      “{q.text}”<span className="who">buyer review</span>
                    </blockquote>
                  ))}
                </div>
              );
            })}
          {result.brief.gaps?.length > 0 && (
            <div className="notice">
              <strong>What these reviews do not answer:</strong>
              <ul style={{ margin: "6px 0 0 20px" }}>
                {result.brief.gaps.map((g, i) => <li key={i}>{g}</li>)}
              </ul>
            </div>
          )}
          <FeedbackRow kind="brief" styleId={result.product.style_id} doubt={doubt} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Wishlist ranking
// ---------------------------------------------------------------------------

function WishlistMode({ demos }: { demos: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [urls, setUrls] = useState("");
  const [prog, setProg] = useState<Progress>(null);
  const [error, setError] = useState("");
  const [ranked, setRanked] = useState<{ product: Product; verdict: Verdict }[] | null>(null);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  }

  async function run(products: Product[], steps: string[], reviewStep: number) {
    setProg({ steps, current: reviewStep });
    const results = await Promise.all(products.map(async (p) => {
      try {
        return { product: p, verdict: await post<Verdict>("/api/verdict", { product: p }) };
      } catch {
        return {
          product: p,
          verdict: {
            safety: "reviews_cant_settle", headline:
              "Could not read this item's reviews right now.",
            risk: "", size_note: "", key_quote: null, evidence_strength: "thin",
          } as Verdict,
        };
      }
    }));
    setProg({ steps, current: reviewStep + 1 });
    const order = { looks_safe: 0, has_risks: 1, reviews_cant_settle: 2 };
    results.sort((a, b) =>
      order[a.verdict.safety] - order[b.verdict.safety] ||
      b.product.reviews.length - a.product.reviews.length);
    setRanked(results);
    setProg(null);
  }

  async function goSelected() {
    setError(""); setRanked(null);
    const chosen = demos.filter((d) => selected.has(d.style_id));
    if (!chosen.length) { setError("Tap a few items first."); return; }
    await run(chosen,
      [`Reading buyer reviews for ${chosen.length} items at once`,
       "Ranking them, safest first"], 0);
  }

  async function goLinks() {
    setError(""); setRanked(null);
    const lines = urls.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5);
    if (!lines.length) { setError("Paste at least one Myntra product link."); return; }
    const steps = [
      `Fetching ${lines.length} item${lines.length > 1 ? "s" : ""} from Myntra, one by one`,
      "Reading buyer reviews for each item",
      "Ranking them, safest first"];
    try {
      setProg({ steps, current: 0 });
      const products: Product[] = [];
      for (const line of lines) {
        try { products.push(await post<Product>("/api/product", { url: line })); }
        catch { /* skip items that cannot be fetched */ }
      }
      if (!products.length) {
        throw new Error("None of those links could be fetched. Myntra may be blocking automated visits right now. The sample items always work.");
      }
      await run(products, steps, 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProg(null);
    }
  }

  const counts = ranked
    ? ranked.reduce<Record<string, number>>((acc, r) => {
        acc[r.verdict.safety] = (acc[r.verdict.safety] ?? 0) + 1; return acc;
      }, {})
    : {};
  const summaryWord: Record<string, string> = {
    looks_safe: "with supporting evidence", has_risks: "with evidence of risks",
    reviews_cant_settle: "without enough evidence",
  };

  return (
    <div>
      <p className="small">
        Tap items to build a wishlist (up to five), then rank it.
      </p>
      <PickGrid demos={demos} selected={selected} toggle={toggle} />
      <button className="btn" onClick={goSelected} disabled={!!prog || selected.size === 0}>
        {`Rank ${selected.size || "my"} item${selected.size !== 1 ? "s" : ""}`}
      </button>
      <div className="live-panel">
        <div className="live-head">
          <span className="live-badge">Live</span>
          Or rank your own real wishlist
        </div>
        <div className="sub">
          Open Myntra, copy the links of items you have saved, and paste them
          here. One per line, up to five. They are fetched live from
          myntra.com, reviews and all. Not samples.
        </div>
        <textarea rows={3} value={urls}
          placeholder={"https://www.myntra.com/…/31034107/buy\nhttps://www.myntra.com/…/33720581/buy"}
          onChange={(e) => setUrls(e.target.value)} />
        <button className="btn" style={{ marginTop: 12 }}
          onClick={goLinks} disabled={!!prog}>
          Fetch & rank my real items
        </button>
      </div>
      <ProgressCard prog={prog} />
      {error && <div className="error-box">{error}</div>}
      {ranked && (
        <div className="reveal" style={{ marginTop: 22 }}>
          <p>
            <strong>{ranked.length} item{ranked.length > 1 ? "s" : ""}, safest first</strong>
            {": "}
            {Object.entries(summaryWord)
              .filter(([k]) => counts[k])
              .map(([k, w]) => `${counts[k]} ${w}`)
              .join(", ")}.
          </p>
          {ranked.length > 1 && ranked[0].verdict.safety === "looks_safe" &&
            ranked.some((r) => r.verdict.safety !== "looks_safe") && (
            <div className="notice">
              Worried about the risky ones? Your own list already holds the
              most evidence-backed option: start with #1,{" "}
              <strong>{ranked[0].product.brand}</strong>.
            </div>
          )}
          {ranked.map(({ product: p, verdict: v }, i) => (
            <div className="card" key={p.style_id}>
              <div className="card-flex">
                <Thumb p={p} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3>{i + 1}. {p.brand}: {p.name.slice(0, 60)}</h3>
                    <span className={`badge ${SAFETY[v.safety].cls}`}>{SAFETY[v.safety].label}</span>
                    {i === 0 && v.safety === "looks_safe" && (
                      <span className="badge plain">Most evidence-backed in your list</span>
                    )}
                  </div>
                  <MetaLine p={p} />
                  <p style={{ marginTop: 10 }}>{v.headline}</p>
                  {v.risk && <p style={{ marginTop: 6 }}>⚠️ {v.risk}</p>}
                  {v.size_note && <p style={{ marginTop: 6 }}>📏 {v.size_note}</p>}
                  {v.key_quote && (
                    <blockquote>
                      “{v.key_quote.text}”<span className="who">buyer review</span>
                    </blockquote>
                  )}
                  {v.evidence_strength === "thin" && (
                    <p className="muted">Thin evidence: few usable reviews.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <p className="muted">
            Ranked only by what buyer reviews show. For any single item, use
            the deep answer above.
          </p>
          <FeedbackRow kind="ranking"
            styleId={ranked.map((r) => r.product.style_id).join(",")} />
        </div>
      )}
    </div>
  );
}

export default function MvpApp({ demos }: { demos: Product[] }) {
  return (
    <>
      <section className="section-block" style={{ borderTop: "none", paddingTop: 10 }}>
        <h2 className="section">One item, in depth</h2>
        <BriefMode demos={demos} />
      </section>
      <section className="section-block">
        <h2 className="section">Then rank a whole wishlist</h2>
        <WishlistMode demos={demos} />
      </section>
    </>
  );
}
