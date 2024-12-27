import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import Providers from "../providers";
import ProtectedLayout from "../components/ProtectedLayout";
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tallya - Seating and Capacity Management",
  description:
    "A versatile tallying app for managing seating capacity, plans, and more.",
  keywords: [
    "tallying",
    "seat plan",
    "capacity counting",
    "seat management",
    "event management",
  ],
  authors: [
    {
      url: "https://github.com/almoratalla",
      name: "Alain Moratalla",
    },
  ],
  icons: {
    icon: "/tallya.svg",
  },
  openGraph: {
    type: "website",
    title: "Tallya",
    description:
      "A versatile tallying app for managing seating capacity, plans, and more.",
    url: "https://usher-tally.vercel.app/m",
    siteName: "Tallya",
    images: [
      {
        url: "https://usher-tally.vercel.app",
        width: 800,
        height: 600,
        alt: "Tallya - Seating and Capacity Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tallya",
    description:
      "A versatile tallying app for managing seating capacity, plans, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <Providers>
          <Toaster />
          <ProtectedLayout>{children}</ProtectedLayout>
        </Providers>
      </body>
    </html>
  );
}
