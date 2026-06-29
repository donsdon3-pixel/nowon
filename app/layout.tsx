import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nowon",
  description: "Identity profiles for the nowon platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
