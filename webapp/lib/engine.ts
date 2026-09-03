// Server-side engine: Firecrawl fetching, Claude prompts, and the
// no-invention quote check. TypeScript port of mvp_engine.py / taxonomy.py —
// the prompts are kept word-for-word identical so the two stacks agree.

import Anthropic from "@anthropic-ai/sdk";

export const BRIEF_MODEL = "claude-opus-5";
// Verdicts run 3 to 5 in parallel while a grader waits, so they use the
// faster model; the single deep brief keeps the most capable one.
export const VERDICT_MODEL = "claude-sonnet-4-6";
export const CLASSIFY_MODEL = "claude-sonnet-4-6";
const MAX_REVIEWS = 60;

export type Review = { text: string; rating: number | null; size_bought?: string | null };
export type Product = {
  style_id: string; brand: string; name: string; price: string;
  rating: number | null; rating_count: number | null; url: string;
  image?: string | null;
  reviews: Review[];
};

export function extractStyleId(url: string): string | null {
  const u = (url || "").trim();
  const m = u.match(/\/(\d{6,9})\/buy/) || u.match(/\/reviews\/(\d{6,9})/) ||
    u.match(/^(\d{6,9})$/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// Firecrawl (REST v2)
// ---------------------------------------------------------------------------

async function fetchImage(styleId: string): Promise<string | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  const resp = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `https://www.myntra.com/${styleId}`,
      waitFor: 3000,
      formats: [{
        type: "json",
        prompt: 'Return {"image": the absolute URL of the main product photo displayed on this page (an assets.myntassets.com URL), or null}',
      }],
    }),
  });
  if (!resp.ok) return null;
  const body = await resp.json();
  const img = body?.data?.json?.image;
  if (typeof img !== "string" || !img.startsWith("http")) return null;
  return img.replace(/f_auto,h_\d+,q_auto:best,w_\d+/, "f_auto,h_720,q_auto:best,w_540");
}

export async function fetchProduct(styleId: string): Promise<Product> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("FIRECRAWL_API_KEY not set");
  const imagePromise = fetchImage(styleId).catch(() => null);
  const resp = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `https://www.myntra.com/reviews/${styleId}`,
      waitFor: 3000,
      formats: [{
        type: "json",
        prompt:
          "From this product reviews page extract: 'brand', 'name' (product " +
          "name), 'price' (displayed price as shown), 'rating' (average " +
          "rating if shown, else null), 'rating_count' (number of ratings " +
          "if shown, else null), and 'reviews': every customer review on " +
          "the page as a list of {'text': full review text, 'rating': 1-5 " +
          "or null, 'size_bought': size mentioned as bought if shown else " +
          "null}. Do not invent anything; empty list if no reviews.",
      }],
    }),
  });
  if (!resp.ok) throw new Error(`firecrawl ${resp.status}`);
  const body = await resp.json();
  const data = body?.data?.json ?? {};
  const meta = body?.data?.metadata ?? {};
  const reviews: Review[] = (data.reviews ?? [])
    .filter((r: Review) => String(r?.text ?? "").trim().length >= 15)
    .slice(0, MAX_REVIEWS);
  void meta;
  return {
    style_id: styleId,
    brand: data.brand ?? "",
    name: data.name ?? "",
    price: String(data.price ?? ""),
    rating: data.rating ?? null,
    rating_count: data.rating_count ?? null,
    url: `https://www.myntra.com/reviews/${styleId}`,
    image: await imagePromise,
    reviews,
  };
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const anthropic = () => new Anthropic();

export function parseModelJson(raw: string): unknown {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.includes("\n") ? t.split("\n").slice(1).join("\n") : t;
    t = t.split("```")[0];
  }
  const start = t.indexOf("{");
  if (start === -1) throw new Error("no JSON in model output");
  // take the first balanced object
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < t.length; i++) {
    const c = t[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') inStr = !inStr;
    if (inStr) continue;
    if (c === "{") depth++;
    if (c === "}") { depth--; if (depth === 0) return JSON.parse(t.slice(start, i + 1)); }
  }
  throw new Error("unbalanced JSON in model output");
}

