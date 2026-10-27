import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Google Analytics 4, property "Portfolio (rdeepak)" in the shared GA account.
const GA_ID = "G-RNG1RK0C3C";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--ff-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--ff-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-mono" });

const SITE = "https://rdeepak.vercel.app";
const TITLE = "Deepak Ramesh — AI Engineer · LLM Pipelines & Automation";
const DESCRIPTION =
  "I build AI agents and LLM automation end to end: the pipeline behind 68 of Firestorm's 117 sites (5 → 32 a month), escalation-gate (an open-source agent that checks every citation it makes) and LifeDots, from my studio Outbuiltit.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE,
    siteName: "Deepak Ramesh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
