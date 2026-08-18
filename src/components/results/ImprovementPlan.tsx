"use client";

import type { Module, Answers, CompanyProfile } from "@/types";
import { applicable, scoreColor, computeResults } from "@/lib/scoring";

interface ImprovementPlanProps {
  modules: Module[];
  answers: Answers;
  company: CompanyProfile;
}

const RESPONSABLES: Record<string, string> = {
  sst: "Responsable SG-SST",
  ambiental: "Coordinador Ambiental/HSEQ",
  calidad: "Líder de Calidad",
  riesgos: "Oficial de Riesgos",
  cumplimiento: "Oficial de Cumplimiento",
  datos: "Oficial de Datos/Seguridad",
  gobierno: "Gobierno Corporativo",
  esg: "Líder de Sostenibilidad/ESG",
  gobernanza_ia: "Responsable de Gobernanza de IA",
};

export default function ImprovementPlan({ modules, answers, company }: ImprovementPlanProps) {
  const { perModule } = computeResults(modules, answers, company);
  const ranked = perModule.filter((x) => x.compliance !== null).sort((a, b) => (a.compliance || 0) - (b.compliance || 0));

  return (
    <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-5">
      <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Plan de mejora priorizado</h3>
      <p className="text-xs text-muted mb-4">Principales acciones por módulo (mayor brecha primero).</p>

      {ranked.map((r) => {
        const items = r.module.preguntas
          .filter((q) => applicable(q, company) && (answers[q.id] === 0 || answers[q.id] === 1))
          .sort((a, b) => ((2 - (answers[b.id] as number)) * b.peso) - ((2 - (answers[a.id] as number)) * a.peso))
          .slice(0, 5);

        if (!items.length) return null;

        const color = scoreColor(r.compliance || 0);

        return (
          <div key={r.module.id} className="border border-line rounded-[12px] p-4 mb-3 last:mb-0">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-[9px] h-[9px] rounded-full flex-none" style={{ background: color }} />
              <h4 className="font-[var(--font-heading)] text-[14.5px] font-semibold m-0 flex-1">{r.module.name}</h4>
              <span
                className="font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded-[6px] whitespace-nowrap"
                style={{ background: `${color}20`, color }}
              >
                {Math.round(r.compliance || 0)}% · {r.level?.name}
              </span>
            </div>
            <ul className="m-0 pl-4 space-y-1.5">
              {items.map((q) => {
                const v = answers[q.id] as number;
                const prioridad = v === 0 ? "Alta" : "Media";
                const dias = v === 0 ? 30 : 90;
                return (
                  <li key={q.id} className="text-[12.5px] text-[#3A4658] leading-[1.5]">
                    <b>{q.pregunta}</b> — {q.recomendacion[String(v)]}
                    <div className="font-mono text-[11px] text-muted mt-0.5">
                      Prioridad {prioridad} · {RESPONSABLES[r.module.id]} · Plazo {dias} días · {q.norma}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