function reviewsBlob(product: Product): string {
  return product.reviews.map((r) => String(r.text)).join(" ||| ").toLowerCase();
}

type Quote = { n?: number; text?: string };
export function keepVerbatim(quotes: Quote[] | undefined, product: Product): Quote[] {
  const blob = reviewsBlob(product);
  return (quotes ?? []).filter((q) => {
    const qt = String(q?.text ?? "").trim();
    return qt && blob.includes(qt.toLowerCase().replace(/^["'“”.\s]+|["'“”.\s]+$/g, ""));
  });
}

// ---------------------------------------------------------------------------
// The classifier (taxonomy.py's prompt, verbatim)
// ---------------------------------------------------------------------------

const RELEVANCE = ["deferred_purchase", "purchase_decision", "post_purchase", "irrelevant"];
const UNCERTAINTY_OBJECT = ["about_product", "about_self", "about_context", "not_applicable"];
const SAVING_INTENT = ["intent_to_buy", "bookmark", "compare", "declutter", "unclear"];
const SEGMENT = ["student", "working_early", "working_established", "unclear"];
const OUTCOME = ["bought_eventually", "bought_elsewhere", "abandoned", "still_pending", "unclear"];

export const BLOCKERS: Record<string, string> = {
  fit_size: "Unsure of size or measurements",
  suitability_on_me: "Unsure it will look good on their body or skin tone",
  quality_material: "Unsure of fabric, build or durability",
  price_absolute: "Cannot afford it right now",
  price_worth: "Can afford it, unsure it is worth the money",
  waiting_sale: "Waiting for a discount or price drop",
  waiting_occasion: "Waiting for an event or season",
  social_validation: "Wants someone else's opinion first",
  forgot_never_returned: "Saved it and never came back to the list",
  stock_unavailable: "Size or item went out of stock",
  returns_friction: "Return or exchange process is the deterrent",
  decision_overload: "Too many options, cannot choose",
  trust_platform: "Does not trust the seller, photos or reviews",
  none_stated: "No blocker given",
};

export const WORKAROUNDS: Record<string, string> = {
  ask_friend: "Screenshot or share to a person or group chat",
  review_photos: "Looks for customer photos in reviews",
  negative_reviews: "Reads low star reviews specifically",
  youtube_search: "Searches YouTube for the brand or item",
  instagram_search: "Searches Instagram or looks at creators",
  competitor_check: "Checks the same item on another app",
  size_chart_compare: "Measures a garment they own against the chart",
  offline_try: "Tries the size in a physical store first",
  order_two_sizes: "Orders multiple sizes intending to return one",
  none: "No workaround mentioned",
};

function classifyPrompt(text: string, source: string): string {
  const blockers = Object.entries(BLOCKERS).map(([k, v]) => `  ${k}: ${v}`).join("\n");
  const workarounds = Object.entries(WORKAROUNDS).map(([k, v]) => `  ${k}: ${v}`).join("\n");
  return `You are tagging a piece of public user feedback about online fashion shopping in India, for product research.

SOURCE: ${source}

TEXT:
"""${text}"""

Tag it against the schema below. Return ONLY a JSON object, no preamble, no markdown fences.

relevance: one of ['${RELEVANCE.join("', '")}']
  Use "irrelevant" for anything about delivery delays, refunds already in
  progress, app crashes or customer service. Be strict. Most text is irrelevant.

blockers: array of keys from this list. Empty array if none apply.
${blockers}

uncertainty_object: one of ['${UNCERTAINTY_OBJECT.join("', '")}']
  "about_product" = they lack information about the item itself.
  "about_self" = they have the information and cannot map it to their own body,
     taste or life. e.g. knows the measurements, does not know if it suits her.
  "about_context" = blocked on an event, budget or date outside the platform.

workarounds: array of keys from this list. Empty array if none mentioned.
${workarounds}

saving_intent: one of ['${SAVING_INTENT.join("', '")}']
segment: one of ['${SEGMENT.join("', '")}']
outcome: one of ['${OUTCOME.join("', '")}']

evidence: a verbatim quote of at most 20 words from the text that best supports
  your blocker tags. Empty string if relevance is "irrelevant".

confidence: "high", "medium" or "low". Use "low" when you are inferring rather
  than reading. Do not guess to fill fields. "unclear" and empty arrays are
  correct answers when the text does not say.

JSON only.`;
}

type Tags = {
  relevance: string; blockers: string[]; uncertainty_object: string;
  workarounds: string[]; saving_intent: string; segment: string;
  outcome: string; evidence: string; confidence: string;
};

const VALID: Record<string, [string[], string]> = {
  relevance: [RELEVANCE, "irrelevant"],
  uncertainty_object: [UNCERTAINTY_OBJECT, "not_applicable"],
  saving_intent: [SAVING_INTENT, "unclear"],
  segment: [SEGMENT, "unclear"],
  outcome: [OUTCOME, "unclear"],
};

export async function classify(text: string): Promise<Tags> {
  const resp = await anthropic().messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: classifyPrompt(text, "live_demo") }],
  });
  const raw = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const t = parseModelJson(raw) as Record<string, unknown>;
  for (const [field, [allowed, fallback]] of Object.entries(VALID)) {
    if (!allowed.includes(String(t[field]))) t[field] = fallback;
  }
  t.blockers = (Array.isArray(t.blockers) ? t.blockers : []).filter((b) => b in BLOCKERS);
  t.workarounds = (Array.isArray(t.workarounds) ? t.workarounds : []).filter((w) => w in WORKAROUNDS);
  if (!["high", "medium", "low"].includes(String(t.confidence))) t.confidence = "low";
  t.evidence = String(t.evidence ?? "").split(/\s+/).slice(0, 20).join(" ");
  return t as Tags;
}

