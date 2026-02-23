"use client";

import React, { useMemo } from "react";
import Mermaid from "./Mermaid";
import { normalizeLocation, getPathToFlyable, RORIA_MAP } from "@/lib/roria-map";

interface LocationMiniMapProps {
  location: string;
}

export default function LocationMiniMap({ location }: LocationMiniMapProps) {
  const normalized = useMemo(() => normalizeLocation(location), [location]);
  const path = useMemo(() => getPathToFlyable(normalized), [normalized]);

  const chart = useMemo(() => {
    if (!path || path.length === 0) return "";

    // Reverse path so it shows Flyable City -> ... -> Target Location
    const displayPath = [...path].reverse();
    
    let chartStr = "graph LR\n";
    chartStr += "    classDef city fill:#3b82f6,stroke:#1e40af,color:#fff,stroke-width:1px;\n";
    chartStr += "    classDef target fill:#ef4444,stroke:#991b1b,color:#fff,stroke-width:1px;\n";
    
    for (let i = 0; i < displayPath.length; i++) {
        const node = displayPath[i];
        const isCity = RORIA_MAP[node]?.isCity;
        const isTarget = node === normalized;
        
        // Use shorter shapes and IDs
        const id = node.replace(/\s+/g, "");
        let shape = isCity ? `((${node}))` : `[${node}]`;
        
        if (isTarget) {
            chartStr += `    ${id}${shape}:::target\n`;
        } else if (isCity) {
            chartStr += `    ${id}${shape}:::city\n`;
        } else {
            chartStr += `    ${id}${shape}\n`;
        }

        if (i < displayPath.length - 1) {
            const nextNode = displayPath[i+1];
            chartStr += `    ${id} --> ${nextNode.replace(/\s+/g, "")}\n`;
        }
    }
    
    return chartStr;
  }, [path, normalized]);

  if (!chart) return null;

  return (
    <div className="p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm animate-in fade-in duration-500 flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1.5 text-[8px] font-black uppercase tracking-widest text-zinc-500 gap-2">
        <span>Path</span>
        <span className="text-emerald-400 font-bold whitespace-nowrap">Fly to {path![path!.length - 1]}</span>
      </div>
      
      <div className="w-full overflow-hidden">
        <Mermaid chart={chart} />
      </div>
    </div>
  );
}
