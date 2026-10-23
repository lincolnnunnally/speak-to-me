import { FeaturePage } from "@/components/FeaturePage";
import { featureMetadata } from "@/lib/seo";

export const metadata = featureMetadata("quiet-questions");

// The same four questions the app shows under every passage.
const QUESTIONS = [
  "Where do I see myself in this story or statement today?",
  "What is God saying to me about how He sees me right now?",
  "Is there something He is inviting me to receive, release, or do?",
  "What would it look like to trust this today?",
];

export default function QuietQuestionsPage() {
  return (
    <FeaturePage
      id="quiet-questions"
      eyebrow="Quiet questions"
      heading="Four quiet questions for hearing God in Scripture"
      lede={'These are not study questions. They move you from "What did this mean then?" to "What is this saying to me, right now, by the Spirit?"'}
      sections={[
        {
          heading: "The four questions",
          body: (
            <ul className="space-y-2">
              {QUESTIONS.map((q) => (
                <li key={q} className="bg-white/70 rounded-xl px-4 py-3 border border-black/5">
                  {q}
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: "Who it's for",
          body: (
            <p>
              Anyone who reads the Bible and comes away tired instead of alive, and suspects the
              posture is the problem rather than them.
            </p>
          ),
        },
        {
          heading: "How it works",
          body: (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open today&apos;s verse or any passage.</li>
              <li>The questions appear right under the text.</li>
              <li>Sit with one or two. If something lands, write it in your private journal.</li>
            </ol>
          ),
        },
      ]}
      cta="Try it with a passage"
    />
  );
}
