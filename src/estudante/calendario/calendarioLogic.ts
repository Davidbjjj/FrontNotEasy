import type { ProximaLista } from '../dashboard/types';

export const calendarioPath = '/calendario';
/** Abre a lista para responder (mesmo destino usado no painel do aluno). */
export const listaPath = (listaId: string) => `/listas/${listaId}/questoes`;

export type Visao = 'mes' | 'semana';

/**
 * Cores distintas entre si e com contraste suficiente sobre fundo claro.
 * A cor nunca é a única pista: o nome da disciplina sempre aparece em texto.
 */
export const PALETA = ['#1d4ed8', '#b45309', '#047857', '#be185d', '#6d28d9', '#0e7490', '#b91c1c', '#4d7c0f'];

export const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** Chave de dia no fuso local: "2026-11-08". */
export function chaveDia(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const addDias = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const inicioSemana = (d: Date): Date => addDias(d, -d.getDay());
export const inicioMes = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);
export const addMeses = (d: Date, n: number): Date => new Date(d.getFullYear(), d.getMonth() + n, 1);
export const mesmoDia = (a: Date, b: Date) => chaveDia(a) === chaveDia(b);

/** Cor por disciplina, estável para o mesmo conjunto de disciplinas (ordem alfabética). */
export function corPorDisciplina(listas: Pick<ProximaLista, 'disciplina'>[]): Map<string, string> {
  const nomes = Array.from(new Set(listas.map((l) => l.disciplina))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return new Map(nomes.map((n, i) => [n, PALETA[i % PALETA.length]]));
}

export interface ListaNoCalendario extends ProximaLista {
  data: Date;
}

/** Separa listas com prazo válido (por dia, em ordem de horário) das sem prazo. */
export function agruparPorDia(listas: ProximaLista[]): {
  porDia: Map<string, ListaNoCalendario[]>;
  semPrazo: ProximaLista[];
} {
  const porDia = new Map<string, ListaNoCalendario[]>();
  const semPrazo: ProximaLista[] = [];
  for (const l of listas) {
    const data = l.prazo ? new Date(l.prazo) : null;
    if (!data || Number.isNaN(data.getTime())) {
      semPrazo.push(l);
      continue;
    }
    const k = chaveDia(data);
    porDia.set(k, [...(porDia.get(k) ?? []), { ...l, data }]);
  }
  porDia.forEach((arr) => arr.sort((a, b) => a.data.getTime() - b.data.getTime()));
  return { porDia, semPrazo };
}

/** 7 dias (domingo a sábado) da semana que contém `ref`. */
export const diasDaSemana = (ref: Date): Date[] => {
  const ini = inicioSemana(ref);
  return Array.from({ length: 7 }, (_, i) => addDias(ini, i));
};

/** Semanas completas que cobrem o mês de `ref`. */
export function semanasDoMes(ref: Date): Date[][] {
  const ini = inicioSemana(inicioMes(ref));
  const fim = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  const semanas: Date[][] = [];
  for (let s = ini; s <= fim; s = addDias(s, 7)) semanas.push(diasDaSemana(s));
  return semanas;
}

export const tituloMes = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

export function tituloSemana(ref: Date): string {
  const a = inicioSemana(ref);
  const b = addDias(a, 6);
  const f = (d: Date, ano: boolean) =>
    d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', ...(ano ? { year: 'numeric' } : {}) });
  return `${f(a, false)} a ${f(b, true)}`;
}

export const rotuloDia = (d: Date) => d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
export const horaPrazo = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const contarListas = (n: number) => `${n} ${n === 1 ? 'lista' : 'listas'}`;
