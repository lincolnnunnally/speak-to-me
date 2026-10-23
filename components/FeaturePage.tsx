import Link from "next/link";
import { FeatureLinks } from "@/components/FeatureLinks";
import { JsonLd } from "@/components/JsonLd";
import { featureJsonLd, type FeatureKey } from "@/lib/seo";

type Section = { heading: string; body: React.ReactNode };

/** Shared shell for the public explainer pages. Server-rendered so the words are in the HTML. */
export function FeaturePage({
  id,
  eyebrow,
  heading,
  lede,
  sections,
  cta,
}: {
  id: FeatureKey;
  eyebrow: string;
  heading: string;
  lede: string;
  sections: Section[];
  cta: string;
}) {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <JsonLd data={featureJsonLd(id)} />
      <div className="max-w-2xl mx-auto px-5 pt-8 pb-20">
        <header className="mb-8">
          <Link href="/" className="font-serif text-lg tracking-tight">
            Speak to Me
          </Link>
          <p className="text-xs uppercase tracking-wide text-accent mt-8 mb-2">{eyebrow}</p>
          <h1 className="text-3xl font-serif tracking-tight">{heading}</h1>
          <p className="text-soft mt-3 leading-relaxed">{lede}</p>
        </header>
        <div className="space-y-6">
          {sections.map((s) => (
            <section key={s.heading} className="bg-card rounded-2xl p-6 shadow-sm border border-black/5">
              <h2 className="text-lg font-medium text-accent mb-2">{s.heading}</h2>
              <div className="text-ink leading-relaxed space-y-3">{s.body}</div>
            </section>
          ))}
        </div>
        <Link
          href="/"
          className="inline-block mt-8 px-5 py-3 bg-ink text-cream rounded-xl font-medium active:scale-95 transition"
        >
          {cta}
        </Link>
        <FeatureLinks current={id} />
      </div>
    </main>
  );
}
