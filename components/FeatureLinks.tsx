import Link from "next/link";
import { FEATURES, FEATURE_ORDER, type FeatureKey } from "@/lib/seo";

/** Plain links between the public "what Speak to Me does" pages, so people and crawlers can find each one. */
export function FeatureLinks({ current }: { current?: FeatureKey }) {
  return (
    <nav aria-label="What Speak to Me does" className="mt-10 border-t border-black/5 pt-6">
      <p className="text-xs uppercase tracking-wide text-soft mb-3">What Speak to Me does</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {current ? (
          <li>
            <Link href="/" className="text-accent hover:underline underline-offset-2">
              Start reading
            </Link>
          </li>
        ) : null}
        {FEATURE_ORDER.filter((k) => k !== current).map((k) => (
          <li key={k}>
            <Link href={FEATURES[k].path} className="text-accent hover:underline underline-offset-2">
              {FEATURES[k].name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
