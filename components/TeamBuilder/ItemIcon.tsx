"use client";

import { useState } from "react";
import Image from "next/image";

interface ItemIconProps {
  itemName: string;
  className?: string; // Should include width/height styling
}

export function ItemIcon({ itemName, className = "w-8 h-8" }: ItemIconProps) {
  const [error, setError] = useState(false);

  if (!itemName) return null;

  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName.toLowerCase().replace(/ /g, "-")}.png`;

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-zinc-800 rounded-full border border-zinc-700 text-zinc-400 font-bold text-[10px] uppercase select-none`}
        title={itemName}
      >
        {itemName.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <Image
        src={src}
        alt={itemName}
        fill
        className="object-contain p-1"
        unoptimized
        onError={() => setError(true)}
      />
    </div>
  );
}
