import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Roast Bot",
  description: "Get your PDF roasted before your client does."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
