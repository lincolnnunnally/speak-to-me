import { NOINDEX } from "@/lib/seo";

/** Private page: keep it out of search results. */
export const metadata = NOINDEX;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
