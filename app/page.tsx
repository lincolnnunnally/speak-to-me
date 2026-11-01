import HomeClient from "./HomeClient";
import { FeatureLinks } from "@/components/FeatureLinks";
import { JsonLd } from "@/components/JsonLd";
import { fetchHomescreenVerse } from "@/lib/churchconnect";
import { INVITATION_QUESTIONS } from "@/lib/questions";
import { HOME, appJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", HOME.title, HOME.description);

// Today's verse is fetched on the server so it is in the HTML; refresh every five minutes.
export const revalidate = 300;

export default async function HomePage() {
  const today = await fetchHomescreenVerse();
  return (
    <>
      <JsonLd data={appJsonLd} />
      <div id="start">
        <HomeClient />
      </div>
      {/* Server-rendered so the page says what it is before the app loads. The page's only H1 is here. */}
      <section className="bg-cream text-ink">
        <div className="max-w-2xl mx-auto px-5 pt-4 pb-4 space-y-6">
          <header>
            <h1 className="text-3xl font-serif tracking-tight">
              A daily Bible verse, and a quiet place to hear Scripture as a living word
            </h1>
            <p className="text-soft mt-3 leading-relaxed">
              Many of us were taught to read the Bible like a history book to decode or a rulebook
              to master. When that leaves you tired instead of alive, it is easy to decide the
              problem is you. Often it is only the posture. Speak to Me is a quiet Bible reading
              app that helps you move from &ldquo;What did this mean then?&rdquo; to &ldquo;What is
              God saying to me, right now?&rdquo;
            </p>
          </header>

          {today?.reference && today.bsb_text ? (
            <article className="bg-card rounded-2xl p-6 shadow-sm border border-black/5">
              <h2 className="text-xs uppercase tracking-wide text-accent mb-2">Today&apos;s verse</h2>
              <blockquote className="font-serif text-lg leading-relaxed text-ink">
                <p>&ldquo;{today.bsb_text}&rdquo;</p>
                <footer className="text-sm text-soft mt-2 not-italic">
                  {today.reference} · Berean Standard Bible
                </footer>
              </blockquote>
              {today.real_life_application ? (
                <p className="text-sm text-ink/80 mt-3 italic">
                  Real life: {today.real_life_application}
                </p>
              ) : null}
            </article>
          ) : null}

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-black/5">
            <h2 className="text-lg font-medium text-accent mb-3">What Speak to Me gives you</h2>
            <ul className="space-y-3 leading-relaxed">
              <li>
                <strong>Today&apos;s verse.</strong> One verse each day in the Berean Standard
                Bible with a short real-life application from the ChurchConnect content hub. It is
                on the front page even before you sign in.
              </li>
              <li>
                <strong>Any passage you choose.</strong> Type a reference like John 3:16 or Psalm
                23 and read it on a clean page in the public-domain World English Bible, with the
                King James Version as a fallback. No commentary, no feed, no streak to keep.
              </li>
              <li>
                <strong>Four quiet questions.</strong> Not study questions, but an invitation to
                listen after you read:
                <ul className="list-disc pl-5 mt-2 space-y-1 text-soft">
                  {INVITATION_QUESTIONS.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </li>
              <li>
                <strong>A private journal.</strong> Write one honest sentence back to God. It is
                saved to your account, shown only to you, and you can delete any entry. Area
                pastors may see which passages people are reading, never your words.
              </li>
            </ul>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-black/5">
            <h2 className="text-lg font-medium text-accent mb-3">How it works</h2>
            <ol className="list-decimal pl-5 space-y-1 leading-relaxed">
              <li>Create an account. It works across the whole Life Produces Life family of apps.</li>
              <li>Open today&apos;s verse, or enter any passage and press Open.</li>
              <li>Read slowly, then sit with the quiet questions.</li>
              <li>If you like, write a response and tap Journal to look back over time.</li>
            </ol>
          </div>

          <a
            href="#start"
            className="inline-block px-5 py-3 bg-ink text-cream rounded-xl font-medium active:scale-95 transition"
          >
            Create an account and hear today&apos;s word
          </a>
        </div>
      </section>
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
