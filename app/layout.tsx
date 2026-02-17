import type { Metadata } from "next";
import "./globals.css";
import { CaughtProvider } from "@/components/CaughtProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ThemeApplier } from "@/components/ThemeApplier";
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
        <PreferencesProvider>
          <ThemeApplier />
          <CaughtProvider>
            <Header />
            {children}
          </CaughtProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
