import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { CaughtProvider } from "@/components/CaughtProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { ThemeApplier } from "@/components/ThemeApplier";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "My Pokédex Pro",
  description: "Track every Pokémon you catch in game",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pokédex Pro",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <NuqsAdapter>
          <PreferencesProvider>
            <ThemeApplier />
            <CaughtProvider>
              <Header />
              {children}
            </CaughtProvider>
          </PreferencesProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
