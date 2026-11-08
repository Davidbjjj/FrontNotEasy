export type TipoDuvida = 'DUVIDA' | 'CONTESTACAO';
/** ENVIADA: aguardando professor · RESPONDIDA: dúvida respondida · ACEITA/RECUSADA: decisão sobre contestação */
export type StatusDuvida = 'ENVIADA' | 'RESPONDIDA' | 'ACEITA' | 'RECUSADA';

export interface Duvida {
  id: string;
  listaId: string;
  questaoId: string;
  tipo: TipoDuvida;
  texto: string;
  anexoNome: string | null;
  status: StatusDuvida;
  criadaEm: string;
  resposta: string | null;
  respondidaEm: string | null;
}

export interface NovaDuvida {
  listaId: string;
  questaoId: string;
  tipo: TipoDuvida;
  texto: string;
  anexo: File | null;
}
