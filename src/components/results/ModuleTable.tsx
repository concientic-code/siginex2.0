"use client";

import type { ModuleResult } from "@/types";
import { scoreColor } from "@/lib/scoring";

interface ModuleTableProps {
  results: ModuleResult[];
}

function bandFor(escala: string, pct: number): string {
  if (escala === "res_0312") {
    if (pct < 60) return "Crítico";
    if (pct <= 85) return "Moderadamente aceptable";
    return "Aceptable";
  }
  if (pct < 60) return "Crítico";
  if (pct <= 75) return "Básico";
  if (pct <= 90) return "Aceptable";
  return "Óptimo";
}

export default function ModuleTable({ results }: ModuleTableProps) {
  return (
    <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-5">
      <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Desempeño por módulo</h3>
      <p className="text-xs text-muted mb-4">Cumplimiento, banda y nivel de madurez.</p>

      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-[0.4px] text-muted font-semibold px-2.5 py-2 border-b border-line">Módulo</th>
            <th className="text-left text-[11px] uppercase tracking-[0.4px] text-muted font-semibold px-2.5 py-2 border-b border-line">Cumplimiento</th>
            <th className="text-left text-[11px] uppercase tracking-[0.4px] text-muted font-semibold px-2.5 py-2 border-b border-line">Banda</th>
            <th className="text-left text-[11px] uppercase tracking-[0.4px] text-muted font-semibold px-2.5 py-2 border-b border-line">Nivel</th>
            <th className="text-left text-[11px] uppercase tracking-[0.4px] text-muted font-semibold px-2.5 py-2 border-b border-line">Ítems</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            if (r.compliance === null) {
              return (
                <tr key={r.module.id}>
                  <td className="px-2.5 py-2.5 border-b border-line-soft">{r.module.name}</td>
                  <td colSpan={4} className="px-2.5 py-2.5 border-b border-line-soft text-muted">Sin evaluar</td>
                </tr>
              );
            }
            const color = scoreColor(r.compliance);
            const val = Math.round(r.compliance);
            return (
              <tr key={r.module.id}>
                <td className="px-2.5 py-2.5 border-b border-line-soft font-medium">{r.module.name}</td>
                <td className="px-2.5 py-2.5 border-b border-line-soft">
                  <span
                    className="inline-block font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[6px]"
                    style={{ background: `${color}20`, color }}
                  >
                    {val}%
                  </span>
                </td>
                <td className="px-2.5 py-2.5 border-b border-line-soft">{bandFor(r.module.escala, r.compliance)}</td>
                <td className="px-2.5 py-2.5 border-b border-line-soft font-semibold">
                  {r.level ? `${r.level.n} · ${r.level.name}` : "—"}
                </td>
                <td className="px-2.5 py-2.5 border-b border-line-soft font-mono text-xs">
                  {r.answered}/{r.total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
