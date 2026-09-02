import Link from "next/link";
import findings from "@/lib/findings.json";

export default function Home() {
  const corpus = findings.corpus;
  const relN = corpus.relevant_n;
  const blockers = findings.blockers.overall as Record<string, number>;
  const trust = blockers.trust_platform ?? 0;
  const uncertainty = findings.uncertainty_overall as Record<string, number>;

  return (
    <>
      <section className="hero">
        <div className="kicker">A growth research project · Myntra wishlists</div>
        <h1 className="display">
          People save what they want.<br />
          Then <span className="accent">doubt</span> keeps it saved.
        </h1>
        <p className="lede" style={{ marginTop: 22 }}>
          The goal: raise the share of users who buy a wishlisted item within
          30 days of saving it. The problem was not given — it had to be
          discovered. This site is the evidence chain, and the working
          prototype it led to.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/mvp" className="btn">Try the prototype</Link>
          <Link href="/engine" className="btn ghost">Explore the engine</Link>
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Step 1 · Discovery at scale</div>
        <h2 className="section">
          An engine read {corpus.total_tagged.toLocaleString()} public
          conversations so the problem could be counted, not guessed.
        </h2>
        <p className="small" style={{ maxWidth: 640 }}>
          Play Store reviews, Reddit threads, Myntra&apos;s own product reviews
          and YouTube comments, each classified by an LLM against a fixed
          schema: what blocks the purchase, what the doubt is about, what
          workaround the person invented. Strict relevance filtering first —
          delivery complaints don&apos;t count as purchase hesitation.
        </p>
        <div className="stat-row">
          <div className="stat">
            <div className="n">{corpus.total_tagged.toLocaleString()}</div>
            <div className="lbl">items collected and tagged</div>
          </div>
          <div className="stat">
            <div className="n">{relN}</div>
            <div className="lbl">about a purchase being considered or deferred</div>
          </div>
          <div className="stat">
            <div className="n">{trust}</div>
            <div className="lbl">blocked by distrust of the seller, photos or reviews — the #1 blocker</div>
          </div>
          <div className="stat">
            <div className="n">
              {uncertainty.about_product} : {uncertainty.about_self}
            </div>
            <div className="lbl">doubts about the product vs about oneself</div>
          </div>
        </div>
        <Link href="/engine" className="small" style={{ color: "var(--berry)" }}>
          See every chart, and classify your own text live →
        </Link>
      </section>

      <section className="section-block">
        <div className="kicker">Step 2 · Real wishlists</div>
        <h2 className="section">
          A survey anchored to people&apos;s actual saved items said the same
          thing, in personal words.
        </h2>
        <p className="small" style={{ maxWidth: 640 }}>
          16 respondents opened their real Myntra wishlists and answered the
          same questions about their top, middle and bottom items — 39 item
          answers. The blockers that lead: “not sure it would suit
          <em> me</em>” (12), quality doubt (10), worth-the-money doubt (10).
          Asked what one guaranteed-true fact they&apos;d want before buying,
          they wrote:
        </p>
        <blockquote>
          “Will this still feel worth the money after six months?”
          <span className="who">survey respondent, on a ₹800 item saved and never bought</span>
        </blockquote>
        <blockquote>
          “What is the biggest reason I might regret buying this?”
          <span className="who">survey respondent, 19, student</span>
        </blockquote>
        <p className="small" style={{ maxWidth: 640 }}>
          Public complaints blame the platform&apos;s credibility; people
          staring at their own wishlist phrase the same gap as unanswered
          personal questions. Two angles, one problem: <strong>the
          information needed to commit doesn&apos;t exist or isn&apos;t
          believed at the moment of decision.</strong>
        </p>
      </section>

      <section className="section-block">
        <div className="kicker">Step 3 · The answer</div>
        <h2 className="section">
          So the prototype does the homework shoppers already do by hand —
          honestly.
        </h2>
        <p className="small" style={{ maxWidth: 640 }}>
          Users resolve doubt today by reading one-star reviews, hunting
          customer photos, checking rivals and texting sisters — all off the
          platform. <strong>Worth a look?</strong> reads an item&apos;s real
          buyer reviews and answers the shopper&apos;s own doubt with verbatim,
          machine-verified evidence. It ranks a whole wishlist by buy-safety.
          And when the reviews can&apos;t settle it, it says exactly that — no
          pushing, no discounts, no invented claims.
        </p>
        <div style={{ marginTop: 22 }}>
          <Link href="/mvp" className="btn">Rank a wishlist now</Link>
        </div>
      </section>
    </>
  );
}