// ---------------------------------------------------------------------------
// The brief (mvp_engine.py's prompt, verbatim)
// ---------------------------------------------------------------------------

export const DOUBTS: Record<string, string> = {
  size: "Will it fit me? Does the sizing run true?",
  quality: "Is the fabric / build quality actually good?",
  worth: "Is it worth the price?",
  photos: "Will it look like the photos when it arrives?",
  general: "Should I take this off my wishlist or buy it?",
};

function briefPrompt(product: Product, doubtKey: string): string {
  const reviewsBlock = product.reviews.map((r, i) =>
    `[${i + 1}] rating=${r.rating ?? "?"}` +
    (r.size_bought ? ` size_bought=${r.size_bought}` : "") +
    ` :: ${String(r.text).trim().slice(0, 400)}`).join("\n");
  return `You are helping an online shopper in India decide about an item sitting in
their wishlist. You have the item's real buyer reviews, and nothing else.
Answer ONLY from these reviews. Quoting is verbatim. If the reviews do not
answer something, say so plainly - that is a useful answer, not a failure.
Never urge the shopper to buy. You are the careful friend who read everything.

ITEM: ${product.brand} - ${product.name} - price ${product.price}
Average rating: ${product.rating} from ${product.rating_count} ratings.

THE SHOPPER'S DOUBT: ${DOUBTS[doubtKey]}

BUYER REVIEWS (${product.reviews.length} total), format [n] rating :: text:
${reviewsBlock}

Return ONLY a JSON object, no markdown fences:
{
  "size_read": {
    "verdict": "runs_small" | "true_to_size" | "runs_large" | "mixed" | "no_evidence",
    "n_mentions": <how many reviews mention size or fit>,
    "summary": "<one or two plain sentences, only if there is evidence>",
    "quotes": [{"n": <review number>, "text": "<verbatim, max 25 words>"}]
  },
  "quality_read": {
    "verdict": "positive" | "negative" | "mixed" | "no_evidence",
    "n_mentions": <count>,
    "summary": "<plain sentences on fabric/material/build, from reviews only>",
    "quotes": [...]
  },
  "photo_reality": {
    "verdict": "matches" | "differs" | "mixed" | "no_evidence",
    "n_mentions": <count>,
    "summary": "<...>",
    "quotes": [...]
  },
  "worth_read": {
    "verdict": "worth_it" | "not_worth_it" | "mixed" | "no_evidence",
    "n_mentions": <count>,
    "summary": "<what buyers say about value for the price>",
    "quotes": [...]
  },
  "bottom_line": "<2-4 sentences answering the shopper's doubt directly, in
    the voice of a straight-talking friend. Ground every claim in the counts
    above. If the honest answer is 'the reviews do not settle this', say so
    and say what is known instead.>",
  "gaps": ["<questions of the shopper's kind that these reviews do not answer>"]
}

At most 4 quotes per section, each verbatim from a review, max 25 words.
Counts must be real counts of reviews, not guesses.

Decisiveness rule: confidence must match the evidence, in both directions.
When the reviews are strongly positive and nothing in them argues against
the purchase, say that plainly, e.g. "Nothing in these reviews argues
against buying this one." Never soften an earned yes. Never inflate a
weak one.`;
}

