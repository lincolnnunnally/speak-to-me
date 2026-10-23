import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Telemetry } from '../lib/TelemetryProvider';
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, organizationJsonLd } from "@/lib/seo";

// Pages set their own title, description and canonical; this is the fallback.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary" },
  title: "Hear Scripture as a living word — one day at a time",
  description:
    "A quiet place to hear Scripture as a living word from God — not a history textbook. Create an account to keep your journal.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <JsonLd data={organizationJsonLd} />
        {children}
        <Telemetry app="speaktome" />
      </body>
    </html>
  );
}
