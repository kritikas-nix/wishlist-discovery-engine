import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Noto_Sans_Devanagari } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
});
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "Why saved items don't get bought",
  description:
    "A research project on Myntra wishlist-to-purchase conversion: an AI discovery engine over 3,183 public conversations, primary research on real wishlists, and a working prototype that answers the doubt blocking the purchase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${devanagari.variable}`}>
      <body>
        <main>
          <div className="wrap">
            <nav className="nav">
              <Link href="/" className="brand">
                worth a <em>look?</em>
              </Link>
              <span className="spacer" />
              <Link href="/" className="link">The research</Link>
              <Link href="/engine" className="link">Discovery engine</Link>
              <Link href="/mvp" className="link">The prototype</Link>
            </nav>
            {children}
            <footer className="footer">
              A product research project on wishlist-to-purchase conversion in
              Indian fashion e-commerce. Every number on this site is computed
              from collected data and carries its sample size; every quote is
              verbatim. Research artifacts:{" "}
              <a href="https://forms.gle/2f1TYzFeu95ZXCEe6"
                style={{ color: "var(--berry)" }}>the survey instrument</a>.
              Not affiliated with Myntra.
            </footer>
          </div>
        </main>
      </body>
    </html>
  );
}
