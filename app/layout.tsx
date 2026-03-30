import type { Metadata } from "next";
import { Chivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CPTrack - Competitive Programming Platform",
  description: "Track your competitive programming progress, solve problems, and rise up the leaderboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${chivo.variable} ${jetbrainsMono.variable} antialiased dark`}
    >
      <body className="bg-cp-bg text-cp-text font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mt-14">{children}</main>
      </body>
    </html>
  );
}
