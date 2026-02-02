import type { Metadata } from "next";
import "./globals.css";
import { CaughtProvider } from "@/components/CaughtProvider";

export const metadata: Metadata = {
  title: "My Pokédex",
  description: "Track every Pokémon you catch in game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CaughtProvider>{children}</CaughtProvider>
      </body>
    </html>
  );
}
