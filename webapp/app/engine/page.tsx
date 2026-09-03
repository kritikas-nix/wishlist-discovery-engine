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
          We read {corpus.total_tagged.toLocaleString()} public posts, comments
          and reviews to find out why saved items stay unbought.
        </h1>

        <div className="notice" style={{ marginTop: 22 }}>
          <strong>This page in 15 seconds:</strong> 3,183 unique posts and
          reviews collected &rarr; 1,381 operational complaints removed
          &rarr; 1,375 post-purchase reviews set aside (used as product-risk
          evidence, excluded from every blocker figure) &rarr;{" "}
          <strong>{relN} genuine purchase deliberations</strong>, counted.
          The biggest single blocker: not being able to trust what the
          listing shows. That finding is what the prototype is built to fix.
        </div>

        <div className="kpi-row">
          <div className="kpi-card">
            <div className="knum">{corpus.total_tagged.toLocaleString()}</div>
            <div className="klbl">Posts, comments, reviews read</div>
            <div className="ksub">Play Store, Reddit, Myntra reviews, YouTube</div>
          </div>
          <div className="kpi-card">
            <div className="knum">{relN}</div>
            <div className="klbl">Purchase decisions found</div>
            <div className="ksub">after strict filtering of complaints and noise</div>
          </div>
          <div className="kpi-card">
            <div className="knum accent">#1</div>
            <div className="klbl">Blocker: trust</div>
            <div className="ksub">106 of {relN} cannot trust the photos, reviews or seller</div>
          </div>
          <div className="kpi-card">
            <div className="knum accent">4.5:1</div>
            <div className="klbl">Product vs self doubt</div>
            <div className="ksub">the missing piece is item information, not styling advice</div>
          </div>
        </div>

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
          counts what they said was stopping them.{" "}
          <strong>Blocker prevalence uses n={relN} pre-purchase
          deliberations; post-purchase product reviews are excluded.</strong>
        </p>
        <BarChart
          title="Blockers across relevant items"
          n={relN}
          nNote={`n = ${relN} items about a purchase being considered; one item can carry several blockers`}
          data={blockers}
          labels={BLOCKERS}
        />
        <div className="takeaway">
          <strong>Takeaway:</strong> users are not only waiting for a lower
          price; most are waiting for believable evidence. Trust in photos,
          reviews and sellers is the largest single blocker (106 of 427),
          worth-the-money a close second (99). Together the evidence
          cluster (trust, quality, worth) touches 211 of 427 deliberations;
          affordability and timing (cannot afford, waiting for a sale)
          touch 40.
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
          <strong>Takeaway:</strong> of {relN} deliberations, 210 carry a
          doubt classifiable on this axis: 172 about the product&apos;s
          information vs 38 about oneself, more than four to one. (Another
          130 are blocked on context such as budget or occasion, and 87
          state no specific doubt.) The missing piece is believable item
          information, not body-fit advice.
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
          nNote={`${workarounds.none ?? 0} of ${relN} items mentioned no workaround; this chart counts the ${relN - (workarounds.none ?? 0)} that described one`}
          data={Object.fromEntries(
            Object.entries(workarounds).filter(([k]) => k !== "none"))}
          labels={WORKAROUNDS}
        />
        <div className="takeaway">
          <strong>Takeaway:</strong> the most common workaround is checking
          the same item on a rival app (53 of 427). The decision is being
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
          about. Three checks keep the numbers honest. First, the finding is
          stable across sources: among deliberations, the trust blocker
          appears in 24% of Play Store items, 27% of YouTube, 29% of Reddit.
          Second, post-purchase product reviews are excluded from blocker
          denominators (only 14 of 843 Myntra reviews were mid-deliberation
          texts, and none carry a trust tag). Third, the tagging was
          audited: a blind human re-check of 40 items agreed 32/40 on
          relevance and 11/12 on the blocker; the model&apos;s one bias,
          counting borderline platform chatter as relevant, is disclosed.
          A survey of 16 real wishlists, a distinct evidence stream, pointed
          the same way.
        </div>
      </section>

      <section className="section-block">
        <div className="kicker">Test it yourself</div>
        <h2 className="section">Paste any shopping text. Watch it get tagged.</h2>
        <p className="small" style={{ maxWidth: 640, marginBottom: 14 }}>
          This runs the same tagging schema and rules used on all{" "}
          {corpus.total_tagged.toLocaleString()} items. It usually takes
          under 15 seconds. <span className="tag-code">Unclear</span> is a
          correct answer, not a failure: when evidence is insufficient the
          model is instructed to return Unclear rather than infer.
        </p>
        <Classifier blockerLabels={BLOCKERS} workaroundLabels={WORKAROUNDS}
          totalTagged={corpus.total_tagged} />
      </section>
    </>
  );
}
