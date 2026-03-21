import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BlogBase",
    template: "%s | BlogBase",
  },
  description: "Modern corporate blogging platform for teams",
};

import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { ClientProviders } from "./providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>
          <PublicNavbar />
          <div className="pt-16">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
