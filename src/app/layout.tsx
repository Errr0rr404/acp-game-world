import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: {
    default: "Game World",
    template: "%s · Game World",
  },
  description: "Pick a browser game and play it here. No account.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${atkinson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
