"use client";

import type { Module, Answers, CompanyProfile } from "@/types";
import { applicable } from "@/lib/scoring";

interface LearningPlanProps {
  modules: Module[];
  answers: Answers;
  company: CompanyProfile;
}

interface Route {
  competencia: string;
  modulo: string;
  brechas: number;
  prioridad: number;
  nivel: string;
}

const ADOPT: Record<string, [string, string[]][]> = {
  sst: [["Fundamentos del SG-SST", []], ["Identificación de peligros y valoración de riesgos (IPER)", ["peligro", "iper", "riesgo"]], ["Investigación de incidentes e indicadores de SST", ["incidente", "accidente", "indicador"]]],
  ambiental: [["Gestión ambiental ISO 14001", []], ["Cumplimiento legal ambiental y permisos", ["permiso", "licencia", "legal", "631", "vertimiento"]], ["Gestión de residuos y uso eficiente de recursos", ["residuo", "respel", "agua", "energía"]]],
  calidad: [["Sistema de gestión de calidad ISO 9001", []], ["Enfoque a procesos e indicadores", ["proceso", "indicador", "satisfacción"]], ["Auditoría interna y mejora continua", ["auditoría", "no conformidad", "mejora", "revisión"]]],
  riesgos: [["Gestión de riesgos ISO 31000", []], ["Continuidad del negocio ISO 22301", ["continuidad", "22301", "bia"]], ["Prevención LA/FT (SAGRLAFT/SARLAFT)", ["saglaft", "sarlaft", "la/ft", "lavado", "supersociedades"]]],
  cumplimiento: [["Cumplimiento legal y matriz de requisitos", []], ["Programa de Transparencia y Ética (PTEE)", ["ptee", "transparencia", "2195"]], ["Anticorrupción y debida diligencia", ["anticorrup", "1474", "debida diligencia"]]],
  datos: [["Protección de datos personales (Ley 1581)", ["1581", "dato", "rnbd", "titular", "autoriz"]], ["Seguridad de la información ISO 27001", ["27001", "seguridad", "control", "acceso"]], ["Gestión de incidentes de seguridad", ["incidente"]]],
  gobierno: [["Gobierno corporativo y ética", []], ["Antisoborno ISO 37001", ["soborno", "37001", "regalo", "conflicto"]], ["Control interno y rendición de cuentas", ["control interno", "coso", "transparencia", "rendición", "1712"]]],
  esg: [["Fundamentos de sostenibilidad y ESG", []], ["Reporte de sostenibilidad (NIIF S1/S2, GRI)", ["reporte", "divulga", "niif", "gri", "emisor", "031"]], ["Gestión de riesgos ASG y clima", ["riesgo", "clima", "emisi", "material", "escenario"]]],
  gobernanza_ia: [["Fundamentos de gobernanza de IA (ISO 42001)", []], ["Evaluación de impacto y riesgos de IA", ["impacto", "aia", "riesgo", "ciclo"]], ["Datos, sesgos y transparencia en IA", ["dato", "sesgo", "transparen", "explica", "supervis", "seguridad"]]],
};

function rutaFor(moduleId: string, q: { requisito: string; pregunta: string; norma: string }): string | null {
  const cat = ADOPT[moduleId];
  if (!cat) return null;
  const s = `${q.requisito} ${q.pregunta} ${q.norma}`.toLowerCase();
  let route = cat[0][0];
  for (const [comp, triggers] of cat) {
    if (triggers.length && triggers.some((t) => s.includes(t))) {
      route = comp;
      break;
    }
  }
  return route;
}

export default function LearningPlan({ modules, answers, company }: LearningPlanProps) {
  const routeMap: Record<string, Route> = {};

  for (const m of modules) {
    for (const q of m.preguntas) {
      const v = answers[q.id];
      if ((v === 0 || v === 1) && applicable(q, company)) {
        const comp = rutaFor(m.id, q);
        if (comp) {
          if (!routeMap[comp]) {
            routeMap[comp] = { competencia: comp, modulo: m.short, brechas: 0, prioridad: 1, nivel: "Intermedio" };
          }
          routeMap[comp].brechas++;
          if (v === 0) {
            routeMap[comp].prioridad = 0;
            routeMap[comp].nivel = "Básico";
          }
        }
      }
    }
  }

  const rutas = Object.values(routeMap).sort((a, b) => a.prioridad - b.prioridad || b.brechas - a.brechas);

  return (
    <div className="bg-card border border-line rounded-[14px] p-5 shadow-sm mb-5">
      <h3 className="font-[var(--font-heading)] text-[15px] font-semibold m-0 mb-1">Plan de aprendizaje</h3>
      <p className="text-xs text-muted mb-4">Rutas derivadas del diagnóstico para cerrar cada brecha (origen interno).</p>

      {rutas.length === 0 ? (
        <div className="text-[13px] text-muted">Complete el cuestionario para generar el plan de aprendizaje.</div>
      ) : (
        <div className="space-y-0">
          {rutas.map((r, i) => {
            const color = r.prioridad === 0 ? "#C0433A" : "#D8862B";
            return (
              <div key={i} className="flex gap-3 py-2.5 border-b border-line-soft last:border-b-0 items-start">
                <div className="w-[9px] h-[9px] rounded-full mt-1.5 flex-none" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{r.competencia}</div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">
                    {r.nivel} · aborda {r.brechas} {r.brechas === 1 ? "brecha" : "brechas"} de {r.modulo}
                  </div>
                </div>
                <span className="font-mono text-[10.5px] text-slate-700 bg-line-soft border border-line rounded-[6px] px-2 py-0.5 whitespace-nowrap">
                  interno
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
