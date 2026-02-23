"use client";

import Mermaid from "./Mermaid";

export default function MapViewer() {
  const chart = `
flowchart TD
    subgraph S1 ["Starting Out"]
        MitisTown((Mitis Town))
        Route1[Route 1]
        CheshmaTown((Cheshma Town))
        GaleForest[Gale Forest]
    end

    subgraph S2 ["Central Roria"]
        Route2[Route 2]
        Route3[Route 3]
        SilventCity((Silvent City))
        Route4[Route 4]
        Route5[Route 5]
        BrimberCity((Brimber City))
        OldGraveyard[Old Graveyard]
        GlisteningGrotto[Glistening Grotto]
    end

    subgraph S3 ["The Mountains & Coast"]
        Route6[Route 6]
        MtIgneus[Mt. Igneus]
        CalciteChamber[Calcite Chamber]
        Route7[Route 7]
        PathOfTruth[Path of Truth]
        LagoonaLake[Lagoona Lake]
        SecretGrove[Secret Grove]
        Route8[Route 8]
        RosecoveBeach[Rosecove Beach]
        RosecoveCity((Rosecove City))
    end

    subgraph S4 ["The Arid East"]
        Route9[Route 9]
        GroveOfDreams[Grove of Dreams]
        FortuloseManor[Fortulose Manor]
        Route10[Route 10]
        CragonosMines[[Cragonos Mines]]
        CragonosCliffs[Cragonos Cliffs]
        CragonosPeak[Cragonos Peak]
        Route11[Route 11]
        DesertCatacombs[[Desert Catacombs]]
        ArediaCity((Aredia City))
    end

    subgraph S5 ["Jungle & Tundra"]
        OldAredia[Old Aredia]
        Route12[Route 12]
        NaturesDen[[Nature's Den]]
        Route13[Route 13]
        FluorumaCity((Fluoruma City))
        Route14[Route 14]
        Route15[Route 15]
        FrostveilCity((Frostveil City))
    end

    subgraph S6 ["The Final Road"]
        Route16[Route 16]
        CosmeosValley[/Cosmeos Valley/]
        RoriaLeague(((Roria League)))
        PortDecca((Port Decca))
        CrescentTown((Crescent Town))
        Route17[Route 17]
        Route18[Route 18]
        DemonsTomb[[Demon's Tomb]]
    end

    %% Connections
    MitisTown <--> Route1 <--> CheshmaTown
    CheshmaTown <--> GaleForest & Route2
    Route2 <--> Route3 <--> SilventCity <--> Route4 <--> Route5
    Route5 <--> BrimberCity & OldGraveyard & GlisteningGrotto
    BrimberCity <--> Route6 & Route7
    Route6 <--> MtIgneus & CalciteChamber
    Route7 <--> PathOfTruth & LagoonaLake
    LagoonaLake <--> Route8 & SecretGrove
    Route8 <--> RosecoveBeach <--> RosecoveCity <--> Route9
    Route9 <--> GroveOfDreams & FortuloseManor & Route10
    Route10 <--> CragonosMines <--> CragonosCliffs & CragonosPeak & Route11
    Route11 <--> DesertCatacombs & ArediaCity
    ArediaCity <--> OldAredia & Route12
    Route12 <--> NaturesDen & Route13 <--> FluorumaCity <--> Route14 <--> Route15 <--> FrostveilCity
    FrostveilCity <--> Route16 <--> CosmeosValley
    CosmeosValley <--> RoriaLeague & PortDecca
    PortDecca <--> Route17 <--> CrescentTown <--> Route18 <--> DemonsTomb

    %% Styling
    classDef pink fill:#f9f,stroke:#333,stroke-width:2px;
    classDef hub fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff;
    classDef league fill:#8b5cf6,stroke:#5b21b6,stroke-width:4px,color:#fff;
    
    class MitisTown,CheshmaTown,SilventCity,BrimberCity,RosecoveCity,ArediaCity,FluorumaCity,FrostveilCity,CrescentTown,PortDecca hub;
    class RoriaLeague league;
  `;

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-top duration-1000">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-blue-400 via-emerald-400 to-purple-500 bg-clip-text text-transparent drop-shadow-sm">
          Roria Region Navigator
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          The definitive architectural guide to <span className="text-zinc-200">Pok&eacute;mon Bronze Forever</span>. 
          Expertly mapped for trainers seeking perfection.
        </p>
      </div>

      <div className="relative w-full group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
        <div className="relative w-full bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-12 overflow-x-auto shadow-2xl">
          <div className="min-w-[900px]">
            <Mermaid chart={chart} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
        <LegendItem 
          icon={<div className="w-4 h-4 rounded-full bg-blue-600 shadow-lg shadow-blue-500/40" />}
          label="Settlements"
          desc="Cities and towns"
        />
        <LegendItem 
          icon={<div className="w-4 h-4 bg-zinc-700 border border-zinc-500" />}
          label="Pathways"
          desc="Routes and forests"
        />
        <LegendItem 
          icon={<div className="w-4 h-4 rounded-sm border-2 border-dashed border-zinc-500" />}
          label="Dungeons"
          desc="Caves and ruins"
        />
        <LegendItem 
          icon={<div className="w-4 h-4 rounded-full ring-4 ring-purple-600/30 bg-purple-500" />}
          label="The League"
          desc="Final destination"
        />
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-white/5">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 px-3">Reference Guide</span>
          <p className="text-zinc-400 text-sm pl-3 leading-relaxed">
            Click and drag to pan through the Roria region. The chart is organized from the Southwest (Start) to the Southeast (Endgame).
          </p>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors group">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{label}</h4>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}
