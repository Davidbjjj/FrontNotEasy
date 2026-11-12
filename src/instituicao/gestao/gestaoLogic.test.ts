import {
  aplicarCorPrincipal, contrasteComBranco, detalheKpiPath, escurecer, formatarKpi, formatarValorAuditoria, menuVisivel,
  modeloCsv, podeCancelar, podeReenviar, presetPeriodo, relatorioErrosCsv, senhaForte, seriesComparativo, textoVariacao,
} from './gestaoLogic';
import type { LinhaImportacao } from './gestaoService';

describe('FE-301 · CSV', () => {
  it('modelo tem cabeçalho e exemplos preenchidos', () => {
    const alunos = modeloCsv('ALUNOS').replace('﻿', '').split('\r\n');
    expect(alunos[0]).toBe('nome;email;data_nascimento;disciplinas');
    expect(alunos[1]).toContain('maria.silva@exemplo.com');
    expect(modeloCsv('PROFESSORES')).toContain('nome;email;disciplinas');
  });

  it('relatório de erros leva só as linhas com erro, com o número da linha original', () => {
    const linhas: LinhaImportacao[] = [
      { numero: 2, dados: { nome: 'Ok', email: 'ok@x.com' }, status: 'NOVO', erros: [] },
      { numero: 3, dados: { nome: '', email: 'ruim' }, status: 'ERRO', erros: ['Nome obrigatório', 'E-mail inválido'] },
      { numero: 4, dados: { nome: '=SOMA(1)', email: 'a@x.com' }, status: 'ERRO', erros: ['Duplicado; veja'] },
    ];
    const csv = relatorioErrosCsv(linhas, ['nome', 'email']).replace('﻿', '').trim().split('\r\n');
    expect(csv).toHaveLength(3);
    expect(csv[0]).toBe('linha;nome;email;erros');
    expect(csv[1]).toBe('3;;ruim;Nome obrigatório | E-mail inválido');
    expect(csv[2]).toBe("4;'=SOMA(1);a@x.com;\"Duplicado; veja\"");
  });
});

describe('FE-302 · convites', () => {
  it('regras de reenviar e cancelar por status', () => {
    expect(podeReenviar('EXPIRADO')).toBe(true);
    expect(podeReenviar('ACEITO')).toBe(false);
    expect(podeCancelar('PENDENTE')).toBe(true);
    expect(podeCancelar('ACEITO')).toBe(false);
    expect(podeCancelar('CANCELADO')).toBe(false);
  });
  it('senha forte exige 8+, maiúscula, minúscula e número', () => {
    expect(senhaForte('Senha1234')).toBe(true);
    expect(senhaForte('senha1234')).toBe(false);
    expect(senhaForte('Curta1')).toBe(false);
    expect(senhaForte('SemNumeros')).toBe(false);
  });
});

describe('FE-303 · KPIs', () => {
  it('formata cada KPI', () => {
    expect(formatarKpi({ chave: 'ALUNOS_ATIVOS', valor: 42 })).toBe('42');
    expect(formatarKpi({ chave: 'MEDIA_GERAL', valor: 7.25 })).toMatch(/^7,[23]$/);
    expect(formatarKpi({ chave: 'ENTREGAS_NO_PRAZO', valor: 80 })).toBe('80,0%');
    expect(formatarKpi({ chave: 'MEDIA_GERAL', valor: null })).toBe('—');
  });
  it('descreve a variação com seta e texto (não só cor)', () => {
    expect(textoVariacao(12.5)).toBe('▲ 12,5% a mais que no período anterior');
    expect(textoVariacao(-3)).toBe('▼ 3% a menos que no período anterior');
    expect(textoVariacao(0)).toBe('sem variação');
    expect(textoVariacao(null)).toBe('sem base de comparação');
  });
  it('link do KPI carrega o período e o filtro', () => {
    expect(detalheKpiPath('MEDIA_GERAL', { inicio: '2026-01-01', fim: '2026-01-31', disciplinaId: 'd1' }))
      .toBe('/instituicao/dashboard/MEDIA_GERAL?inicio=2026-01-01&fim=2026-01-31&disciplinaId=d1');
    expect(detalheKpiPath('ALUNOS_ATIVOS', {})).toBe('/instituicao/dashboard/ALUNOS_ATIVOS');
  });
  it('atalho de período termina hoje e começa N-1 dias antes', () => {
    expect(presetPeriodo(30, new Date(2026, 10, 30))).toEqual({ inicio: '2026-11-01', fim: '2026-11-30' });
  });
});

describe('FE-305 · séries', () => {
  it('normaliza para 0–100 e trata dados ausentes', () => {
    expect(seriesComparativo({ nome: 'A', alunos: 10, alunosAtivos: 5, mediaGeral: 7.5, pctNoPrazo: 90 }))
      .toEqual({ nome: 'A', media: 75, noPrazo: 90, ativos: 50 });
    expect(seriesComparativo({ nome: 'B', alunos: 0, alunosAtivos: 0, mediaGeral: null, pctNoPrazo: null }))
      .toEqual({ nome: 'B', media: 0, noPrazo: 0, ativos: 0 });
  });
});

describe('FE-306 · menu por permissão', () => {
  it('esconde o que não tem permissão e só o admin vê as telas legadas', () => {
    const coord = menuVisivel('COORDENADOR', ['VER_DASHBOARD', 'GERIR_PERIODOS']).map((i) => i.chave);
    expect(coord).toEqual(['dashboard', 'periodos']);
    const admin = menuVisivel('ADMIN', ['VER_DASHBOARD', 'VER_AUDITORIA']).map((i) => i.chave);
    expect(admin).toContain('professores');
    expect(admin).toContain('auditoria');
    expect(menuVisivel('PROFESSOR', ['CORRIGIR'])).toEqual([]);
  });
});

describe('FE-307 · auditoria', () => {
  it('mostra notas no padrão brasileiro', () => {
    expect(formatarValorAuditoria('6.00')).toBe('6,0');
    expect(formatarValorAuditoria('7.50')).toBe('7,5');
    expect(formatarValorAuditoria('sem nota')).toBe('sem nota');
    expect(formatarValorAuditoria(null)).toBe('—');
  });
});

describe('FE-309 · cor principal', () => {
  it('calcula contraste do texto branco', () => {
    expect(contrasteComBranco('#000000')).toBeCloseTo(21, 0);
    expect(contrasteComBranco('#ffffff')).toBeCloseTo(1.05 / 1.05, 1);
    expect(contrasteComBranco('#1d4ed8')).toBeGreaterThan(4.5);
    expect(contrasteComBranco('#ffff99')).toBeLessThan(4.5);
    expect(contrasteComBranco('azul')).toBe(0);
  });
  it('escurece a cor para hover/foco', () => {
    expect(escurecer('#ffffff', 0.5)).toBe('#808080');
  });
  it('aplica nos tokens só se a cor tiver contraste; senão volta ao padrão', () => {
    const el = document.createElement('div');
    aplicarCorPrincipal('#7c3aed', el);
    expect(el.style.getPropertyValue('--primary-blue')).toBe('#7c3aed');
    expect(el.style.getPropertyValue('--primary-dark')).not.toBe('');
    aplicarCorPrincipal('#ffff99', el);
    expect(el.style.getPropertyValue('--primary-blue')).toBe('');
    aplicarCorPrincipal(null, el);
    expect(el.style.getPropertyValue('--primary-dark')).toBe('');
  });
});
