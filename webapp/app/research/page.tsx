export const metadata = { title: "Research artefacts" };

const INTERVIEWS = [
  {
    who: "Interview 1 · 24, working, first job",
    item: "Bodycon dress, about ₹3,699",
    saved: "About a month",
    why: "Liked the dress; kept for a possible occasion",
    intent: "Still wanted it",
    blocker: "“Will it be worth the price? Do I even need it now? Where all can I wear it?”",
    needed: "Reassurance on worth, and a push: “someone saying yes, that will look great on you”",
    outside: "Asks family; wanted a trusted second opinion",
    reaction: "Brief was positive: “good enough to buy”. Stated intent to buy (intent, not a verified transaction). Worth-for-her-occasions stayed partly open.",
  },
  {
    who: "Interview 2 · 30, working 5+ years",
    item: "Salwar suit, about ₹5,999",
    saved: "About 15 days",
    why: "Wanted it, but burned by a past purchase",
    intent: "Still wanted it, afraid of being burned again",
    blocker: "“Last time the material was so bad. Should I trust this one? What the photos show and what gets delivered are two different stories.”",
    needed: "Believable proof the product matches the listing",
    outside: "Relies on her own past experience; distrusts listing photos",
    reaction: "Brief was positive; moved toward buying but not fully convinced at this price after being scammed once. One honest answer starts rebuilding trust; it does not finish it.",
  },
  {
    who: "Interview 3 · 35, working 10+ years",
    item: "Office wear: shirt and pants, about ₹3,000 each",
    saved: "30 to 40 days",
    why: "Liked how they look on the models",
    intent: "Undecided",
    blocker: "“Will they look good on me or not?” Wanted styling guidance",
    needed: "Whether the items suit her, in looks and smartness",
    outside: "None described",
    reaction: "Reviews surfaced real risks; confident decision not to buy and to look elsewhere: “wants to invest, but in something right.” Potentially avoided a poor-fit purchase and return.",
  },
  {
    who: "Interview 4 · 28, working 4+ years",
    item: "Formal blue shirts, about ₹3,599 each",
    saved: "About 2 weeks",
    why: "Liked the pattern and design",
    intent: "Wants to buy, at the right price",
    blocker: "“Will they fit me as perfectly as in the photo?”",
    needed: "Fit assurance, then the best price",
    outside: "Actively compares similar products across sites for price and reviews",
    reaction: "Brief was positive; convinced it would be a good buy from this site. Still wants to compare prices across sites: the tool converts product doubt, not deal-hunting.",
  },
  {
    who: "Interview 5 · 42, working 10+ years",
    item: "Chiffon saree, about ₹6,999",
    saved: "About 3 days",
    why: "Wanted it for the material and design",
    intent: "Wanted to buy if the material is real",
    blocker: "Is the “chiffon” actually chiffon or mixed? Will it look good on her?",
    needed: "Material authenticity; also other colours of the same design",
    outside: "Searches for colour variants the site does not surface",
    reaction: "Reviews showed good quality and confirmed real chiffon; convinced, wants to buy. The colour-variant ask is a catalogue gap noted for the roadmap.",
  },
  {
    who: "Interview 6 · 25, working 2+ years",
    item: "Smart-wear blazer, about ₹5,999",
    saved: "5 to 7 days",
    why: "Liked the pictures",
    intent: "Undecided",
    blocker: "The size chart confuses her; is the branded item worth the buy?",
    needed: "A clear read on fit and whether the brand premium is justified",
    outside: "None described",
    reaction: "Reviews showed risks; not good enough to buy. Confident decision to look for another blazer: “wants to invest but in something right.”",
  },
];

