import type { Metadata } from "next";
import { Cormorant_Garamond, Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";
import { getSiteMeta } from "@/lib/event-details";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta();
  const images = meta.ogImageUrl ? [{ url: meta.ogImageUrl }] : undefined;
  return {
    title: meta.title,
    description: meta.description,
    openGraph: { title: meta.title, description: meta.description, images, type: "website" },
    twitter: { card: meta.ogImageUrl ? "summary_large_image" : "summary", title: meta.title, description: meta.description, images: meta.ogImageUrl ? [meta.ogImageUrl] : undefined },
  };
}

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
