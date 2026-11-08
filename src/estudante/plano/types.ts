export interface AssuntoRecomendado {
  assuntoId: string;
  nome: string;
  disciplina: string;
  /** Texto gerado pela IA explicando por que estudar este assunto (ex.: "3 erros nas últimas 2 listas") */
  motivo: string;
  /** Questões erradas (em branco conta como errada) que sustentam a recomendação */
  erros: number;
  /** Em quantas listas esses erros aconteceram */
  listas: number;
  revisado: boolean;
  /** ISO 8601 */
  revisadoEm: string | null;
}

export interface PlanoRevisao {
  /** ISO 8601 de quando a IA gerou a recomendação */
  geradoEm: string;
  /** Do mais prioritário ao menos prioritário (a ordem vem do back-end) */
  assuntos: AssuntoRecomendado[];
}
