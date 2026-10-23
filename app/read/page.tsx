import { FeaturePage } from "@/components/FeaturePage";
import { featureMetadata } from "@/lib/seo";

export const metadata = featureMetadata("read");

export default function ReadPage() {
  return (
    <FeaturePage
      id="read"
      eyebrow="Read any passage"
      heading="Read any Bible passage on a quiet page"
      lede="Type a reference and read it with nothing else on the screen. No commentary, no feed, no streak to keep."
      sections={[
        {
          heading: "Who it's for",
          body: (
            <p>
              People who are tired of approaching the Bible as a history textbook and want to
              read a passage slowly, as a living word.
            </p>
          ),
        },
        {
          heading: "What you get",
          body: (
            <>
              <p>
                The passage in the public-domain World English Bible, with the King James Version
                as a fallback when it is not available.
              </p>
              <p>
                Simple references work: John 3:16, Psalm 23, Romans 8:1, Matthew 11:28-30, Psalm
                46:10, Isaiah 41:10.
              </p>
            </>
          ),
        },
        {
          heading: "How it works",
          body: (
            <ol className="list-decimal pl-5 space-y-1">
              <li>Create an account or sign in.</li>
              <li>Enter a reference and press Open.</li>
              <li>Read slowly, then turn to the quiet questions under the passage.</li>
            </ol>
          ),
        },
      ]}
      cta="Start reading"
    />
  );
}
