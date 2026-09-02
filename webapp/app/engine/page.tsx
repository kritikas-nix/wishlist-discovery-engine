import BarChart from "@/components/BarChart";
import Classifier from "@/components/Classifier";
import findings from "@/lib/findings.json";
import { BLOCKERS, WORKAROUNDS } from "@/lib/engine";

export const metadata = { title: "The discovery engine" };

export default function EnginePage() {
  const corpus = findings.corpus;
  const relN = corpus.relevant_n;
  const irrelevant = (corpus.by_relevance as Record<string, number>).irrelevant;
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
          We read {corpus.total_tagged.toLocaleString()} public conversations
          to find out why saved items stay unbought.
        </h1>

        <div className="steps-strip">
          <div className="step-card">
            <div className="num">1</div>
            <div className="t">Collect</div>
            <div className="d">
              {corpus.total_tagged.toLocaleString()} real posts and reviews:
              Play Store, Reddit, Myntra&apos;s own product reviews, YouTube.
            </div>
          </div>
          <div className="step-card">
            <div className="num">2</div>
            <div className="t">Filter</div>
            <div className="d">
              {irrelevant} items about deliveries, refunds and app bugs are
              removed. They are complaints, not purchase doubts.
            </div>
          </div>
          <div className="step-card">
            <div className="num">3</div>
            <div className="t">Tag</div>
            <div className="d">
              An AI model labels each item with a fixed set of tags: what
              blocks the purchase, what the doubt is about, what the person
              did about it.
            </div>
          </div>
          <div className="step-card">
            <div className="num">4</div>
            <div className="t">Count</div>
            <div className="d">
              The tags are counted and compared. That turns stories into
              numbers a decision can rest on. Every chart shows its sample
              size (n).
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Finding 1</div>
        <h2 className="section">What stops people from buying what they saved</h2>
        <p className="small" style={{ maxWidth: 640 }}>
          Of the {corpus.total_tagged.toLocaleString()} items collected,
          {" "}{relN} are about someone deciding whether to buy. This chart
          counts what they said was stopping them.
        </p>
        <BarChart
          title="Blockers across relevant items"
          n={relN}
          nNote={`n = ${relN} items about a purchase being considered; one item can carry several blockers`}
          data={blockers}
          labels={BLOCKERS}
        />
        <div className="takeaway">
          <strong>Takeaway:</strong> the biggest blocker is not price. It is
          not being able to trust the photos, reviews or seller (76 of 243).
          Money doubts come second, size doubts fourth.
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Finding 2</div>
        <h2 className="section">Whose question is it: the product&apos;s or the person&apos;s?</h2>
        <p className="small" style={{ maxWidth: 640, marginBottom: 8 }}>
          Two people can both say &ldquo;not sure about the fit&rdquo; and
          mean different things. One cannot find facts about the item
          (about_product). The other has the facts but cannot tell if it will
          work on her own body (about_self). They need different fixes, so we
          count them separately.
        </p>
        <div className="grid2">
          {(["about_product", "about_self"] as const).map((k) => (
            <BarChart
              key={k}
              title={k === "about_product" ? "Doubt about the product" : "Doubt about themselves"}
              n={byUnc[k]?.n ?? 0}
              nNote={`n = ${byUnc[k]?.n ?? 0} items`}
              data={byUnc[k]?.blockers ?? {}}
              labels={BLOCKERS}
              alt={k === "about_self"}
            />
          ))}
        </div>
        <div className="takeaway">
          <strong>Takeaway:</strong> doubts about the product outnumber doubts
          about oneself 118 to 29, four to one. The missing piece is
          believable information about the item, not body-fit advice.
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Finding 3</div>
        <h2 className="section">What people do about it today</h2>
        <p className="small" style={{ maxWidth: 640 }}>
          Nobody asked users to invent these habits. They did it themselves,
          which is the strongest sign of an unmet need.
        </p>
        <BarChart
          title="Workarounds mentioned in relevant items"
          n={relN}
          data={workarounds}
          labels={WORKAROUNDS}
        />
        <div className="takeaway">
          <strong>Takeaway:</strong> the most common workaround is checking
          the same item on a rival app (45 of 243). The decision is being
          made off Myntra, where Myntra can lose it.
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">The evidence, unedited</div>
        <h2 className="section">Real voices behind the numbers</h2>
        <p className="small">Quoted word for word, picked by tagging confidence.</p>
        {topBlockers.map(([key, count]) => {
          const qs = (quotes[key] ?? []).slice(0, 2);
          if (!qs.length) return null;
          return (
            <div className="card" key={key}>
              <h3>{BLOCKERS[key] ?? key} ({count} items)</h3>
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
        <div className="kicker">The data</div>
        <h2 className="section">Where it all came from</h2>
        <BarChart
          title="Sources"
          n={corpus.total_tagged}
          data={bySource}
        />
        <div className="notice">
          Said plainly: public feedback is written by people who chose to
          write it, and it leans toward whatever is easiest to complain
          about. The tagging is done by a model, so we audited it: a blind
          human re-check of 40 items agreed on relevant-or-not 32 times out
          of 40, and on the blocker 11 times out of 12 when both called an
          item relevant. The model&apos;s errors lean one way, counting
          borderline platform chatter as relevant, so the top blocker&apos;s
          count is likely a few items generous. The finding still stands,
          and a survey of 16 real wishlists pointed the same way.
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Test it yourself</div>
        <h2 className="section">Paste any shopping text. Watch it get tagged.</h2>
        <p className="small" style={{ maxWidth: 640, marginBottom: 14 }}>
          This runs the exact same tagging step used on all{" "}
          {corpus.total_tagged.toLocaleString()} items. It usually takes
          under 15 seconds. <span className="tag-code">unclear</span> is a
          correct answer, not a failure: the model is told never to guess.
        </p>
        <Classifier blockerLabels={BLOCKERS} workaroundLabels={WORKAROUNDS} />
      </section>
    </>
  );
}
