/**
 * Guarda no aparelho o progresso do aluno em uma lista (FE-104):
 *  - pending: respostas escolhidas mas ainda não confirmadas pelo servidor (offline / falha de rede)
 *  - drafts:  alternativa marcada mas ainda não enviada
 * Tudo é opcional: se o storage estiver indisponível o fluxo online continua funcionando.
 */
export interface AttemptState {
  pending: Record<string, string>;
  drafts: Record<string, string>;
}

const key = (estudanteId: string, listaId: string) => `attempt:v1:${estudanteId || 'anon'}:${listaId}`;

export const emptyAttempt = (): AttemptState => ({ pending: {}, drafts: {} });

const isRecord = (v: unknown): v is Record<string, string> =>
  !!v && typeof v === 'object' && Object.values(v as object).every((x) => typeof x === 'string');

export function loadAttempt(estudanteId: string, listaId: string): AttemptState {
  try {
    const raw = localStorage.getItem(key(estudanteId, listaId));
    if (!raw) return emptyAttempt();
    const p = JSON.parse(raw);
    return { pending: isRecord(p?.pending) ? p.pending : {}, drafts: isRecord(p?.drafts) ? p.drafts : {} };
  } catch {
    return emptyAttempt();
  }
}

export function saveAttempt(estudanteId: string, listaId: string, state: AttemptState): void {
  try {
    const k = key(estudanteId, listaId);
    if (!Object.keys(state.pending).length && !Object.keys(state.drafts).length) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(state));
  } catch {
    /* storage cheio/bloqueado: segue sem cópia local */
  }
}

/** Texto curto para o indicador "salvo há X". */
export function formatSavedAgo(seconds: number): string {
  if (seconds < 5) return 'agora mesmo';
  if (seconds < 60) return `há ${seconds} s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `há ${m} min`;
  return `há ${Math.floor(m / 60)} h`;
}

/** Posição da última questão respondida (ou 0 se nenhuma). */
export function lastAnsweredIndex(questionIds: string[], answered: Set<string>): number {
  for (let i = questionIds.length - 1; i >= 0; i--) if (answered.has(questionIds[i])) return i;
  return 0;
}
