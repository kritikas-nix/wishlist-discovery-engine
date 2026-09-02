// Cross-engine compatibility sweep of the production site.
import { chromium, webkit, firefox } from "playwright";

const BASE = "https://worth-a-look-sable.vercel.app";
const PAGES = ["/", "/engine", "/mvp"];
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "iphone", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "android-small", width: 360, height: 780, isMobile: true, hasTouch: true },
];
const ENGINES = [
  ["chromium (Chrome/Edge)", chromium],
  ["webkit (Safari)", webkit],
  ["firefox", firefox],
];

const out = [];
for (const [ename, engine] of ENGINES) {
  const browser = await engine.launch();
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: ename.startsWith("chromium") ? vp.isMobile : undefined,
      hasTouch: vp.hasTouch,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text()}`);
    });
    for (const path of PAGES) {
      try {
        const resp = await page.goto(BASE + path, { waitUntil: "load", timeout: 30000 });
        const status = resp?.status();
        // layout checks
        const checks = await page.evaluate(() => {
          const r = {};
          r.hScroll = document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 2;
          r.megaVisible = !!document.querySelector(".mega, .display");
          r.imgs = [...document.images].filter((i) => i.naturalWidth === 0 &&
            i.loading !== "lazy" && i.getBoundingClientRect().top < 900).length;
          const btn = document.querySelector(".btn");
          r.btnTapOk = btn ? btn.getBoundingClientRect().height >= 40 : null;
          return r;
        });
        const probs = [];
        if (status !== 200) probs.push(`HTTP ${status}`);
        if (checks.hScroll) probs.push("horizontal scroll");
        if (!checks.megaVisible) probs.push("headline missing");
        if (checks.imgs > 0) probs.push(`${checks.imgs} broken images in view`);
        if (checks.btnTapOk === false) probs.push("button under 40px tap target");
        out.push({ engine: ename, vp: vp.name, path, ok: probs.length === 0, probs });
      } catch (e) {
        out.push({ engine: ename, vp: vp.name, path, ok: false, probs: [e.message.slice(0, 80)] });
      }
    }
    if (errors.length) out.push({ engine: ename, vp: vp.name, path: "(js errors)", ok: false, probs: errors.slice(0, 3) });
    await ctx.close();
  }
  await browser.close();
}
let fails = 0;
for (const r of out) {
  if (!r.ok) fails++;
  console.log(`${r.ok ? "OK  " : "FAIL"} ${r.engine} | ${r.vp} | ${r.path}${r.probs.length ? " | " + r.probs.join("; ") : ""}`);
}
console.log(`\n${out.length - fails} passed, ${fails} failed`);
