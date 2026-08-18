import type { KnowledgeBase, Question } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "demo-key";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "default";

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = API_BASE ? `${API_BASE}${endpoint}` : `/api${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
      "X-Tenant-Id": TENANT_ID,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getKnowledgeBase(): Promise<KnowledgeBase> {
  const raw = await fetchApi<Record<string, unknown>>("/kb");
  
  // Map the API response to our internal types
  const modulos = (raw.modulos as Record<string, unknown>[]).map((m: Record<string, unknown>) => ({
    id: m.id as string,
    name: (m.nombre || m.name || m.id) as string,
    short: (m.short || m.nombre || m.id) as string,
    weight: (m.weight || 0.1) as number,
    norms: (m.norms || []) as string[],
    escala: (m.escala || "general") as string,
    preguntas: (m.preguntas || []) as Question[],
  }));

  return {
    meta: {
      name: (raw.meta as Record<string, unknown>)?.name as string || "SIGINEX",
      version: (raw.kb_version || (raw.meta as Record<string, unknown>)?.version || "3.0") as string,
      total_preguntas: (raw.total_preguntas || modulos.reduce((n, m) => n + m.preguntas.length, 0)) as number,
      descargo: (raw.meta as Record<string, unknown>)?.descargo as string || "Resultado orientativo.",
    },
    modulos,
  };
}

export async function getKbVersion() {
  return fetchApi<{ kb_version: string; total_preguntas: number }>("/kb/version");
}

export async function calculateDiagnostic(
  diagnosticoId: string,
  company: Record<string, unknown>,
  answers: Record<string, unknown>
) {
  return fetchApi(`/diagnosticos/${diagnosticoId}/calcular`, {
    method: "POST",
    body: JSON.stringify({ company, answers }),
  });
}

export async function getMarketSignals(filters?: {
  impacto?: string;
  desde?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.impacto) params.set("impacto", filters.impacto);
  if (filters?.desde) params.set("desde", filters.desde);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchApi(`/market-signals${query}`);
}
