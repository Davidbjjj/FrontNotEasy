import type { AssuntoRecomendado } from './types';

export const planoPath = '/plano-revisao';

/** Pendentes primeiro (mantendo a prioridade da IA); revisados vão para o fim. */
export function ordenarPlano(assuntos: AssuntoRecomendado[]): AssuntoRecomendado[] {
  return [
    ...assuntos.filter((a) => !a.revisado),
    ...assuntos.filter((a) => a.revisado),
  ];
}

export const contarPendentes = (assuntos: AssuntoRecomendado[]): number =>
  assuntos.filter((a) => !a.revisado).length;

export function resumoPlano(assuntos: AssuntoRecomendado[]): string {
  if (assuntos.length === 0) return 'Nenhum assunto recomendado.';
  const pend = contarPendentes(assuntos);
  const rev = assuntos.length - pend;
  if (pend === 0) return `Você revisou todos os ${assuntos.length} assuntos recomendados.`;
  const base = `${pend} ${pend === 1 ? 'assunto para revisar' : 'assuntos para revisar'}`;
  return rev ? `${base}, ${rev} já ${rev === 1 ? 'revisado' : 'revisados'}.` : `${base}.`;
}

export const formatGeradoEm = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
};

export const descricaoErros = (a: AssuntoRecomendado): string =>
  `${a.erros} ${a.erros === 1 ? 'questão errada' : 'questões erradas'} em ${a.listas} ${a.listas === 1 ? 'lista' : 'listas'}`;
