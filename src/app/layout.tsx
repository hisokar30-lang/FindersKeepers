import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import { Inter } from "next/font/google";

import ClientInitializer from "../components/ClientInitializer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ErrorBoundary } from "../components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FindersKeepers - Lost & Found Protocol",
  description: "A trusted community-driven platform to report lost items, find what you're missing, and build community trust. Secure, transparent, and easy to use.",
  openGraph: {
    title: "FindersKeepers - Lost & Found Protocol",
    description: "Lost something? Found something? Connect with your community on FindersKeepers.",
    url: "https://finders-keepers.vercel.app",
    siteName: "FindersKeepers",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FindersKeepers Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientInitializer />
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <Footer />
      </body>
    </html>
  );
}
