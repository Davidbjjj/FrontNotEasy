import type { AlunoRisco, ConfigListaInput, Dificuldade, MotivoRisco, StatusEntrega } from './types';

// ---------------------------------------------------------------- datas

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO (UTC) -> valor de <input type="datetime-local"> no fuso do navegador. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valor de <input type="datetime-local"> -> ISO (UTC); vazio vira null. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function formatDataHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatData(iso: string | null | undefined): string {
  return formatDataHora(iso).split(' ')[0];
}

// ---------------------------------------------------------------- notas

/** Aceita "7,5" ou "7.5"; devolve null se vazio ou fora de 0–10. */
export function parseNota(texto: string): number | null {
  const t = texto.trim().replace(',', '.');
  if (t === '' || !/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const n = Number(t);
  return n >= 0 && n <= 10 ? n : null;
}

export const formatNota = (n: number | null | undefined): string =>
  n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });

// ---------------------------------------------------------------- tags / dificuldade

export function parseTags(texto: string): string[] {
  const vistos = new Set<string>();
  texto.split(/[,;\n]/).forEach((t) => {
    const v = t.trim().toLowerCase();
    if (v) vistos.add(v.slice(0, 60));
  });
  return Array.from(vistos);
}

export const DIFICULDADES: { value: Dificuldade; label: string }[] = [
  { value: 'FACIL', label: 'Fácil' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'DIFICIL', label: 'Difícil' },
];

export const rotuloDificuldade = (d: string | null | undefined): string =>
  DIFICULDADES.find((x) => x.value === d)?.label ?? 'Sem classificação';

export const resumoEnunciado = (t: string, max = 140): string =>
  t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;

// ---------------------------------------------------------------- configuração da lista (FE-205)

export const CONFIG_PADRAO: ConfigListaInput = {
  abreEm: null,
  fechaEm: null,
  maxTentativas: null,
  regraNota: 'MAIOR',
  tempoLimiteMinutos: null,
  embaralharQuestoes: false,
  embaralharAlternativas: false,
};

/** Erros de validação da configuração (lista vazia = pode salvar). */
export function validarConfig(c: ConfigListaInput): string[] {
  const erros: string[] = [];
  if (c.abreEm && c.fechaEm && new Date(c.fechaEm) <= new Date(c.abreEm)) {
    erros.push('O fechamento precisa ser depois da abertura.');
  }
  if (c.maxTentativas != null && (!Number.isInteger(c.maxTentativas) || c.maxTentativas < 1 || c.maxTentativas > 20)) {
    erros.push('O número de tentativas deve ficar entre 1 e 20.');
  }
  if (c.tempoLimiteMinutos != null && (!Number.isInteger(c.tempoLimiteMinutos) || c.tempoLimiteMinutos < 1 || c.tempoLimiteMinutos > 600)) {
    erros.push('O tempo limite deve ficar entre 1 e 600 minutos.');
  }
  return erros;
}

/** Frases do resumo mostrado antes de publicar. */
export function resumoRegras(c: ConfigListaInput): string[] {
  const linhas: string[] = [];
  linhas.push(c.abreEm ? `Abre em ${formatDataHora(c.abreEm)}.` : 'Abre assim que for publicada.');
  linhas.push(c.fechaEm ? `Fecha em ${formatDataHora(c.fechaEm)}.` : 'Sem data de fechamento.');
  const t = c.maxTentativas ?? 1;
  linhas.push(`${t} ${t === 1 ? 'tentativa' : 'tentativas'} por aluno.`);
  if (t > 1) {
    linhas.push(c.regraNota === 'ULTIMA' ? 'A nota vale a da última tentativa.' : 'A nota vale a da melhor tentativa.');
  }
  linhas.push(c.tempoLimiteMinutos ? `Tempo limite de ${c.tempoLimiteMinutos} min depois de começar.` : 'Sem tempo limite.');
  const emb = [c.embaralharQuestoes && 'as questões', c.embaralharAlternativas && 'as alternativas'].filter(Boolean);
  linhas.push(emb.length ? `Embaralha ${emb.join(' e ')} para cada aluno.` : 'Não embaralha questões nem alternativas.');
  return linhas;
}

// ---------------------------------------------------------------- risco (FE-204) e perfil (FE-207)

export const MOTIVOS: Record<MotivoRisco, string> = {
  MEDIA_BAIXA: 'Média baixa',
  SEM_ACESSO: 'Sem acessar',
  LISTAS_ATRASADAS: 'Listas atrasadas',
};

export const NIVEIS: Record<AlunoRisco['nivel'], string> = { ALTO: 'Risco alto', MEDIO: 'Risco médio', BAIXO: 'Sem risco' };

