import type { Metadata } from "next";
import { Baloo_2, Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});
const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Amari's Baptism · July 26, 2026",
  description:
    "Join us for the baptism of Amari Wong — Sunday, July 26, 2026 at St. Benedict Parish, with reception to follow at Okairi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${script.variable} ${body.variable}`}
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
