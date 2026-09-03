import MvpApp from "@/components/MvpApp";
import demos from "@/lib/demo_items.json";

export const metadata = { title: "Worth a look? | the prototype" };

export default function MvpPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="kicker">The prototype</div>
        <h1 className="mega" style={{ fontSize: "clamp(40px,7vw,76px)" }}>
          Worth a <span className="accent">look?</span>
        </h1>
        <div className="hero-edges">
          <div>
            Straight answers about saved items, built only from what real
            buyers wrote in the reviews.
          </div>
          <div>
            No pushing. No discounts. When the reviews can&apos;t settle it,
            it says so.
          </div>
        </div>
        <div className="props-row">
          <div className="prop-card">
            <div className="ic">📖</div>
            <div className="pt">Reads buyer reviews for you</div>
            <div className="pd">
              Dozens of real buyer reviews, fetched and read in under a
              minute. The homework you keep postponing, done.
            </div>
          </div>
          <div className="prop-card">
            <div className="ic">🎯</div>
            <div className="pt">Answers your exact doubt</div>
            <div className="pd">
              Size, quality, worth the price, or photos vs reality. You pick
              the question; the evidence answers it.
            </div>
          </div>
          <div className="prop-card">
            <div className="ic">🤝</div>
            <div className="pt">Honest by design</div>
            <div className="pd">
              Every quote is word for word and machine checked. When the
              reviews cannot settle it, it tells you that too.
            </div>
          </div>
        </div>
      </section>
      <MvpApp demos={demos as never} />
      <p className="muted" style={{ marginTop: 26 }}>
        A research prototype. Sample items are real Myntra products; pasted
        links are fetched live, and Myntra sometimes blocks automated
        fetching. The samples always work. This product never asks you to
        trust an AI opinion: every conclusion shows the number of reviews
        behind it, every quote is word for word and machine-checked against
        the source, negative evidence is shown rather than smoothed over,
        and you can always open the reviews yourself.
      </p>
    </>
  );
}
