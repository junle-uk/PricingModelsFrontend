import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Option Pricing Models Visualizer",
  description: "Real-time options pricing calculator with interactive Greeks visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