export const STATUS_ENTREGA: Record<StatusEntrega, string> = {
  ENTREGUE: 'Entregue',
  ATRASADA: 'Atrasada',
  NAO_FEITA: 'Não feita',
};

export function textoUltimoAcesso(a: Pick<AlunoRisco, 'ultimoAcesso' | 'diasSemAcesso'>): string {
  if (!a.ultimoAcesso) return 'Nunca acessou';
  const d = a.diasSemAcesso ?? 0;
  if (d === 0) return 'Hoje';
  return d === 1 ? 'Há 1 dia' : `Há ${d} dias`;
}

/** Alterna um id numa seleção múltipla, sem mutar. */
export function alternarSelecao(sel: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(sel);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export const mensagemAvisoPadrao = (nome: string): string =>
  `Olá, ${nome.split(' ')[0]}! Notei que você está com algumas pendências. Posso ajudar? Fale comigo se precisar.`;

export const tituloReforcoPadrao = (assuntos: string[]): string =>
  assuntos.length === 0 ? 'Lista de reforço' : `Reforço: ${assuntos.slice(0, 3).join(', ')}`;

// ---------------------------------------------------------------- mural (FE-209): markdown simples e seguro

export type Inline =
  | { t: 'texto'; v: string }
  | { t: 'negrito'; v: string }
  | { t: 'italico'; v: string }
  | { t: 'link'; v: string; href: string };

export type Bloco =
  | { t: 'p'; inline: Inline[] }
  | { t: 'ul'; itens: Inline[][] };

const URL_SEGURA = /^https?:\/\/[^\s]+$/i;

/** Negrito (**x**), itálico (_x_) e links [texto](https://...). Qualquer outra coisa é texto puro. */
export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*([^*]+)\*\*|_([^_]+)_|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > ultimo) out.push({ t: 'texto', v: s.slice(ultimo, m.index) });
    if (m[1] !== undefined) out.push({ t: 'negrito', v: m[1] });
    else if (m[2] !== undefined) out.push({ t: 'italico', v: m[2] });
    else if (URL_SEGURA.test(m[4])) out.push({ t: 'link', v: m[3], href: m[4] });
    else out.push({ t: 'texto', v: m[0] });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < s.length) out.push({ t: 'texto', v: s.slice(ultimo) });
  return out;
}

/** Linhas com "- " ou "* " viram lista; linhas em branco separam parágrafos. */
export function parseTexto(texto: string): Bloco[] {
  const blocos: Bloco[] = [];
  let par: string[] = [];
  let lista: Inline[][] = [];
  const fechaPar = () => {
    if (par.length) blocos.push({ t: 'p', inline: parseInline(par.join('\n')) });
    par = [];
  };
  const fechaLista = () => {
    if (lista.length) blocos.push({ t: 'ul', itens: lista });
    lista = [];
  };
  for (const linha of texto.replace(/\r/g, '').split('\n')) {
    const item = /^\s*[-*]\s+(.*)$/.exec(linha);
    if (item) {
      fechaPar();
      lista.push(parseInline(item[1]));
    } else if (linha.trim() === '') {
      fechaPar();
      fechaLista();
    } else {
      fechaLista();
      par.push(linha);
    }
  }
  fechaPar();
  fechaLista();
  return blocos;
}

/** Envolve a seleção de um textarea com marcadores de formatação. */
export function aplicarFormato(
  texto: string,
  ini: number,
  fim: number,
  tipo: 'negrito' | 'italico' | 'lista'
): { texto: string; ini: number; fim: number } {
  if (tipo === 'lista') {
    const antes = texto.slice(0, ini);
    const inicioLinha = antes.lastIndexOf('\n') + 1;
    const trecho = texto.slice(inicioLinha, fim);
    const novo = trecho.split('\n').map((l) => (/^\s*[-*]\s/.test(l) ? l : `- ${l}`)).join('\n');
    return { texto: texto.slice(0, inicioLinha) + novo + texto.slice(fim), ini: inicioLinha, fim: inicioLinha + novo.length };
  }
  const m = tipo === 'negrito' ? '**' : '_';
  const sel = texto.slice(ini, fim) || (tipo === 'negrito' ? 'texto em negrito' : 'texto em itálico');
  const novo = `${m}${sel}${m}`;
  return { texto: texto.slice(0, ini) + novo + texto.slice(fim), ini: ini + m.length, fim: ini + m.length + sel.length };
}

export const ANEXO_MAX_BYTES = 5 * 1024 * 1024;
export const ANEXO_TIPOS = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];

export function validarAnexo(f: { size: number; type: string }): string | null {
  if (f.size > ANEXO_MAX_BYTES) return 'O anexo pode ter no máximo 5 MB.';
  if (!ANEXO_TIPOS.includes(f.type)) return 'Use um anexo PDF, PNG, JPG ou TXT.';
  return null;
}
