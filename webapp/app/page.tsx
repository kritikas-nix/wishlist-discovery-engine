import Image from "next/image";
import Link from "next/link";
import findings from "@/lib/findings.json";
import demos from "@/lib/demo_items.json";

export default function Home() {
  const corpus = findings.corpus;
  const uncertainty = findings.uncertainty_overall as Record<string, number>;
  const items = (demos as { image?: string | null; name: string }[])
    .filter((d) => d.image);

  return (
    <>
      <section className="hero" style={{ paddingBottom: 30 }}>
        <h1 className="mega">
          Saved.<br />Never <span className="accent">bought.</span>
        </h1>
        <div className="hero-edges">
          <div>
            Wishlists on Myntra fill up. Purchases don&apos;t follow. The
            problem wasn&apos;t given — it had to be found.
          </div>
          <div>
            1,309 public conversations, 16 real wishlists, one working
            prototype. Every number carries its n.
          </div>
        </div>
        <div className="product-strip">
          {items.map((d, i) => (
            <div className="cell" key={i}>
              <Image src={d.image!} alt={d.name} fill sizes="140px"
                style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 34, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/mvp" className="btn">Try the prototype</Link>
          <Link href="/engine" className="btn ghost">See the evidence</Link>
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">What the research found</div>
        <h2 className="section">
          The blocker isn&apos;t price. It&apos;s doubt nobody answers.
        </h2>
        <div className="stat-row">
          <div className="stat">
            <div className="n">{corpus.total_tagged.toLocaleString()}</div>
            <div className="lbl">public conversations tagged by the engine</div>
          </div>
          <div className="stat">
            <div className="n">#1</div>
            <div className="lbl">blocker: can&apos;t trust the photos, reviews or seller</div>
          </div>
          <div className="stat">
            <div className="n">{uncertainty.about_product}:{uncertainty.about_self}</div>
            <div className="lbl">doubts about the product vs about oneself</div>
          </div>
          <div className="stat">
            <div className="n">16</div>
            <div className="lbl">real wishlists surveyed — same doubt, personal words</div>
          </div>
        </div>
        <blockquote style={{ maxWidth: 560 }}>
          “Will this still feel worth the money after six months?”
          <span className="who">survey respondent, about an item saved and never bought</span>
        </blockquote>
      </section>

      <section className="section-block">
        <div className="kicker">The answer</div>
        <h2 className="section">
          A prototype that does the shopper&apos;s homework — honestly.
        </h2>
        <p className="small" style={{ maxWidth: 560 }}>
          People resolve doubt by reading one-star reviews, hunting real
          photos, checking rival apps. <strong>Worth a look?</strong> does
          that reading for them: a whole wishlist ranked by buy-safety, every
          claim a verbatim buyer quote, and an honest &ldquo;the reviews
          can&apos;t settle it&rdquo; when they can&apos;t. No discounts, no
          pushing.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/mvp" className="btn">Rank a wishlist</Link>
        </div>
      </section>
    </>
  );
}
