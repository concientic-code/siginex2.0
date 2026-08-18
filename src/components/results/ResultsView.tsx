"use client";

import type { Module, Answers, CompanyProfile, ModuleResult } from "@/types";
import { computeResults, scoreColor, levelFor } from "@/lib/scoring";
import KpiGrid from "./KpiGrid";
import ScoreRing from "./ScoreRing";
import RadarChart from "./RadarChart";
import ModuleTable from "./ModuleTable";
import GapsList from "./GapsList";
import ImprovementPlan from "./ImprovementPlan";
import LearningPlan from "./LearningPlan";

interface ResultsViewProps {
  modules: Module[];
  answers: Answers;
  company: CompanyProfile;
}

export default function ResultsView({ modules, answers, company }: ResultsViewProps) {
  const { perModule, globalScore, answeredTotal, applicableTotal } = computeResults(modules, answers, company);
  const score = Math.round(globalScore);
  const level = levelFor(globalScore);
  const progress = applicableTotal ? Math.round((answeredTotal / applicableTotal) * 100) : 0;

  const evaluated = perModule.filter((x) => x.compliance !== null);
  const gapsCount = modules.reduce((n, m) => {
    return n + m.preguntas.filter((q) => answers[q.id] === 0).length;
  }, 0);

  const radarData = perModule.map((r) => ({
    label: r.module.short,
    value: r.compliance !== null ? r.compliance : 0,
  }));

  return (
    <div>
      {progress < 100 && (
        <div className="bg-[#FFF7E6] border border-[#F3E7CC] rounded-[11px] px-4 py-3 mb-5 text-[13px] text-[#7a5b18]">
          Diagnóstico {progress}% completo ({answeredTotal}/{applicableTotal}). Resultados preliminares.
        </div>
      )}

      {/* KPIs */}
      <KpiGrid
        score={score}
        modulesEvaluated={evaluated.length}
        totalModules={modules.length}
        gapsCount={gapsCount}
      />

      {/* Hero card */}
      <div className="bg-slate-800 text-white rounded-[16px] p-6 mb-5 grid grid-cols-[auto_1fr] gap-7 items-center">
        <ScoreRing score={score} />
        <div>
          <h2 className="font-[var(--font-heading)] text-[13px] tracking-[1.4px] uppercase text-[#93A1B5] font-medium m-0 mb-1.5">
            {company.nombre || "Diagnóstico del SGI"}
          </h2>
          <div className="font-[var(--font-heading)] text-[27px] font-bold m-0 mb-1.5">
            {level.name}
          </div>
          <p className="text-[#CBD5E1] text-[13.5px] m-0 mb-4 max-w-[56ch]">
            {level.desc}
          </p>
          <div className="flex gap-6 flex-wrap">
            <div className="border-l-2 border-white/[0.18] pl-3">
              <b className="font-[var(--font-heading)] text-xl font-bold block leading-tight">{score}</b>
              <span className="text-[10.5px] text-[#93A1B5] uppercase tracking-[0.5px]">Score</span>
            </div>
            <div className="border-l-2 border-white/[0.18] pl-3">
              <b className="font-[var(--font-heading)] text-xl font-bold block leading-tight">{answeredTotal}</b>
              <span className="text-[10.5px] text-[#93A1B5] uppercase tracking-[0.5px]">Respondidas</span>
            </div>
            <div className="border-l-2 border-white/[0.18] pl-3">
              <b className="font-[var(--font-heading)] text-xl font-bold block leading-tight">{company.sector || "—"}</b>
              <span className="text-[10.5px] text-[#93A1B5] uppercase tracking-[0.5px]">Sector</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar + Module bars */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm">
          <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Perfil de madurez</h3>
          <p className="text-xs text-muted mb-4">Cumplimiento (0–100) de cada componente.</p>
          <RadarChart data={radarData} />
        </div>

        <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm">
          <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Nivel por módulo</h3>
          <p className="text-xs text-muted mb-4">Escala 0-1-2 ponderada.</p>
          <div className="space-y-3">
            {perModule.map((r) => {
              const val = r.compliance !== null ? Math.round(r.compliance) : null;
              const color = val !== null ? scoreColor(val) : "#CBD5E1";
              return (
                <div key={r.module.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[12.5px] font-semibold">{r.module.name}</span>
                    <span className="font-mono text-[12.5px] font-semibold" style={{ color: val !== null ? color : "#94A3B8" }}>
                      {val !== null ? `${val}%` : "—"}
                    </span>
                  </div>
                  <div className="h-[9px] bg-line-soft rounded-[6px] overflow-hidden">
                    <div
                      className="h-full rounded-[6px] transition-[width] duration-600"
                      style={{ width: `${val || 0}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Module table */}
      <ModuleTable results={perModule} />

      {/* Gaps */}
      <GapsList modules={modules} answers={answers} company={company} />

      {/* Improvement Plan */}
      <ImprovementPlan modules={modules} answers={answers} company={company} />

      {/* Learning Plan */}
      <LearningPlan modules={modules} answers={answers} company={company} />

      {/* Disclaimer */}
      <div className="text-center text-muted text-[11px] mt-6 leading-[1.6]">
        Referencias: Res. 0312/2019 · Decreto 1072/2015 · Ley 1562/2012 · Ley 99/1993 · Decreto 1076/2015 · Res. 631/2015 · Ley 1474/2011 · Ley 2195/2022 · Ley 1581/2012 · ISO 9001·14001·45001·31000·22301·27001·37301·37001·42001.
      </div>
    </div>
  );
}
