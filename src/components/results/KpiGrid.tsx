"use client";

import { scoreColor, levelFor } from "@/lib/scoring";

interface KpiGridProps {
  score: number;
  modulesEvaluated: number;
  totalModules: number;
  gapsCount: number;
}

export default function KpiGrid({ score, modulesEvaluated, totalModules, gapsCount }: KpiGridProps) {
  const level = levelFor(score);

  return (
    <div className="grid grid-cols-4 gap-4 mb-5">
      <div className="bg-card border border-line rounded-[14px] p-4 shadow-sm">
        <div className="text-[11px] text-muted uppercase tracking-[0.5px] font-semibold">Score global</div>
        <div className="font-[var(--font-heading)] text-[30px] font-bold leading-tight mt-2" style={{ color: scoreColor(score) }}>
          {score}
        </div>
        <div className="text-[11.5px] text-muted mt-0.5">de 100 · SGI</div>
      </div>

      <div className="bg-card border border-line rounded-[14px] p-4 shadow-sm">
        <div className="text-[11px] text-muted uppercase tracking-[0.5px] font-semibold">Madurez</div>
        <div className="font-[var(--font-heading)] text-[22px] font-bold leading-tight mt-2 pt-1.5">
          {level.n} · {level.name}
        </div>
        <div className="text-[11.5px] text-muted mt-0.5">nivel 1–5</div>
      </div>

      <div className="bg-card border border-line rounded-[14px] p-4 shadow-sm">
        <div className="text-[11px] text-muted uppercase tracking-[0.5px] font-semibold">Módulos evaluados</div>
        <div className="font-[var(--font-heading)] text-[30px] font-bold leading-tight mt-2">
          {modulesEvaluated}/{totalModules}
        </div>
        <div className="text-[11.5px] text-muted mt-0.5">del SGI</div>
      </div>

      <div className="bg-card border border-line rounded-[14px] p-4 shadow-sm">
        <div className="text-[11px] text-muted uppercase tracking-[0.5px] font-semibold">Brechas (No cumple)</div>
        <div className="font-[var(--font-heading)] text-[30px] font-bold leading-tight mt-2" style={{ color: gapsCount > 0 ? "#C0433A" : "#2F8A66" }}>
          {gapsCount}
        </div>
        <div className="text-[11.5px] text-muted mt-0.5">ítems</div>
      </div>
    </div>
  );
}
