import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unpack - GitHub Code Analysis Platform",
  description: "Analyze GitHub repositories to get comprehensive code insights, summarizations, and architecture details",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
