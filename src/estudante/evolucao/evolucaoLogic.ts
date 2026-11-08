import type { DesempenhoAssunto, NotaPonto } from './types';

export const NOTA_ESCALA = 10;

export const evolucaoPath = '/evolucao';
export const erradasPath = (assuntoId: string) => `/evolucao/assuntos/${encodeURIComponent(assuntoId)}`;

const fmt = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Notas de listas com máximos diferentes ficam comparáveis na escala 0–10. */
export function notaNormalizada(p: NotaPonto): number {
  return p.notaMaxima > 0 ? Math.round((p.nota / p.notaMaxima) * NOTA_ESCALA * 10) / 10 : 0;
}

/** Mais antigas primeiro (eixo do tempo); datas inválidas vão para o fim. Filtro vazio = todas. */
export function filtrarNotas(notas: NotaPonto[], disciplinaId: string): NotaPonto[] {
  const key = (p: NotaPonto) => {
    const t = new Date(p.data).getTime();
    return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
  };
  return notas
    .filter((p) => !disciplinaId || p.disciplinaId === disciplinaId)
    .sort((a, b) => key(a) - key(b));
}

export const percentual = (a: DesempenhoAssunto): number =>
  a.total > 0 ? Math.round((a.acertos / a.total) * 100) : 0;

/** Do mais fraco ao mais forte; empate: mais questões primeiro (dado mais confiável), depois nome. */
export function ordenarAssuntos(assuntos: DesempenhoAssunto[], disciplinaId: string): DesempenhoAssunto[] {
  return assuntos
    .filter((a) => a.total > 0 && (!disciplinaId || a.disciplinaId === disciplinaId))
    .sort(
      (a, b) =>
        percentual(a) - percentual(b) ||
        b.total - a.total ||
        a.nome.localeCompare(b.nome, 'pt-BR')
    );
}

export const formatData = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export const formatNotaEscala = (n: number): string => fmt(n);

/** Resumo lido por leitores de tela; a tabela alternativa traz o detalhe. */
export function resumoNotas(pontos: NotaPonto[]): string {
  if (pontos.length === 0) return 'Sem notas.';
  const ns = pontos.map(notaNormalizada);
  const ultima = ns[ns.length - 1];
  if (ns.length === 1) return `Uma nota: ${fmt(ultima)} de 10.`;
  const tendencia = ultima > ns[0] ? 'subiu' : ultima < ns[0] ? 'caiu' : 'ficou igual';
  return `${ns.length} notas; a nota ${tendencia} de ${fmt(ns[0])} para ${fmt(ultima)} de 10.`;
}

export function resumoAssuntos(assuntos: DesempenhoAssunto[]): string {
  if (assuntos.length === 0) return 'Sem assuntos.';
  const f = assuntos[0];
  const l = assuntos[assuntos.length - 1];
  return `${assuntos.length} assuntos, do mais fraco (${f.nome}, ${percentual(f)}% de acertos) ao mais forte (${l.nome}, ${percentual(l)}%).`;
}
