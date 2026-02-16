import Link from "next/link";
import { FavoritesPageClient } from "@/components/FavoritesPageClient";

export default function FavoritesPage() {
  return (
    <main className="p-6 md:p-10">
      <FavoritesPageClient />
    </main>
  );
}
