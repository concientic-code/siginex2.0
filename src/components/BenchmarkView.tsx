"use client";

import { useState } from "react";
import { scoreColor } from "@/lib/scoring";

const NIVELES = [
  { n: 1, nombre: "Manual", d: "Gestión en papel y hojas de cálculo; sin sistema centralizado." },
  { n: 2, nombre: "Digital básico", d: "Documentos digitales y software puntual por área, sin integración." },
  { n: 3, nombre: "Integrado", d: "Plataforma que integra varios sistemas de gestión (multinorma)." },
  { n: 4, nombre: "Automatizado", d: "Flujos de trabajo, alertas e indicadores automatizados, con analítica." },
  { n: 5, nombre: "Inteligente (IA)", d: "IA para predicción, priorización, generación documental y vigilancia." },
];

const HERRAMIENTAS = [
  { n: "Heinsohn SST", origen: "Colombia", nivel: 3, ia: true, cobertura: "SG-SST + talento humano", target: "Medianas/grandes" },
  { n: "Mejoramiso", origen: "Colombia", nivel: 3, ia: false, cobertura: "SGI multinorma", target: "Empresas con SGI" },
  { n: "ISOTools", origen: "España/LATAM", nivel: 4, ia: false, cobertura: "ISO + GRC/BSC", target: "Medianas/grandes" },
  { n: "SoftExpert", origen: "Brasil/LATAM", nivel: 4, ia: true, cobertura: "EQMS/GRC/EHSM", target: "Medianas/grandes" },
  { n: "Hackmetrix", origen: "Chile/LATAM", nivel: 5, ia: true, cobertura: "Compliance seguridad", target: "Pymes/startups" },
  { n: "Sphera", origen: "Global", nivel: 4, ia: true, cobertura: "EHS, riesgo, sostenibilidad", target: "Grandes industriales" },
  { n: "Enablon", origen: "Global", nivel: 5, ia: true, cobertura: "EHS/ESG/GRC", target: "Multinacionales" },
];

export default function BenchmarkView() {
  const [techLevel, setTechLevel] = useState<number | null>(null);

  const niveles = HERRAMIENTAS.map((h) => h.nivel);
  const avg = niveles.reduce((a, b) => a + b, 0) / niveles.length;
  const mn = Math.min(...niveles);
  const mx = Math.max(...niveles);
  const above = techLevel ? HERRAMIENTAS.filter((h) => h.nivel > techLevel).length : null;

  return (
    <div>
      <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-4">
        <div className="font-mono text-[11px] tracking-[2px] uppercase text-gold mb-2">Skill · Benchmark_SGI_Tools</div>
        <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">
          Benchmark de madurez tecnológica frente al mercado
        </h3>
        <p className="text-xs text-muted">Compare su nivel de gestión del SGI contra herramientas en Colombia y LATAM (5 niveles).</p>
      </div>

      {/* Level picker */}
      <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-4">
        <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">¿Cómo gestiona hoy su SGI?</h3>
        <p className="text-xs text-muted mb-4">Seleccione su nivel tecnológico actual.</p>
        <div className="grid grid-cols-5 gap-2.5">
          {NIVELES.map((l) => (
            <button
              key={l.n}
              onClick={() => setTechLevel(l.n)}
              className={`border-[1.5px] rounded-[10px] p-3 text-left flex flex-col gap-1 transition-colors ${
                techLevel === l.n
                  ? "border-gold bg-[#FFF7E6]"
                  : "border-line bg-white hover:border-slate-700"
              }`}
            >
              <b className="font-[var(--font-heading)] text-[13px]">{l.n} · {l.nombre}</b>
              <span className="text-[11px] text-muted leading-[1.35]">{l.d}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scoring */}
      {techLevel && (
        <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-4">
          <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Scoring competitivo</h3>
          <p className="text-xs text-muted mb-4">Su posición frente a las {HERRAMIENTAS.length} herramientas analizadas.</p>
          <div className="grid grid-cols-4 gap-4 mb-3">
            <div className="bg-card border border-line rounded-[14px] p-3 shadow-sm">
              <div className="text-[11px] text-muted uppercase font-semibold">Su nivel</div>
              <div className="font-[var(--font-heading)] text-2xl font-bold mt-1" style={{ color: scoreColor((techLevel / 5) * 100) }}>{techLevel}</div>
              <div className="text-[11px] text-muted">de 5</div>
            </div>
            <div className="bg-card border border-line rounded-[14px] p-3 shadow-sm">
              <div className="text-[11px] text-muted uppercase font-semibold">Promedio mercado</div>
              <div className="font-[var(--font-heading)] text-2xl font-bold mt-1">{avg.toFixed(1)}</div>
              <div className="text-[11px] text-muted">rango {mn}–{mx}</div>
            </div>
            <div className="bg-card border border-line rounded-[14px] p-3 shadow-sm">
              <div className="text-[11px] text-muted uppercase font-semibold">Por encima suyo</div>
              <div className="font-[var(--font-heading)] text-2xl font-bold mt-1">{above}</div>
              <div className="text-[11px] text-muted">herramientas</div>
            </div>
            <div className="bg-card border border-line rounded-[14px] p-3 shadow-sm">
              <div className="text-[11px] text-muted uppercase font-semibold">Brecha al líder</div>
              <div className="font-[var(--font-heading)] text-2xl font-bold mt-1">{mx - techLevel}</div>
              <div className="text-[11px] text-muted">niveles</div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-4">
        <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Matriz comparativa</h3>
        <p className="text-xs text-muted mb-4">Herramientas SGI/HSEQ/ESG en Colombia y LATAM.</p>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="text-left text-[11px] uppercase text-muted font-semibold px-2.5 py-2 border-b border-line">Herramienta</th>
              <th className="text-left text-[11px] uppercase text-muted font-semibold px-2.5 py-2 border-b border-line">Origen</th>
              <th className="text-left text-[11px] uppercase text-muted font-semibold px-2.5 py-2 border-b border-line">Nivel</th>
              <th className="text-left text-[11px] uppercase text-muted font-semibold px-2.5 py-2 border-b border-line">IA</th>
              <th className="text-left text-[11px] uppercase text-muted font-semibold px-2.5 py-2 border-b border-line">Cobertura</th>
              <th className="text-left text-[11px] uppercase text-muted font-semibold px-2.5 py-2 border-b border-line">Target</th>
            </tr>
          </thead>
          <tbody>
            {[...HERRAMIENTAS].sort((a, b) => b.nivel - a.nivel).map((h) => {
              const c = scoreColor((h.nivel / 5) * 100);
              return (
                <tr key={h.n} style={techLevel && h.nivel === techLevel ? { background: "#FFF7E6" } : {}}>
                  <td className="px-2.5 py-2.5 border-b border-line-soft font-semibold">{h.n}</td>
                  <td className="px-2.5 py-2.5 border-b border-line-soft">{h.origen}</td>
                  <td className="px-2.5 py-2.5 border-b border-line-soft">
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[6px]" style={{ background: `${c}20`, color: c }}>
                      {h.nivel} · {NIVELES[h.nivel - 1].nombre}
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-line-soft">{h.ia ? "Sí" : "—"}</td>
                  <td className="px-2.5 py-2.5 border-b border-line-soft">{h.cobertura}</td>
                  <td className="px-2.5 py-2.5 border-b border-line-soft">{h.target}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
