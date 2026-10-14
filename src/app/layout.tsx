import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_URL } from "@/site";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Game World",
    template: "%s · Game World",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Game World",
  openGraph: { type: "website", siteName: "Game World", title: "Game World", description: SITE_DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Game World", description: SITE_DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#101426", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
