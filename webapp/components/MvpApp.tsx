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

const SAFETY = {
  looks_safe: { cls: "safe", label: "Looks safe to buy" },
  has_risks: { cls: "risk", label: "Has real risks" },
  reviews_cant_settle: { cls: "unsettled", label: "Reviews can't settle it" },
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
// Wishlist ranking
// ---------------------------------------------------------------------------

function WishlistMode({ demos }: { demos: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [urls, setUrls] = useState("");
  const [phase, setPhase] = useState("");
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

  async function run(products: Product[]) {
    setPhase(`Reading reviews for ${products.length} items…`);
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
    const order = { looks_safe: 0, has_risks: 1, reviews_cant_settle: 2 };
    results.sort((a, b) =>
      order[a.verdict.safety] - order[b.verdict.safety] ||
      b.product.reviews.length - a.product.reviews.length);
    setRanked(results);
    setPhase("");
  }

  async function goSelected() {
    setError(""); setRanked(null);
    const chosen = demos.filter((d) => selected.has(d.style_id));
    if (!chosen.length) { setError("Tap a few items first."); return; }
    await run(chosen);
  }

  async function goLinks() {
    setError(""); setRanked(null);
    const lines = urls.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5);
    if (!lines.length) { setError("Paste at least one Myntra product link."); return; }
    try {
      setPhase(`Fetching ${lines.length} item${lines.length > 1 ? "s" : ""} from Myntra…`);
      const products: Product[] = [];
      for (const line of lines) {
        try { products.push(await post<Product>("/api/product", { url: line })); }
        catch { /* skip unfetchable */ }
      }
      if (!products.length) {
        throw new Error("None of those links could be fetched — Myntra may be blocking automated fetching right now. The sample items always work.");
      }
      await run(products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("");
    }
  }

  const counts = ranked
    ? ranked.reduce<Record<string, number>>((acc, r) => {
        acc[r.verdict.safety] = (acc[r.verdict.safety] ?? 0) + 1; return acc;
      }, {})
    : {};
  const summaryWord: Record<string, string> = {
    looks_safe: "safe to buy", has_risks: "with real risks",
    reviews_cant_settle: "unsettled",
  };

  return (
    <div>
      <p className="small">
        Tap items to build a wishlist (up to five), then rank it.
      </p>
      <PickGrid demos={demos} selected={selected} toggle={toggle} />
      <button className="btn" onClick={goSelected} disabled={!!phase || selected.size === 0}>
        {phase ? <><span className="spin" />{phase}</> :
          `Rank ${selected.size || "my"} item${selected.size !== 1 ? "s" : ""}`}
      </button>
      <div className="live-panel">
        <div className="live-head">
          <span className="live-badge">Live</span>
          Or rank your own real wishlist
        </div>
        <div className="sub">
          Open Myntra, copy the links of items you have saved, and paste them
          here — one per line, up to five. They are fetched live from
          myntra.com, reviews and all. Not samples.
        </div>
        <textarea rows={3} value={urls}
          placeholder={"https://www.myntra.com/…/31034107/buy\nhttps://www.myntra.com/…/33720581/buy"}
          onChange={(e) => setUrls(e.target.value)} />
        <button className="btn" style={{ marginTop: 12 }}
          onClick={goLinks} disabled={!!phase}>
          {phase ? <><span className="spin" />{phase}</> : "Fetch & rank my real items"}
        </button>
      </div>
      {error && <div className="error-box">{error}</div>}
      {ranked && (
        <div className="reveal" style={{ marginTop: 22 }}>
          <p>
            <strong>{ranked.length} item{ranked.length > 1 ? "s" : ""}, safest first</strong>
            {" — "}
            {Object.entries(summaryWord)
              .filter(([k]) => counts[k])
              .map(([k, w]) => `${counts[k]} ${w}`)
              .join(", ")}.
          </p>
          {ranked.map(({ product: p, verdict: v }, i) => (
            <div className="card" key={p.style_id}>
              <div className="card-flex">
                <Thumb p={p} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3>{i + 1}. {p.brand} — {p.name.slice(0, 60)}</h3>
                    <span className={`badge ${SAFETY[v.safety].cls}`}>{SAFETY[v.safety].label}</span>
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
            the deep brief below.
          </p>
        </div>
      )}
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
  const [phase, setPhase] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ product: Product; brief: Brief } | null>(null);

  async function runProduct(product: Product) {
    setPhase(`Reading ${product.reviews.length} buyer reviews…`);
    const brief = await post<Brief>("/api/brief", { product, doubt });
    setResult({ product, brief });
    setPhase("");
  }

  async function go() {
    setError(""); setResult(null);
    try {
      if (url.trim()) {
        setPhase("Fetching the product and its reviews…");
        const product = await post<Product>("/api/product", { url });
        if (!product.reviews.length) {
          throw new Error("This item has no readable buyer reviews — which is itself worth knowing before you buy.");
        }
        await runProduct(product);
      } else {
        const p = demos.find((d) => d.style_id === picked);
        if (!p) { setError("Pick an item or paste a link."); return; }
        await runProduct(p);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("");
    }
  }

  const focusKey = ({ size: "size_read", quality: "quality_read", worth: "worth_read", photos: "photo_reality" } as Record<string, string>)[doubt];
  const selectedSet = new Set(picked && !url.trim() ? [picked] : []);

  return (
    <div>
      <p className="small">Pick one item — or paste a live link — and say your doubt.</p>
      <PickGrid demos={demos} selected={selectedSet}
        toggle={(id) => { setPicked(id); setUrl(""); }} />
      <div className="live-panel">
        <div className="live-head">
          <span className="live-badge">Live</span>
          Or any item on Myntra, right now
        </div>
        <div className="sub">
          Paste any myntra.com product link — it is fetched live with its
          real buyer reviews.
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
      <button className="btn" onClick={go} disabled={!!phase}>
        {phase ? <><span className="spin" />{phase}</> : "Read the reviews for me"}
      </button>
      {error && <div className="error-box">{error}</div>}
      {result && (
        <div className="reveal" style={{ marginTop: 22 }}>
          <div className="card-flex">
            <Thumb p={result.product} size={92} />
            <div>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20 }}>
                {result.product.brand} — {result.product.name}
              </h3>
              <MetaLine p={result.product} />
            </div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid var(--berry)" }}>
            <div className="kicker">The bottom line</div>
            <p>{result.brief.bottom_line}</p>
            <p className="muted" style={{ marginTop: 8 }}>
              Built only from the {result.product.reviews.length} buyer
              reviews fetched for this item. Quotes are verbatim,
              machine-checked against the review text.
            </p>
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
        </div>
      )}
    </div>
  );
}

export default function MvpApp({ demos }: { demos: Product[] }) {
  return (
    <>
      <section className="section-block" style={{ borderTop: "none", paddingTop: 10 }}>
        <h2 className="section">Rank a wishlist</h2>
        <WishlistMode demos={demos} />
      </section>
      <section className="section-block">
        <h2 className="section">One item, in depth</h2>
        <BriefMode demos={demos} />
      </section>
    </>
  );
}
