import type { Metadata } from "next";
import { Instrument_Serif, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { ReaderProvider } from "@/lib/reader-context";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { profile } from "@/lib/data/profile";
import "./globals.css";

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${profile.name} — Builder & Software Engineer`,
  description: profile.intro,
  openGraph: {
    title: `${profile.name} — Builder & Software Engineer`,
    description: profile.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain">
        <ReaderProvider>
          <Nav />
          {children}
          <Footer />
        </ReaderProvider>
      </body>
    </html>
  );
}
