import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import HearIt from "@/components/HearIt";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Showcase from "@/components/Showcase";
import Faq, { FAQ } from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Support from "@/components/Support";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { RoofDivider } from "@/components/Skyline";
import { LevelLadder } from "@/components/LevelGauge";

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.text },
  })),
};

export default function Home() {
  return (
    <Providers>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-lg focus:bg-marigold focus:px-4 focus:py-2 focus:font-semibold focus:text-night"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <HearIt />
        <Features />
        <HowItWorks />
        <RoofDivider seed={23} from="#0a1222" />
        <Showcase />
        <Faq />
        <RoofDivider seed={41} from="#0a1222" />
        <FinalCta />
        <Support />
      </main>
      <Footer />
      <LevelLadder />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </Providers>
  );
}