export default function ResearchPage() {
  return (
    <>
      <section className="hero" style={{ paddingBottom: 20 }}>
        <div className="kicker">Research artefacts</div>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,44px)" }}>
          The instruments, the funnel, and all six interviews.
        </h1>
        <p className="lede" style={{ marginTop: 14 }}>
          Everything the findings rest on, in one place, so the work can be
          audited rather than taken on faith.
        </p>
      </section>

      <section className="section-block">
        <h2 className="section">The survey instrument</h2>
        <p className="small" style={{ maxWidth: 640 }}>
          A 34-question, item-anchored survey: each respondent opened their
          real Myntra wishlist and answered the same questions about their
          top, middle and bottom saved items. 16 respondents, 39 item-level
          answers. The blocker options translated the engine&apos;s major
          themes into user-friendly wording, with open-text fields left free
          to surface unprompted issues; there was deliberately no
          &ldquo;don&apos;t trust&rdquo; option, and trust surfaced anyway
          in free text and interviews.
        </p>
        <p style={{ marginTop: 12 }}>
          <a className="btn ghost" href="https://forms.gle/2f1TYzFeu95ZXCEe6">
            Open the survey instrument
          </a>
        </p>
      </section>

      <section className="section-block">
        <h2 className="section">The engine&apos;s qualification funnel</h2>
        <p className="small" style={{ maxWidth: 680 }}>
          3,183 unique public posts, comments and reviews collected &rarr;
          1,381 operational complaints removed (delivery, refunds, app bugs)
          &rarr; 1,375 post-purchase reviews set aside (used as product-risk
          evidence, excluded from every blocker figure) &rarr;{" "}
          <strong>427 genuine purchase deliberations</strong>, the
          denominator for all blocker prevalence. Tagging was blind-audited
          by a human (32/40 on relevance, 11/12 on blockers; the model&apos;s
          bias toward over-including borderline chatter is disclosed). Trust
          blockers are stable across sources: Play Store 24%, YouTube 27%,
          Reddit 29%.
        </p>
      </section>

      <section className="section-block">
        <h2 className="section">Intent versus bookmarking</h2>
        <p className="small" style={{ maxWidth: 680 }}>
          The brief asks when a wishlist save is genuine intent versus a
          bookmark. Two reads, stated honestly. In public deliberation texts
          (engine, n=427), where the reason for saving was inferable at all
          (183 items), stated purchase intent dominates: 139 intent-to-buy,
          39 comparing options, 4 bookmarking; in 244 items the text does
          not say, and the engine records that as unclear rather than
          inferring. In self-descriptions (survey, n=16): 7 describe their
          wishlist as things they plan to buy soon, 5 as a mix, 3 as
          save-but-might-never-buy, 1 as a comparison set. Bookmarking is
          real in self-image, rare in the texts of people actively
          deliberating a purchase.
        </p>
      </section>

      <section className="section-block">
        <h2 className="section">The six depth interviews</h2>
        <p className="small" style={{ maxWidth: 680, marginBottom: 6 }}>
          Six 15-minute interviews with the target segment: high-intent
          wishlist users who could afford the item and delayed on doubt.
          Three were survey opt-ins; three were recruited to the same
          segment. Notes are anonymised summaries, close to the
          participants&apos; words but not verbatim transcripts. Each
          participant tested the prototype live on their own saved item.
        </p>
        {INTERVIEWS.map((iv) => (
          <div className="card" key={iv.who}>
            <h3>{iv.who}</h3>
            <p className="small" style={{ marginTop: 6 }}>
              <strong>Item:</strong> {iv.item} · <strong>Saved:</strong>{" "}
              {iv.saved} · <strong>Why saved:</strong> {iv.why} ·{" "}
              <strong>Intent when asked:</strong> {iv.intent}
            </p>
            <p className="small" style={{ marginTop: 4 }}>
              <strong>What stopped the purchase:</strong> {iv.blocker}
            </p>
            <p className="small" style={{ marginTop: 4 }}>
              <strong>Information still needed:</strong> {iv.needed} ·{" "}
              <strong>Outside Myntra:</strong> {iv.outside}
            </p>
            <p className="small" style={{ marginTop: 4 }}>
              <strong>Prototype reaction:</strong> {iv.reaction}
            </p>
          </div>
        ))}
        <p className="muted" style={{ marginTop: 10 }}>
          Fields not covered in a conversation are reported as not described
          rather than filled in. Outcomes across the six: three stated
          purchase intent, one moved toward buying, two confident removals.
          All six left limbo.
        </p>
      </section>
    </>
  );
}
