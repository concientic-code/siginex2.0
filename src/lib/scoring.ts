import type { Module, Question, CompanyProfile, Answers, Level, ModuleResult } from "@/types";

export const LEVELS: Level[] = [
  { n: 1, name: "Inicial", min: 0, max: 20, desc: "Procesos ausentes o reactivos; sin documentación ni responsables." },
  { n: 2, name: "Básico", min: 21, max: 40, desc: "Elementos iniciales informales; cumplimiento parcial de lo obligatorio." },
  { n: 3, name: "Gestionado", min: 41, max: 60, desc: "Sistema documentado e implementado bajo PHVA, con medición básica." },
  { n: 4, name: "Optimizado", min: 61, max: 80, desc: "Medición sistemática, integración y mejora continua; listo para certificar." },
  { n: 5, name: "Excelencia", min: 81, max: 100, desc: "SGI integrado a la estrategia, con benchmarking e innovación." },
];

export function levelFor(score: number): Level {
  let result = LEVELS[0];
  for (const l of LEVELS) {
    if (score >= l.min) result = l;
  }
  return result;
}

export function scoreColor(v: number): string {
  if (v < 41) return "#C0433A";
  if (v < 61) return "#D8862B";
  if (v < 76) return "#C08A2E";
  if (v < 91) return "#2F8A66";
  return "#1C6E52";
}

export function applicable(q: Question, profile: CompanyProfile): boolean {
  const s = `${q.norma} ${q.articulo} ${q.requisito} ${q.pregunta}`.toLowerCase();
  if (!profile.permAmbiental && (s.includes("631") || s.includes("vertimiento"))) return false;
  if (!profile.saglaft && (s.includes("saglaft") || s.includes("sarlaft") || s.includes("supersociedades") || s.includes("la/ft") || s.includes("lavado"))) return false;
  if (!profile.ptee && s.includes("ptee")) return false;
  if (!profile.rnbd && s.includes("rnbd")) return false;
  return true;
}

export function computeResults(modules: Module[], answers: Answers, company: CompanyProfile) {
  const perModule: ModuleResult[] = modules.map((m) => {
    const applicableQuestions = m.preguntas.filter((q) => applicable(q, company));
    const answeredQuestions = applicableQuestions.filter((q) => answers[q.id] !== undefined);
    let num = 0;
    let den = 0;

    for (const q of answeredQuestions) {
      const v = answers[q.id];
      if (v === "na" || v === undefined) continue;
      num += (v / 2) * q.peso;
      den += q.peso;
    }

    const compliance = den > 0 ? (num / den) * 100 : null;
    const answered = applicableQuestions.filter((q) => answers[q.id] !== undefined).length;

    return {
      module: m,
      compliance,
      answered,
      total: applicableQuestions.length,
      level: compliance !== null ? levelFor(compliance) : null,
    };
  });

  const evaluated = perModule.filter((x) => x.compliance !== null);
  let weightedSum = 0;
  let weightTotal = 0;

  for (const p of evaluated) {
    weightedSum += (p.compliance || 0) * p.module.weight;
    weightTotal += p.module.weight;
  }

  const globalScore = weightTotal > 0 ? weightedSum / weightTotal : 0;
  const answeredTotal = perModule.reduce((n, x) => n + x.answered, 0);
  const applicableTotal = perModule.reduce((n, x) => n + x.total, 0);

  return {
    perModule,
    globalScore,
    answeredTotal,
    applicableTotal,
  };
}