export async function makeBrief(product: Product, doubtKey: string) {
  const resp = await anthropic().messages.create({
    model: BRIEF_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: briefPrompt(product, doubtKey) }],
  });
  const raw = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const brief = parseModelJson(raw) as Record<string, { quotes?: Quote[] } | unknown>;
  for (const section of ["size_read", "quality_read", "photo_reality", "worth_read"]) {
    const sec = (brief[section] ?? {}) as { quotes?: Quote[] };
    sec.quotes = keepVerbatim(sec.quotes, product);
    brief[section] = sec;
  }
  return brief;
}

// ---------------------------------------------------------------------------
// The wishlist verdict (mvp_engine.py's prompt, verbatim)
// ---------------------------------------------------------------------------

const VERDICT_SAFETIES = ["looks_safe", "has_risks", "reviews_cant_settle"];

function verdictPrompt(product: Product): string {
  const reviewsBlock = product.reviews.map((r, i) =>
    `[${i + 1}] rating=${r.rating ?? "?"} :: ${String(r.text).trim().slice(0, 300)}`).join("\n");
  return `You are ranking items in an online shopper's wishlist by how safe each is
to buy, using ONLY that item's real buyer reviews. Be the careful friend:
grounded, honest, never pushy. "The reviews cannot settle it" is a valid
verdict.

ITEM: ${product.brand} - ${product.name} - price ${product.price}
Average rating: ${product.rating} from ${product.rating_count} ratings.

BUYER REVIEWS (${product.reviews.length} total):
${reviewsBlock}

Return ONLY a JSON object, no fences:
{
  "safety": "looks_safe" | "has_risks" | "reviews_cant_settle",
  "headline": "<one sentence: the single most decision-relevant fact from
    these reviews>",
  "risk": "<the main risk a buyer should know, one sentence, or empty
    string if none surfaced>",
  "size_note": "<one short sentence on sizing if reviews mention it,
    else empty string>",
  "key_quote": {"n": <review number>, "text": "<the single most useful
    verbatim quote, max 25 words>"},
  "evidence_strength": "strong" | "thin"
}

"looks_safe" needs consistent positive evidence with no repeated complaint.
"has_risks" means a concrete repeated problem (sizing, quality, colour).
"reviews_cant_settle" means too few or too vague reviews. Never invent.
For a "looks_safe" item, the headline should be plainly confident, not
hedged: the evidence earned it.`;
}

export async function makeVerdict(product: Product) {
  const resp = await anthropic().messages.create({
    model: VERDICT_MODEL,
    max_tokens: 1000,
    messages: [{ role: "user", content: verdictPrompt(product) }],
  });
  const raw = resp.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const v = parseModelJson(raw) as {
    safety?: string; key_quote?: Quote | null; [k: string]: unknown;
  };
  if (!VERDICT_SAFETIES.includes(String(v.safety))) v.safety = "reviews_cant_settle";
  const kept = keepVerbatim(v.key_quote ? [v.key_quote] : [], product);
  v.key_quote = kept.length ? kept[0] : null;
  return v;
}
