import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Kalam } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// All fonts are downloaded at build time and served with the site,
// so the app never calls out to Google (or anyone) while it runs.

// Body text and forms: designed for easy reading, including for low vision.
const body = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// Headings: a warm, friendly sans with a little character.
const heading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Handwriting, used only for the names on the map itself.
const hand = Kalam({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Oikos Map",
  description: "Map the people God has put around you. Saved only on your device.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#101513" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${heading.variable} ${hand.variable} h-full antialiased`}
      // The theme script sets data-theme before React loads, so the server HTML differs on purpose.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
