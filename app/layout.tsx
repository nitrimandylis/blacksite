import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
