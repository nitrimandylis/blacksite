import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted to avoid the next/font/google metrics-lookup warning for the
// merged "Big Shoulders" family. Variable file covers weights 600–700.
const display = localFont({
  src: "./fonts/big-shoulders.woff2",
  weight: "600 700",
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BLACKSITE // ops console",
  description:
    "Monochrome intrusion operations console — network graphs, orbital target maps, live telemetry.",
  metadataBase: new URL("https://blacksite.vercel.app"),
  openGraph: {
    title: "BLACKSITE // ops console",
    description: "Monochrome intrusion operations console.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
