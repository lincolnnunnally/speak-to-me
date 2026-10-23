import HomeClient from "./HomeClient";
import { FeatureLinks } from "@/components/FeatureLinks";
import { JsonLd } from "@/components/JsonLd";
import { HOME, appJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", HOME.title, HOME.description);

export default function HomePage() {
  return (
    <>
      <JsonLd data={appJsonLd} />
      <HomeClient />
      {/* Server-rendered so the page says what it is before the app loads. */}
      <footer className="bg-cream text-ink">
        <div className="max-w-2xl mx-auto px-5 pb-12">
          <p className="text-sm text-soft leading-relaxed">
            Speak to Me is a quiet Bible reading app for hearing Scripture as a living word from
            God, not a history textbook: today&apos;s verse, any passage you choose, four quiet
            questions, and a private journal.
          </p>
          <FeatureLinks />
        </div>
      </footer>
    </>
  );
}
