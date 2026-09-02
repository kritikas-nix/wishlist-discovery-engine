import BarChart from "@/components/BarChart";
import Classifier from "@/components/Classifier";
import findings from "@/lib/findings.json";
import { BLOCKERS, WORKAROUNDS } from "@/lib/engine";

export const metadata = { title: "The discovery engine" };

export default function EnginePage() {
  const corpus = findings.corpus;
  const relN = corpus.relevant_n;
  const blockers = findings.blockers.overall as Record<string, number>;
  const byUnc = findings.blockers_by_uncertainty as Record<
    string, { n: number; blockers: Record<string, number> }
  >;
  const workarounds = findings.workarounds_overall.counts as Record<string, number>;
  const bySource = corpus.by_source as Record<string, number>;
  const quotes = findings.quotes as Record<
    string, { evidence: string; source: string; platform: string }[]
  >;
  const topBlockers = Object.entries(blockers).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <>
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="kicker">Deliverable 1 · The AI discovery engine</div>
        <h1 className="display" style={{ fontSize: "clamp(32px,5vw,48px)" }}>
          {corpus.total_tagged.toLocaleString()} public conversations,
          counted — and a classifier you can test yourself.
        </h1>
        <p className="lede" style={{ marginTop: 18 }}>
          Every item was tagged by an LLM against a fixed schema, so
          opportunity areas can be compared instead of described. Relevance is
          filtered first: {(corpus.by_relevance as Record<string, number>).irrelevant} delivery
          complaints and app gripes are excluded from every figure below.
        </p>
      </section>

      <section className="section-block">
        <h2 className="section">What is blocking the purchase</h2>
        <BarChart
          title="Blockers across relevant items"
          n={relN}
          nNote={`n = ${relN} items about a purchase being considered or deferred; one item can carry several blockers`}
          data={blockers}
          labels={BLOCKERS}
        />
      </section>

      <section className="section-block">
        <h2 className="section">
          Same blockers, split by what the doubt is about
        </h2>
        <p className="small" style={{ maxWidth: 640, marginBottom: 8 }}>
          <strong>about_product</strong> = they lack information about the
          item. <strong>about_self</strong> = they have the information and
          cannot map it to their own body, taste or plans. Different problems
          need different fixes, which is why they are counted apart — and the
          split is 4:1 toward the product&apos;s information.
        </p>
        <div className="grid2">
          {(["about_product", "about_self"] as const).map((k) => (
            <BarChart
              key={k}
              title={k}
              n={byUnc[k]?.n ?? 0}
              nNote={`n = ${byUnc[k]?.n ?? 0} items`}
              data={byUnc[k]?.blockers ?? {}}
              labels={BLOCKERS}
              alt={k === "about_self"}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2 className="section">The workarounds people invented</h2>
        <p className="small" style={{ maxWidth: 640 }}>
          A workaround nobody asked for is the strongest evidence of an unmet
          need. The most common one takes the user to a competitor.
        </p>
        <BarChart
          title="Workarounds mentioned in relevant items"
          n={relN}
          data={workarounds}
          labels={WORKAROUNDS}
        />
      </section>

      <section className="section-block">
        <h2 className="section">Real voices behind the numbers</h2>
        <p className="small">Verbatim, chosen by tagging confidence. Nothing is edited.</p>
        {topBlockers.map(([key, count]) => {
          const qs = (quotes[key] ?? []).slice(0, 2);
          if (!qs.length) return null;
          return (
            <div className="card" key={key}>
              <h3>{BLOCKERS[key] ?? key} — {count} items</h3>
              {qs.map((q, i) => (
                <blockquote key={i}>
                  “{q.evidence}”
                  <span className="who">{q.source} · {q.platform}</span>
                </blockquote>
              ))}
            </div>
          );
        })}
      </section>

      <section className="section-block">
        <h2 className="section">Where the data came from</h2>
        <BarChart
          title="Sources"
          n={corpus.total_tagged}
          data={bySource}
        />
        <div className="notice">
          Limitations, stated plainly: public feedback is self-selected and
          skews toward what is easy to complain about; tagging is done by a
          model and carries error. These numbers locate where to look. A
          survey anchored to real wishlists (n=16) tested what they suggest.
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Test the workflow live</div>
        <h2 className="section">Paste any shopping text. Watch it get tagged.</h2>
        <p className="small" style={{ maxWidth: 640, marginBottom: 14 }}>
          This runs the exact prompt used on the full corpus — same schema,
          same don&apos;t-guess rules. <span className="tag-code">unclear</span>{" "}
          and empty answers are correct outputs, not failures.
        </p>
        <Classifier blockerLabels={BLOCKERS} workaroundLabels={WORKAROUNDS} />
      </section>
    </>
  );
}
