import { FeaturePage } from "@/components/FeaturePage";
import { featureMetadata } from "@/lib/seo";

export const metadata = featureMetadata("daily-verse");

export default function DailyVersePage() {
  return (
    <FeaturePage
      id="daily-verse"
      eyebrow="Today's verse"
      heading="A Bible verse for today, with a real-life application"
      lede="Every day Speak to Me opens with one verse and a short note on what it can look like in real life. It is a place to start, one day at a time."
      sections={[
        {
          heading: "Who it's for",
          body: (
            <p>
              Anyone who wants a daily word from Scripture without a reading plan to keep up with
              or a chapter to get through.
            </p>
          ),
        },
        {
          heading: "What you get",
          body: (
            <p>
              Today&apos;s verse in the Berean Standard Bible and a short Real Life Application,
              drawn from the ChurchConnect content hub. It shows on the front page even before you
              sign in.
            </p>
          ),
        },
        {
          heading: "How it works",
          body: (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open Speak to Me and read today&apos;s verse.</li>
              <li>Create an account and tap the verse to receive the passage.</li>
              <li>Sit with the quiet questions and, if you like, write a response.</li>
            </ol>
          ),
        },
      ]}
      cta="See today's verse"
    />
  );
}
