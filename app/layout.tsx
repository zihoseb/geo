import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "B2B AI Visibility Audit",
  description: "Check whether AI search tools recommend your B2B brand.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
