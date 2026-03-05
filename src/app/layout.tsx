import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import ClientInitializer from "../components/ClientInitializer";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-[var(--bg-main)] text-[var(--text-primary)]">
        <ClientInitializer />
        <Navbar />
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
