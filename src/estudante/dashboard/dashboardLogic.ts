import type { ProximaLista } from './types';

const HOUR = 3_600_000;
export const URGENT_WINDOW_HOURS = 48;

export type DeadlineStatus = 'atrasada' | 'urgente' | 'normal' | 'sem-prazo';

export function deadlineStatus(prazo: string | null, now: Date = new Date()): DeadlineStatus {
  if (!prazo) return 'sem-prazo';
  const t = new Date(prazo).getTime();
  if (Number.isNaN(t)) return 'sem-prazo';
  const diff = t - now.getTime();
  if (diff < 0) return 'atrasada';
  return diff <= URGENT_WINDOW_HOURS * HOUR ? 'urgente' : 'normal';
}

/** Mais próximas primeiro; sem prazo (ou prazo inválido) no fim. Não altera o array recebido. */
export function sortByDeadline(listas: ProximaLista[]): ProximaLista[] {
  const key = (l: ProximaLista) => {
    const t = l.prazo ? new Date(l.prazo).getTime() : NaN;
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
  };
  return [...listas].sort((a, b) => key(a) - key(b));
}

/** Texto curto e legível: "Vence em 5 h", "Vence amanhã", "Venceu há 2 dias"... */
export function describeDeadline(prazo: string | null, now: Date = new Date()): string {
  const status = deadlineStatus(prazo, now);
  if (status === 'sem-prazo') return 'Sem prazo';
  const diff = new Date(prazo as string).getTime() - now.getTime();
  const abs = Math.abs(diff);
  const hours = Math.round(abs / HOUR);
  const days = Math.round(abs / (24 * HOUR));
  if (diff < 0) {
    if (hours < 1) return 'Venceu agora há pouco';
    return hours < 24 ? `Venceu há ${hours} h` : `Venceu há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }
  if (hours < 1) return 'Vence em menos de 1 h';
  if (hours < 24) return `Vence em ${hours} h`;
  if (days === 1) return 'Vence amanhã';
  return `Vence em ${days} dias`;
}

export function formatNota(nota: number, max: number): string {
  const f = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return `${f(nota)} / ${f(max)}`;
}
