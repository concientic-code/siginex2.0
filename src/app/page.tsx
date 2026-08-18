"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ResultsView from "@/components/results/ResultsView";
import type { KnowledgeBase, CompanyProfile, Answers, ViewId } from "@/types";
import { computeResults } from "@/lib/scoring";
import { getKnowledgeBase } from "@/lib/api";

export default function DiagnosticoPage() {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState<CompanyProfile>({
    nombre: "",
    sector: "",
    tamano: "",
    permAmbiental: false,
    saglaft: false,
    ptee: false,
    rnbd: false,
  });

  const [answers, setAnswers] = useState<Answers>({});
  const [view, setView] = useState<ViewId>("inicio");

  // Fetch KB from API
  useEffect(() => {
    getKnowledgeBase()
      .then((data) => {
        setKb(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-screen grid place-items-center bg-canvas">
        <div className="text-center">
          <div className="font-mono text-sm text-muted mb-2">Cargando base de conocimiento...</div>
          <div className="w-32 h-1 bg-line rounded overflow-hidden mx-auto">
            <div className="h-full bg-gold rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !kb) {
    return (
      <div className="h-screen grid place-items-center bg-canvas">
        <div className="text-center max-w-md px-6">
          <div className="text-danger font-semibold mb-2">Error al cargar</div>
          <div className="text-sm text-muted">{error || "No se pudo cargar la base de conocimiento."}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const modules = kb.modulos;
  const results = computeResults(modules, answers, company);
  const progress = results.applicableTotal
    ? Math.round((results.answeredTotal / results.applicableTotal) * 100)
    : 0;

  const activeModule = modules.find((m) => m.id === view);
  const moduleIndex = modules.findIndex((m) => m.id === view);

  const crumb =
    view === "inicio"
      ? "Configuración"
      : view === "resultados"
      ? "Informe"
      : view === "benchmark"
      ? "Skill · Benchmark_SGI_Tools"
      : `Módulo ${moduleIndex + 1} de ${modules.length}`;

  const title =
    view === "inicio"
      ? "Datos de la organización"
      : view === "resultados"
      ? "Diagnóstico del SGI"
      : view === "benchmark"
      ? "Benchmark vs. mercado"
      : activeModule
      ? activeModule.name
      : "";

  return (
    <div className="grid grid-cols-[248px_1fr] min-h-screen">
      <Sidebar
        modules={modules}
        currentView={view}
        onNavigate={setView}
        answers={answers}
        company={company}
      />
      <div className="flex flex-col min-w-0">
        <Topbar
          crumb={crumb}
          title={title}
          progress={progress}
          onGenerateDiagnostic={() => setView("resultados")}
        />
        <main className="p-6 max-w-[1080px] w-full mx-auto">
          {view === "inicio" && (
            <div>
              <div className="font-mono text-[11px] tracking-[2px] uppercase text-gold mb-2.5">
                Evaluación integral · Colombia · {kb.meta.total_preguntas} preguntas
              </div>
              <h2 className="font-[var(--font-heading)] text-[26px] font-semibold m-0 mb-2.5">
                Autodiagnóstico del Sistema de Gestión Integral
              </h2>
              <p className="text-sm text-muted max-w-[66ch] mb-6">
                Evalúe cada ítem en escala 0-1-2 (No cumple · Parcial · Cumple). SIGINEX calcula
                el nivel de cumplimiento, la madurez organizacional (5 niveles), el score global,
                las brechas y el plan de mejora.
              </p>

              {/* Company setup cards */}
              <div className="grid grid-cols-2 gap-5">
                {/* Identification */}
                <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm">
                  <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Identificación</h3>
                  <p className="text-xs text-muted mb-4">Personaliza el informe exportable.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11.5px] font-semibold text-muted mb-1">Nombre de la empresa</label>
                      <input
                        value={company.nombre}
                        onChange={(e) => setCompany({ ...company, nombre: e.target.value })}
                        placeholder="Ej. Manufacturas del Valle S.A.S."
                        className="w-full px-3 py-2.5 border border-line rounded-[9px] text-sm bg-white text-ink focus:outline-2 focus:outline-slate-700 focus:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-muted mb-1">Sector económico</label>
                      <select
                        value={company.sector}
                        onChange={(e) => setCompany({ ...company, sector: e.target.value })}
                        className="w-full px-3 py-2.5 border border-line rounded-[9px] text-sm bg-white text-ink focus:outline-2 focus:outline-slate-700"
                      >
                        <option value="">Seleccione…</option>
                        {["Manufactura / Industria", "Construcción", "Transporte y logística", "Salud", "Servicios financieros", "Comercio / Retail", "Tecnología / Software", "Agroindustria", "Servicios profesionales", "Sector público", "Otro"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-muted mb-1">Tamaño</label>
                      <select
                        value={company.tamano}
                        onChange={(e) => setCompany({ ...company, tamano: e.target.value })}
                        className="w-full px-3 py-2.5 border border-line rounded-[9px] text-sm bg-white text-ink focus:outline-2 focus:outline-slate-700"
                      >
                        <option value="">Seleccione…</option>
                        {["Microempresa (1–10)", "Pequeña (11–50)", "Mediana (51–200)", "Grande (más de 200)"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Applicability */}
                <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm">
                  <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Aplicabilidad</h3>
                  <p className="text-xs text-muted mb-4">Marque lo que aplica para afinar el diagnóstico.</p>
                  <div className="space-y-2.5">
                    {[
                      { k: "permAmbiental" as const, t: "Genera vertimientos o requiere permisos ambientales", s: "Activa la evaluación de la Resolución 631/2015" },
                      { k: "saglaft" as const, t: "Sujeto a SAGRLAFT / SARLAFT", s: "Vigilada por Supersociedades o sector financiero" },
                      { k: "ptee" as const, t: "Sujeto obligado a PTEE", s: "Programa de Transparencia y Ética Empresarial (Ley 2195/2022)" },
                      { k: "rnbd" as const, t: "Debe registrar bases de datos (RNBD)", s: "Registro Nacional de Bases de Datos ante la SIC" },
                    ].map((tg) => (
                      <div key={tg.k} className="flex items-center justify-between gap-3 px-3.5 py-2.5 border border-line rounded-[10px]">
                        <div>
                          <div className="text-[13px] font-medium text-ink">{tg.t}</div>
                          <small className="text-muted text-[11.5px]">{tg.s}</small>
                        </div>
                        <button
                          onClick={() => setCompany({ ...company, [tg.k]: !company[tg.k] })}
                          className={`relative w-10 h-[22px] rounded-xl border-none flex-none transition-colors ${
                            company[tg.k] ? "bg-good" : "bg-[#CBD5E1]"
                          }`}
                          aria-label={tg.t}
                        >
                          <span
                            className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                              company[tg.k] ? "translate-x-[18px]" : ""
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start button */}
              <div className="mt-5">
                <button
                  onClick={() => setView(modules[0].id)}
                  className="font-[var(--font-heading)] font-semibold text-[13.5px] rounded-[9px] px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 border-none"
                >
                  Comenzar diagnóstico →
                </button>
              </div>
            </div>
          )}

          {activeModule && (
            <div>
              {/* Module norms */}
              <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-4">
                <div className="flex flex-wrap gap-1.5">
                  {activeModule.norms.map((n) => (
                    <span key={n} className="font-mono text-[10.5px] text-slate-700 bg-line-soft border border-line rounded-[6px] px-2 py-0.5">
                      {n}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-muted mt-2.5">
                  {activeModule.preguntas.filter((q) => {
                    const s = `${q.norma} ${q.articulo} ${q.requisito} ${q.pregunta}`.toLowerCase();
                    if (!company.permAmbiental && (s.includes("631") || s.includes("vertimiento"))) return false;
                    if (!company.saglaft && (s.includes("saglaft") || s.includes("sarlaft") || s.includes("supersociedades") || s.includes("la/ft") || s.includes("lavado"))) return false;
                    if (!company.ptee && s.includes("ptee")) return false;
                    if (!company.rnbd && s.includes("rnbd")) return false;
                    return true;
                  }).length}{" "}
                  preguntas aplicables · escala 0-1-2
                </div>
              </div>

              {/* Questions */}
              <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm">
                {activeModule.preguntas
                  .filter((q) => {
                    const s = `${q.norma} ${q.articulo} ${q.requisito} ${q.pregunta}`.toLowerCase();
                    if (!company.permAmbiental && (s.includes("631") || s.includes("vertimiento"))) return false;
                    if (!company.saglaft && (s.includes("saglaft") || s.includes("sarlaft") || s.includes("supersociedades") || s.includes("la/ft") || s.includes("lavado"))) return false;
                    if (!company.ptee && s.includes("ptee")) return false;
                    if (!company.rnbd && s.includes("rnbd")) return false;
                    return true;
                  })
                  .map((q, idx) => {
                    const v = answers[q.id];
                    return (
                      <div key={q.id} className="py-4 border-b border-line-soft last:border-b-0">
                        <div className="flex gap-3 mb-3">
                          <div className="font-mono text-xs text-muted font-semibold flex-none pt-0.5">
                            {String(idx + 1).padStart(2, "0")}
                          </div>
                          <div>
                            <div className="text-[14.5px] font-medium leading-[1.45]">{q.pregunta}</div>
                            <div className="text-[11.5px] text-muted mt-0.5 font-mono">{q.norma} · {q.articulo}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap pl-7">
                          {[
                            { val: 0 as const, label: "0 · No cumple", color: "danger" },
                            { val: 1 as const, label: "1 · Parcial", color: "warning" },
                            { val: 2 as const, label: "2 · Cumple", color: "good" },
                            { val: "na" as const, label: "N/A", color: "muted" },
                          ].map((opt) => (
                            <button
                              key={String(opt.val)}
                              onClick={() => setAnswers({ ...answers, [q.id]: opt.val })}
                              className={`border-[1.5px] rounded-[9px] text-[12.5px] font-semibold px-3.5 py-2 transition-colors ${
                                v === opt.val
                                  ? `bg-${opt.color} border-${opt.color} text-white`
                                  : "bg-white border-line text-muted hover:border-slate-700 hover:text-slate-800"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                {/* Navigation */}
                <div className="flex justify-between gap-3 mt-5">
                  <button
                    disabled={moduleIndex === 0}
                    onClick={() => setView(modules[moduleIndex - 1].id)}
                    className="font-[var(--font-heading)] font-semibold text-[13.5px] rounded-[9px] px-4 py-2.5 bg-white text-slate-800 border-[1.5px] border-line hover:border-slate-700 disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    ← Anterior
                  </button>
                  {moduleIndex === modules.length - 1 ? (
                    <button
                      onClick={() => setView("resultados")}
                      className="font-[var(--font-heading)] font-semibold text-[13.5px] rounded-[9px] px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-700 border-none"
                    >
                      Ver diagnóstico →
                    </button>
                  ) : (
                    <button
                      onClick={() => setView(modules[moduleIndex + 1].id)}
                      className="font-[var(--font-heading)] font-semibold text-[13.5px] rounded-[9px] px-4 py-2.5 bg-slate-800 text-white hover:bg-slate-700 border-none"
                    >
                      Siguiente →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "resultados" && (
            <ResultsView modules={modules} answers={answers} company={company} />
          )}

          {view === "benchmark" && (
            <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm">
              <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Benchmark vs. mercado</h3>
              <p className="text-xs text-muted">Vista de benchmark en desarrollo — Fase 2.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
