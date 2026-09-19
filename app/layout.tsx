import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Telemetry } from '../lib/TelemetryProvider';

export const metadata: Metadata = {
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
        {children}
        <Telemetry app="speaktome" />
      </body>
    </html>
  );
}
