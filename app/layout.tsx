import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Slangillion — How deep is your slang?",
  description:
    "Seven prompts. 25 seconds. Find the rarest slang and descend into the underground.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
