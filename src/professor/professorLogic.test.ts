import {
  CONFIG_PADRAO, alternarSelecao, aplicarFormato, fromLocalInput, parseNota, parseTags, parseTexto, resumoRegras,
  textoUltimoAcesso, toLocalInput, validarAnexo, validarConfig,
} from './professorLogic';

describe('datas', () => {
  it('faz o caminho de ida e volta entre ISO e datetime-local', () => {
    const iso = '2026-11-20T15:30:00.000Z';
    expect(fromLocalInput(toLocalInput(iso))).toBe(iso);
  });
  it('trata vazio e inválido', () => {
    expect(fromLocalInput('')).toBeNull();
    expect(toLocalInput(null)).toBe('');
    expect(toLocalInput('lixo')).toBe('');
  });
});

describe('parseNota', () => {
  it('aceita vírgula e ponto', () => {
    expect(parseNota('7,5')).toBe(7.5);
    expect(parseNota('10')).toBe(10);
    expect(parseNota(' 0 ')).toBe(0);
  });
  it('rejeita vazio, fora da faixa e formato inválido', () => {
    expect(parseNota('')).toBeNull();
    expect(parseNota('10,5')).toBeNull();
    expect(parseNota('-1')).toBeNull();
    expect(parseNota('abc')).toBeNull();
    expect(parseNota('7,555')).toBeNull();
  });
});

describe('parseTags', () => {
  it('normaliza, remove repetidas e vazias', () => {
    expect(parseTags('Álgebra, álgebra ; ENEM\n, ')).toEqual(['álgebra', 'enem']);
  });
});

describe('configuração da lista', () => {
  it('padrão é válido', () => {
    expect(validarConfig(CONFIG_PADRAO)).toEqual([]);
  });
  it('exige fechamento depois da abertura', () => {
    const erros = validarConfig({ ...CONFIG_PADRAO, abreEm: '2026-11-20T10:00:00Z', fechaEm: '2026-11-19T10:00:00Z' });
    expect(erros).toHaveLength(1);
  });
  it('limita tentativas e tempo', () => {
    expect(validarConfig({ ...CONFIG_PADRAO, maxTentativas: 0 })).toHaveLength(1);
    expect(validarConfig({ ...CONFIG_PADRAO, maxTentativas: 21 })).toHaveLength(1);
    expect(validarConfig({ ...CONFIG_PADRAO, tempoLimiteMinutos: 601 })).toHaveLength(1);
    expect(validarConfig({ ...CONFIG_PADRAO, maxTentativas: 3, tempoLimiteMinutos: 60 })).toEqual([]);
  });
  it('resume as regras em frases', () => {
    const r = resumoRegras({
      ...CONFIG_PADRAO, maxTentativas: 3, regraNota: 'ULTIMA', tempoLimiteMinutos: 45,
      embaralharQuestoes: true, embaralharAlternativas: true,
    });
    expect(r).toContain('3 tentativas por aluno.');
    expect(r).toContain('A nota vale a da última tentativa.');
    expect(r).toContain('Tempo limite de 45 min depois de começar.');
    expect(r).toContain('Embaralha as questões e as alternativas para cada aluno.');
  });
  it('sem configuração: 1 tentativa e sem regra de nota', () => {
    const r = resumoRegras(CONFIG_PADRAO);
    expect(r).toContain('1 tentativa por aluno.');
    expect(r.some((l) => l.includes('A nota vale'))).toBe(false);
  });
});

describe('risco', () => {
  it('descreve o último acesso', () => {
    expect(textoUltimoAcesso({ ultimoAcesso: null, diasSemAcesso: null })).toBe('Nunca acessou');
    expect(textoUltimoAcesso({ ultimoAcesso: 'x', diasSemAcesso: 0 })).toBe('Hoje');
    expect(textoUltimoAcesso({ ultimoAcesso: 'x', diasSemAcesso: 1 })).toBe('Há 1 dia');
    expect(textoUltimoAcesso({ ultimoAcesso: 'x', diasSemAcesso: 20 })).toBe('Há 20 dias');
  });
  it('alterna seleção sem mutar', () => {
    const a = new Set(['1']);
    const b = alternarSelecao(a, '2');
    expect(Array.from(a)).toEqual(['1']);
    expect(Array.from(b)).toEqual(['1', '2']);
    expect(Array.from(alternarSelecao(b, '1'))).toEqual(['2']);
  });
});

describe('mural: texto formatado', () => {
  it('interpreta negrito, itálico e links seguros', () => {
    const [bloco] = parseTexto('Prova **sexta** e _traga_ [edital](https://escola.com/a)');
    expect(bloco.t).toBe('p');
    if (bloco.t !== 'p') return;
    expect(bloco.inline.map((i) => i.t)).toEqual(['texto', 'negrito', 'texto', 'italico', 'texto', 'link']);
  });
  it('não vira link com esquema perigoso', () => {
    const [bloco] = parseTexto('[x](javascript:alert(1))');
    if (bloco.t !== 'p') throw new Error('esperava parágrafo');
    expect(bloco.inline.some((i) => i.t === 'link')).toBe(false);
  });
  it('nunca produz HTML: tags ficam como texto', () => {
    const [bloco] = parseTexto('<script>alert(1)</script>');
    if (bloco.t !== 'p') throw new Error('esperava parágrafo');
    expect(bloco.inline).toEqual([{ t: 'texto', v: '<script>alert(1)</script>' }]);
  });
  it('agrupa listas e separa parágrafos', () => {
    const b = parseTexto('Levar:\n- caneta\n- calculadora\n\nBoa prova');
    expect(b.map((x) => x.t)).toEqual(['p', 'ul', 'p']);
    expect(b[1].t === 'ul' && b[1].itens).toHaveLength(2);
  });
  it('aplica formatação na seleção', () => {
    expect(aplicarFormato('olá mundo', 4, 9, 'negrito').texto).toBe('olá **mundo**');
    expect(aplicarFormato('a\nb', 0, 3, 'lista').texto).toBe('- a\n- b');
  });
  it('valida anexo', () => {
    expect(validarAnexo({ size: 100, type: 'application/pdf' })).toBeNull();
    expect(validarAnexo({ size: 6 * 1024 * 1024, type: 'application/pdf' })).toMatch(/5 MB/);
    expect(validarAnexo({ size: 100, type: 'application/zip' })).toMatch(/PDF/);
  });
});
