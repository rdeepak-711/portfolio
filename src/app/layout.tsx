import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--ff-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--ff-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-mono" });

export const metadata: Metadata = {
  title: "Deepak Ramesh — Backend & Automation Engineer",
  description:
    "I ship LLM-integrated products and the systems that build them, fast. A live WhatsApp SaaS, an automation pipeline that shipped 32 sites in 4 weeks, agents with evals.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
