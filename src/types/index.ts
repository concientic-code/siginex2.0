export interface CompanyProfile {
  nombre: string;
  sector: string;
  tamano: string;
  permAmbiental: boolean;
  saglaft: boolean;
  ptee: boolean;
  rnbd: boolean;
}

export interface Question {
  id: string;
  pregunta: string;
  norma: string;
  articulo: string;
  requisito: string;
  criterio: string;
  evaluacion: Record<string, string>;
  recomendacion: Record<string, string>;
  peso: number;
}

export interface Module {
  id: string;
  name: string;
  short: string;
  weight: number;
  norms: string[];
  escala: string;
  preguntas: Question[];
}

export interface KnowledgeBase {
  meta: {
    name: string;
    version: string;
    total_preguntas: number;
    descargo: string;
  };
  modulos: Module[];
}

export interface ModuleResult {
  module: Module;
  compliance: number | null;
  answered: number;
  total: number;
  level: Level | null;
}

export interface Level {
  n: number;
  name: string;
  min: number;
  max: number;
  desc: string;
}

export type AnswerValue = 0 | 1 | 2 | "na";
export type Answers = Record<string, AnswerValue | undefined>;

export type ViewId = "inicio" | "benchmark" | "resultados" | string;
