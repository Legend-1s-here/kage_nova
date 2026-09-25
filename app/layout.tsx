import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "KAGENOVA — Lab Code Sharing for Students",
    template: "%s | KAGENOVA",
  },
  description:
    "Share and access programming lab codes organized by groups. No accounts needed — just a group key.",
  keywords: ["lab code", "student", "code sharing", "programming", "group"],
  openGraph: {
    title: "KAGENOVA",
    description: "Group-based lab code sharing. No signup required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
