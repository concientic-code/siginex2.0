"use client";

import type { Module, Answers, CompanyProfile } from "@/types";
import { applicable } from "@/lib/scoring";

interface GapsListProps {
  modules: Module[];
  answers: Answers;
  company: CompanyProfile;
}

interface Gap {
  module: string;
  text: string;
  norma: string;
}

export default function GapsList({ modules, answers, company }: GapsListProps) {
  const gaps: Gap[] = [];

  for (const m of modules) {
    for (const q of m.preguntas) {
      if (answers[q.id] === 0 && applicable(q, company)) {
        gaps.push({ module: m.short, text: q.pregunta, norma: q.norma });
      }
    }
  }

  const shown = gaps.slice(0, 60);

  return (
    <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-5">
      <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Brechas regulatorias</h3>
      <p className="text-xs text-muted mb-4">
        Ítems marcados como &quot;No cumple&quot; (0), con su norma.
        {gaps.length > 60 ? ` Mostrando 60 de ${gaps.length}.` : ""}
      </p>

      {gaps.length === 0 ? (
        <div className="text-[13.5px] text-good">
          Sin brechas marcadas. Complete el cuestionario para confirmar la cobertura.
        </div>
      ) : (
        <div className="space-y-0">
          {shown.map((g, i) => (
            <div key={i} className="flex gap-3 py-2.5 border-b border-line-soft last:border-b-0 items-start">
              <div className="w-[9px] h-[9px] rounded-full bg-danger mt-1.5 flex-none" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium">{g.text}</div>
                <div className="font-mono text-[11px] text-muted mt-0.5">{g.norma}</div>
              </div>
              <span className="font-mono text-[10.5px] text-slate-700 bg-line-soft border border-line rounded-[6px] px-2 py-0.5 whitespace-nowrap">
                {g.module}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
