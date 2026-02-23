import MapViewer from "@/components/MapViewer";

export const metadata = {
  title: "Roria Region Map | myPokedex",
  description: "View the full world map of Pok&eacute;mon Bronze Forever and explore every route and city.",
};

export default function MapPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 bg-[#0a0a0b]">
      <MapViewer />
    </main>
  );
}
