import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { SelectedWork } from "@/components/sections/selected-work";
import { Experience } from "@/components/sections/experience";
import { ContactCta } from "@/components/sections/contact-cta";

export default function HomePage() {
  return (
    <main className="relative z-10">
      <Hero />
      <Stats />
      <SelectedWork />
      <Experience />
      <ContactCta />
    </main>
  );
}
