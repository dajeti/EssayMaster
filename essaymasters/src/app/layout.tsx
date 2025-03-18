import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Essay Master",
  description: "A platform for essay assistance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-black min-h-screen">{children}</body>
    </html>
  );
}
