import type { Kpi, LinhaImportacao, StatusConvite, TipoImportacao } from './gestaoService';

// ---------------------------------------------------------------- FE-301 · modelo e relatório de erros (CSV)

/** CSV de modelo com exemplo preenchido (separador ';', como o Excel em português espera). */
export function modeloCsv(tipo: TipoImportacao): string {
  if (tipo === 'ALUNOS') {
    return '﻿nome;email;data_nascimento;disciplinas\r\n'
      + 'Maria da Silva;maria.silva@exemplo.com;2008-04-15;Matemática|Português\r\n'
      + 'João Souza;joao.souza@exemplo.com;12/09/2007;Matemática\r\n';
  }
  return '﻿nome;email;disciplinas\r\n'
    + 'Ana Costa;ana.costa@exemplo.com;Matemática|Física\r\n'
    + 'Carlos Lima;carlos.lima@exemplo.com;História\r\n';
}

const campoCsv = (v: string): string => {
  let s = v ?? '';
  if (s && '=+-@\t\r'.includes(s[0]) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`;
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Relatório das linhas com erro: o gestor corrige e reenvia. Traz o número da linha do arquivo original. */
export function relatorioErrosCsv(linhas: LinhaImportacao[], colunas: string[]): string {
  const cab = ['linha', ...colunas, 'erros'];
  const corpo = linhas
    .filter((l) => l.status === 'ERRO')
    .map((l) => [String(l.numero), ...colunas.map((c) => l.dados[c] ?? ''), l.erros.join(' | ')]);
  return `﻿${[cab, ...corpo].map((r) => r.map(campoCsv).join(';')).join('\r\n')}\r\n`;
}

export function baixarTexto(conteudo: string, nome: string, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ROTULO_STATUS_LINHA: Record<LinhaImportacao['status'], string> = {
  NOVO: 'Novo', ATUALIZAR: 'Atualizar', IGNORAR: 'Sem mudança', ERRO: 'Erro',
};

// ---------------------------------------------------------------- FE-302 · convites

export const ROTULO_PAPEL: Record<string, string> = {
  ADMIN: 'Administrador', COORDENADOR: 'Coordenador', PROFESSOR: 'Professor', ALUNO: 'Aluno',
};

export const ROTULO_STATUS_CONVITE: Record<StatusConvite, string> = {
  PENDENTE: 'Pendente', ACEITO: 'Aceito', EXPIRADO: 'Expirado', CANCELADO: 'Cancelado',
};

/** Só convites pendentes ou expirados podem ser reenviados; só os que não foram aceitos podem ser cancelados. */
export const podeReenviar = (s: StatusConvite) => s === 'PENDENTE' || s === 'EXPIRADO' || s === 'CANCELADO';
export const podeCancelar = (s: StatusConvite) => s === 'PENDENTE' || s === 'EXPIRADO';

export const senhaForte = (s: string): boolean =>
  s.length >= 8 && /[A-Z]/.test(s) && /[a-z]/.test(s) && /\d/.test(s);

// ---------------------------------------------------------------- FE-303 · KPIs

export function formatarKpi(k: Pick<Kpi, 'chave' | 'valor'>): string {
  if (k.valor == null) return '—';
  if (k.chave === 'ALUNOS_ATIVOS') return String(Math.round(k.valor));
  const n = k.valor.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return k.chave === 'ENTREGAS_NO_PRAZO' ? `${n}%` : n;
}

export function textoVariacao(v: number | null): string {
  if (v == null) return 'sem base de comparação';
  if (v === 0) return 'sem variação';
  const n = Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return `${v > 0 ? '▲' : '▼'} ${n}% ${v > 0 ? 'a mais' : 'a menos'} que no período anterior`;
}

export const detalheKpiPath = (chave: string, f: { inicio?: string; fim?: string; disciplinaId?: string }) => {
  const q = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => { if (v) q.set(k, v); });
  const s = q.toString();
  return `/instituicao/dashboard/${chave}${s ? `?${s}` : ''}`;
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function presetPeriodo(dias: number, hoje = new Date()): { inicio: string; fim: string } {
  const ini = new Date(hoje);
  ini.setDate(ini.getDate() - (dias - 1));
  return { inicio: iso(ini), fim: iso(hoje) };
}

// ---------------------------------------------------------------- FE-305 · gráficos comparativos

/** Séries 0–100 (mesma escala) para as barras agrupadas; a tabela mostra os valores brutos. */
export function seriesComparativo(l: { nome: string; alunos: number; alunosAtivos: number; mediaGeral: number | null; pctNoPrazo: number | null }) {
  return {
    nome: l.nome,
    media: l.mediaGeral == null ? 0 : Math.round(l.mediaGeral * 10),
    noPrazo: l.pctNoPrazo ?? 0,
    ativos: l.alunos === 0 ? 0 : Math.round((l.alunosAtivos * 100) / l.alunos),
  };
}

// ---------------------------------------------------------------- FE-306 · menu por permissão

export interface ItemMenuInstituicao { chave: string; rotulo: string; permissao: string | null; adminApenas?: boolean }

/** `permissao: null` = visível para quem tem qualquer permissão de gestão. Itens sem permissão ficam ocultos. */
export const ITENS_MENU: ItemMenuInstituicao[] = [
  { chave: 'dashboard', rotulo: 'Dashboard', permissao: 'VER_DASHBOARD' },
  { chave: 'importacao', rotulo: 'Importação', permissao: 'IMPORTAR_USUARIOS' },
  { chave: 'convites', rotulo: 'Convites', permissao: 'GERIR_CONVITES' },
  { chave: 'periodos', rotulo: 'Períodos e turmas', permissao: 'GERIR_PERIODOS' },
  { chave: 'comparativos', rotulo: 'Comparativos', permissao: 'VER_RELATORIOS' },
  { chave: 'boletins', rotulo: 'Boletins e relatórios', permissao: 'EMITIR_BOLETINS' },
  { chave: 'papeis', rotulo: 'Papéis e permissões', permissao: 'GERIR_PAPEIS' },
  { chave: 'auditoria', rotulo: 'Auditoria', permissao: 'VER_AUDITORIA' },
  { chave: 'personalizacao', rotulo: 'Identidade e regras', permissao: 'EDITAR_CONFIGURACOES' },
  // telas legadas de cadastro um a um: só o admin (INSTITUICAO) as vê
  { chave: 'professores', rotulo: 'Professores', permissao: null, adminApenas: true },
  { chave: 'disciplinas', rotulo: 'Disciplinas', permissao: null, adminApenas: true },
  { chave: 'estudantes', rotulo: 'Estudantes', permissao: null, adminApenas: true },
  { chave: 'associacoes', rotulo: 'Associações', permissao: null, adminApenas: true },
  { chave: 'configuracoes', rotulo: 'E-mails permitidos', permissao: null, adminApenas: true },
];

export function menuVisivel(papel: string | null, permissoes: string[]): ItemMenuInstituicao[] {
  return ITENS_MENU.filter((i) => (i.adminApenas ? papel === 'ADMIN' : i.permissao != null && permissoes.includes(i.permissao)));
}

/** Itens do menu principal do professor escondidos quando a matriz não dá a permissão. */
export const PERMISSAO_NAV: Record<string, string> = { correcao: 'CORRIGIR', banco: 'BANCO_QUESTOES', risco: 'VER_ALUNOS_RISCO' };

// ---------------------------------------------------------------- FE-307 · auditoria

export const ROTULO_ACAO: Record<string, string> = {
  NOTA_LANCADA: 'Nota lançada', NOTA_ALTERADA: 'Nota alterada', CONFIG_LISTA: 'Regras da lista alteradas',
  CONVITE_CRIADO: 'Convite criado', CONVITE_REENVIADO: 'Convite reenviado', CONVITE_CANCELADO: 'Convite cancelado',
  CONVITE_ACEITO: 'Convite aceito', IMPORTACAO_ALUNOS: 'Importação de alunos', IMPORTACAO_PROFESSORES: 'Importação de professores',
  PAPEL_ALTERADO: 'Papel alterado', PERMISSOES_ALTERADAS: 'Permissões alteradas', PERIODO_CRIADO: 'Período criado',
  PERIODO_EDITADO: 'Período editado', TURMA_CRIADA: 'Turma criada', TURMA_EDITADA: 'Turma editada',
  REMATRICULA_EM_LOTE: 'Rematrícula em lote', DISCIPLINA_ARQUIVADA: 'Disciplina arquivada',
  DISCIPLINA_DESARQUIVADA: 'Disciplina reativada', CONFIG_INSTITUICAO: 'Configurações alteradas',
  LOGO_ALTERADO: 'Logo alterado', LOGO_REMOVIDO: 'Logo removido', BOLETIM_EMITIDO: 'Boletim emitido',
  RELATORIO_RISCO_EMITIDO: 'Relatório de risco emitido', RELATORIO_COMPARATIVO_EXPORTADO: 'Comparativo exportado',
};

export const rotuloAcao = (a: string): string => ROTULO_ACAO[a] ?? a.replace(/_/g, ' ').toLowerCase();

/** Notas vêm como "6.00"; mostra "6,0" no padrão brasileiro. Outros valores ficam como estão. */
export function formatarValorAuditoria(v: string | null): string {
  if (v == null || v === '') return '—';
  return /^-?\d+\.\d+$/.test(v) ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : v;
}

// ---------------------------------------------------------------- FE-309 · cor principal

const HEX = /^#[0-9a-fA-F]{6}$/;
export const corValida = (c: string): boolean => HEX.test(c);

/** Contraste do texto branco sobre a cor (WCAG). Precisa ser >= 4,5. */
export function contrasteComBranco(hex: string): number {
  if (!corValida(hex)) return 0;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05);
}

/** Versão mais escura (hover/foco) a partir da cor principal. */
export function escurecer(hex: string, fator = 0.85): string {
  if (!corValida(hex)) return hex;
  const c = [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * fator));
  return `#${c.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/** Aplica a cor da instituição nos tokens do FE-001 (mesmos que o resto do app já usa). */
export function aplicarCorPrincipal(hex: string | null, raiz: HTMLElement = document.documentElement) {
  if (hex && corValida(hex) && contrasteComBranco(hex) >= 4.5) {
    raiz.style.setProperty('--primary-blue', hex);
    raiz.style.setProperty('--primary-dark', escurecer(hex));
    raiz.style.setProperty('--color-focus', escurecer(hex));
  } else {
    raiz.style.removeProperty('--primary-blue');
    raiz.style.removeProperty('--primary-dark');
    raiz.style.removeProperty('--color-focus');
  }
}
