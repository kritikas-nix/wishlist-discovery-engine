import MvpApp from "@/components/MvpApp";
import demos from "@/lib/demo_items.json";

export const metadata = { title: "Worth a look? — the prototype" };

export default function MvpPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 10 }}>
        <div className="kicker">Deliverable 3 · The working prototype</div>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,48px)" }}>
          Those items are saved for a reason.<br />
          Get a straight answer about each one.
        </h1>
        <p className="lede" style={{ marginTop: 18 }}>
          Built from what real buyers wrote in an item&apos;s reviews, and
          nothing else. Your whole list ranked by how safe each item is to
          buy, or one item examined against your exact doubt. No pushing, no
          discounts, no invented claims — when the reviews do not settle it,
          it says so.
        </p>
      </section>
      <MvpApp demos={demos as never} />
      <div className="notice" style={{ marginTop: 30 }}>
        A research prototype. Sample items were fetched from myntra.com;
        pasted links are fetched live, and Myntra sometimes blocks automated
        fetching — the sample items always work. Every quote is verbatim and
        machine-checked against the fetched review text.
      </div>
    </>
  );
}
