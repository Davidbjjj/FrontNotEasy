import { textoDaAlternativa, urlAbsoluta, urlImagemDaAlternativa } from './alternativaFigura';

describe('alternativaFigura', () => {
  it('esconde o marcador "(figura)" só quando a alternativa tem imagem', () => {
    expect(textoDaAlternativa('a) (figura)', true)).toBe('');
    expect(textoDaAlternativa('(figura)', true)).toBe('');
    expect(textoDaAlternativa('a) (figura)', false)).toBe('a) (figura)');
    expect(textoDaAlternativa('A) 1 · 10⁴', true)).toBe('A) 1 · 10⁴');
    expect(textoDaAlternativa(undefined, false)).toBe('');
  });

  it('lê a URL da imagem da alternativa vinda do back', () => {
    expect(urlImagemDaAlternativa({ texto: 'a) (figura)', imagem: { urlPublica: '/api/imagens/questao/x.png' } }))
      .toBe('/api/imagens/questao/x.png');
    expect(urlImagemDaAlternativa({ texto: 'A) 25', imagem: null })).toBeUndefined();
    expect(urlImagemDaAlternativa('A) 25')).toBeUndefined();
  });

  it('torna absoluta a URL relativa', () => {
    expect(urlAbsoluta('/api/imagens/questao/x.png', 'http://api')).toBe('http://api/api/imagens/questao/x.png');
    expect(urlAbsoluta('https://cdn/x.png', 'http://api')).toBe('https://cdn/x.png');
  });
});
