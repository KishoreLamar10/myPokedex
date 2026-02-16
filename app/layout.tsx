import type { Metadata } from "next";
import "./globals.css";
import { CaughtProvider } from "@/components/CaughtProvider";
import { Header } from "@/components/Header";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <CaughtProvider>
          <Header />
          {children}
        </CaughtProvider>
      </body>
    </html>
  );
}
