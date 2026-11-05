import { CROP_SIZE, clampOffset, displaySize, sourceRect, validateImageFile } from './avatarCrop';
import { validateNewPassword } from './passwordRules';

test('imagem sempre cobre a área de recorte pelo lado menor', () => {
  const { w, h } = displaySize(1000, 500, 1);
  expect(h).toBe(CROP_SIZE);
  expect(w).toBe(CROP_SIZE * 2);
});

test('clampOffset impede mostrar bordas vazias', () => {
  const s = clampOffset({ zoom: 1, x: 500, y: 500 }, 1000, 500);
  expect(s.x).toBe(CROP_SIZE / 2); // (480 - 240) / 2
  expect(s.y).toBe(0); // altura == área: sem folga vertical
});

test('sem deslocamento, o recorte é o quadrado central da imagem original', () => {
  const r = sourceRect({ zoom: 1, x: 0, y: 0 }, 1000, 500);
  expect(r.sx).toBeCloseTo(250);
  expect(r.sy).toBeCloseTo(0);
  expect(r.size).toBeCloseTo(500);
});

test('zoom 2 recorta metade do lado', () => {
  const r = sourceRect({ zoom: 2, x: 0, y: 0 }, 500, 500);
  expect(r.size).toBeCloseTo(250);
  expect(r.sx).toBeCloseTo(125);
});

test('valida tipo e tamanho do arquivo', () => {
  expect(validateImageFile({ type: 'image/gif', size: 10 })).toMatch(/JPG/);
  expect(validateImageFile({ type: 'image/png', size: 6 * 1024 * 1024 })).toMatch(/5 MB/);
  expect(validateImageFile({ type: 'image/png', size: 1024 })).toBeNull();
});

test('regras da nova senha', () => {
  expect(validateNewPassword('a', 'curta1', 'curta1').ok).toBe(false);
  expect(validateNewPassword('a', 'somenteletras', 'somenteletras').ok).toBe(false);
  expect(validateNewPassword('Senha1234', 'Senha1234', 'Senha1234').ok).toBe(false);
  expect(validateNewPassword('Senha1234', 'Outra12345', 'Outra1234').ok).toBe(false);
  expect(validateNewPassword('Senha1234', 'Outra12345', 'Outra12345').ok).toBe(true);
});
