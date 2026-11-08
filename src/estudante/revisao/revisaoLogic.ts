import type { QuestaoRevisao, RegraGabarito } from './types';
import { erradasPath } from '../evolucao/evolucaoLogic';

export const letra = (indice: number) => String.fromCharCode(65 + indice);

/** Objetiva errada ou em branco. Aberta não entra: não há certo/errado binário. */
export function errou(q: QuestaoRevisao): boolean {
  return q.tipo === 'OBJETIVA' && q.minhaResposta !== q.respostaCerta;
}

export function filtrarQuestoes(questoes: QuestaoRevisao[], soErradas: boolean): QuestaoRevisao[] {
  return soErradas ? questoes.filter(errou) : questoes;
}

export function contarErradas(questoes: QuestaoRevisao[]): number {
  return questoes.filter(errou).length;
}

export function mensagemBloqueio(regra: RegraGabarito, liberadoEm: string | null): string {
  if (regra === 'APOS_PRAZO') {
    const quando = liberadoEm
      ? new Date(liberadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
      : null;
    return quando
      ? `O gabarito será liberado depois do prazo da atividade (${quando}).`
      : 'O gabarito será liberado depois do prazo da atividade.';
  }
  return 'O gabarito ainda não está disponível. Finalize a lista para ver onde você errou.';
}

/** FE-105: o assunto leva às questões erradas dele. */
export const evolucaoPath = (assuntoId: string): string | null => erradasPath(assuntoId);
