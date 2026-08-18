"use client";

import { Shield, BarChart3, Settings, CheckCircle } from "lucide-react";
import type { Module, Answers, CompanyProfile } from "@/types";
import { applicable } from "@/lib/scoring";

interface SidebarProps {
  modules: Module[];
  currentView: string;
  onNavigate: (view: string) => void;
  answers: Answers;
  company: CompanyProfile;
}

export default function Sidebar({ modules, currentView, onNavigate, answers, company }: SidebarProps) {
  const modAnswered = (m: Module) =>
    m.preguntas.filter((q) => applicable(q, company) && answers[q.id] !== undefined).length;
  const modTotal = (m: Module) =>
    m.preguntas.filter((q) => applicable(q, company)).length;

  return (
    <aside className="bg-slate-900 text-white flex flex-col sticky top-0 h-screen w-[248px] min-w-[248px]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-slate-700 to-ink border border-white/[0.14] grid place-items-center flex-none">
          <Shield className="w-5 h-5 text-white" strokeWidth={1.4} />
        </div>
        <div>
          <h1 className="font-[var(--font-heading)] text-base font-semibold leading-tight m-0">SIGINEX</h1>
          <span className="text-[10px] text-[#93A1B5] uppercase tracking-[0.5px]">
            Autodiagnóstico SGI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {/* General */}
        <div className="font-mono text-[10px] tracking-[1.4px] uppercase text-[#6B7A92] px-2.5 pt-3 pb-1.5">
          General
        </div>
        <button
          onClick={() => onNavigate("inicio")}
          className={`flex items-center gap-2.5 w-full border-none text-left px-2.5 py-2 rounded-[9px] text-[13px] ${
            currentView === "inicio"
              ? "bg-slate-700 text-white"
              : "bg-transparent text-[#C6D0DE] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4 text-[#93A1B5]" />
          <span className="flex-1">Inicio</span>
        </button>

        {/* Modules */}
        <div className="font-mono text-[10px] tracking-[1.4px] uppercase text-[#6B7A92] px-2.5 pt-3 pb-1.5">
          Módulos ({modules.length})
        </div>
        {modules.map((m, i) => {
          const total = modTotal(m);
          const done = total > 0 && modAnswered(m) === total;
          return (
            <button
              key={m.id}
              onClick={() => onNavigate(m.id)}
              className={`flex items-center gap-2.5 w-full border-none text-left px-2.5 py-2 rounded-[9px] text-[13px] ${
                currentView === m.id
                  ? "bg-slate-700 text-white"
                  : "bg-transparent text-[#C6D0DE] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span
                className={`w-[22px] h-[22px] flex-none rounded-[7px] border-[1.5px] grid place-items-center font-mono text-[10px] ${
                  done
                    ? "bg-good border-good text-white"
                    : "border-white/[0.18] text-[#93A1B5]"
                }`}
              >
                {done ? <CheckCircle className="w-3 h-3" /> : i + 1}
              </span>
              <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
                {m.short}
              </span>
              <span className="font-mono text-[10px] text-[#6B7A92]">
                {modAnswered(m)}/{total}
              </span>
            </button>
          );
        })}

        {/* Benchmark */}
        <div className="font-mono text-[10px] tracking-[1.4px] uppercase text-[#6B7A92] px-2.5 pt-3 pb-1.5">
          Mercado
        </div>
        <button
          onClick={() => onNavigate("benchmark")}
          className={`flex items-center gap-2.5 w-full border-none text-left px-2.5 py-2 rounded-[9px] text-[13px] ${
            currentView === "benchmark"
              ? "bg-slate-700 text-white"
              : "bg-transparent text-[#C6D0DE] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-gold" />
          <span className="flex-1">Benchmark</span>
        </button>

        {/* Results */}
        <div className="font-mono text-[10px] tracking-[1.4px] uppercase text-[#6B7A92] px-2.5 pt-3 pb-1.5">
          Resultados
        </div>
        <button
          onClick={() => onNavigate("resultados")}
          className={`flex items-center gap-2.5 w-full border-none text-left px-2.5 py-2 rounded-[9px] text-[13px] ${
            currentView === "resultados"
              ? "bg-slate-700 text-white"
              : "bg-transparent text-[#C6D0DE] hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <span className="w-[22px] h-[22px] flex-none rounded-[7px] border-[1.5px] border-gold text-gold grid place-items-center font-mono text-[10px]">
            ◉
          </span>
          <span className="flex-1">Diagnóstico</span>
        </button>
      </nav>

      {/* Footer disclaimer */}
      <div className="px-4 py-3.5 border-t border-white/[0.08] text-[10px] text-[#6B7A92] leading-[1.5]">
        Resultado orientativo. No sustituye una auditoría formal ni un concepto legal.
      </div>
    </aside>
  );
}
