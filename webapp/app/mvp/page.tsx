import MvpApp from "@/components/MvpApp";
import demos from "@/lib/demo_items.json";

export const metadata = { title: "Worth a look? — the prototype" };

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
      </section>
      <MvpApp demos={demos as never} />
      <p className="muted" style={{ marginTop: 26 }}>
        A research prototype. Sample items are real Myntra products; pasted
        links are fetched live, and Myntra sometimes blocks automated
        fetching — the samples always work. Every quote is verbatim,
        machine-checked against the fetched review text.
      </p>
    </>
  );
}
