import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Experiment Lab | Design Rigorous Experiments",
  description:
    "A guided, gamified platform to design rigorous experiments — from problem statement to analysis report.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">{children}</body>
    </html>
  );
}
