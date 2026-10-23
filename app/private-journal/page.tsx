import { FeaturePage } from "@/components/FeaturePage";
import { featureMetadata } from "@/lib/seo";

export const metadata = featureMetadata("private-journal");

export default function PrivateJournalPage() {
  return (
    <FeaturePage
      id="private-journal"
      eyebrow="Private journal"
      heading="A private journal for answering what you hear"
      lede="After each passage, write one honest sentence as if you are answering Him. Your responses are kept with the passage so you can look back."
      sections={[
        {
          heading: "What stays private",
          body: (
            <>
              <p>
                Your journal is saved to your account and shown only to you when you are signed
                in. You can delete any entry.
              </p>
              <p>
                When you read or respond, an anonymous signal with the passage reference goes to
                ChurchConnect so area pastors can see which passages people are reading. Your
                journal text is never sent.
              </p>
            </>
          ),
        },
        {
          heading: "What you get",
          body: (
            <p>
              A list of your responses with the passage reference, a short excerpt and the date,
              so you can see what God has been saying over time.
            </p>
          ),
        },
        {
          heading: "How it works",
          body: (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Create an account. It works across the Life Produces Life family of apps.</li>
              <li>Open a passage and write your response under the quiet questions.</li>
              <li>Tap Journal at the top to read back what you have written.</li>
            </ol>
          ),
        },
      ]}
      cta="Create an account to journal"
    />
  );
}
