import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--ff-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--ff-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-mono" });

export const metadata: Metadata = {
  title: "Deepak Ramesh — AI Engineer · LLM Pipelines & Automation",
  description:
    "I build and run production AI agents and automation end to end. A live multi-tenant WhatsApp SaaS, a multi-agent pipeline that scaled site production 5→32 in 4 weeks, ML email classification at 10K+/month.",
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
