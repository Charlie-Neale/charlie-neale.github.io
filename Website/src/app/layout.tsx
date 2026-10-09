import type { Metadata } from "next";
import "@fontsource/bebas-neue";
import "@fontsource/oswald";
import "@fontsource/oswald/700.css";
import "@fontsource/permanent-marker";
import "@fontsource/bangers";
import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "./globals.css";
import FlashProvider from "@/components/FlashProvider";
import InteractiveDotCanvas from "@/components/InteractiveDotCanvas";
import CursorStars from "@/components/CursorStars";

export const metadata: Metadata = {
  title: "Charlie Neale — Developer · Analyst · Builder",
  description: "Portfolio of Charlie Neale, Computer Science student at the University of Toronto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      style={{
        "--font-bebas-neue": '"Bebas Neue", sans-serif',
        "--font-oswald": '"Oswald", sans-serif',
        "--font-marker": '"Permanent Marker", cursive',
        "--font-bangers": '"Bangers", cursive',
        "--font-rajdhani": '"Rajdhani", sans-serif',
      } as React.CSSProperties}
    >
      <body className="antialiased">
        <InteractiveDotCanvas />
        <FlashProvider>
          {children}
        </FlashProvider>
        {/* Joker victory-screen sparkles trailing the cursor — above everything */}
        <CursorStars />
      </body>
    </html>
  );
}
