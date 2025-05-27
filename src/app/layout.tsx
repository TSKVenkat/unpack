import type { Metadata } from "next";
import "./globals.css";
import { useEffect } from "react";
import { initMonitoring } from "@/lib/monitoring";

export const metadata: Metadata = {
  title: "Unpack - GitHub Code Analysis Platform",
  description: "Analyze GitHub repositories to get comprehensive code insights, summarizations, and architecture details",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    initMonitoring();
  }, []);

  return (
    <html lang="en">
      <head>
        <script src="/plausible.js" async defer />
      </head>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
