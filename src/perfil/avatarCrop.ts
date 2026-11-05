/** Matemática do recorte quadrado da foto (testável sem canvas). */

export const CROP_SIZE = 240; // lado da área de recorte na tela (px)
export const OUTPUT_SIZE = 256; // lado da imagem enviada (px)
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface CropState {
  zoom: number; // 1 = imagem cobre exatamente a área
  /** Deslocamento do centro da imagem em relação ao centro da área (px de tela) */
  x: number;
  y: number;
}

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Use uma imagem JPG, PNG ou WebP.';
  if (file.size > MAX_FILE_BYTES) return 'A imagem deve ter no máximo 5 MB.';
  return null;
}

/** Tamanho da imagem na tela: o lado menor sempre cobre a área de recorte. */
export function displaySize(natW: number, natH: number, zoom: number) {
  const base = CROP_SIZE / Math.min(natW, natH);
  return { w: natW * base * zoom, h: natH * base * zoom };
}

/** Mantém a imagem cobrindo toda a área (sem bordas vazias). */
export function clampOffset(state: CropState, natW: number, natH: number): CropState {
  const { w, h } = displaySize(natW, natH, state.zoom);
  const maxX = (w - CROP_SIZE) / 2;
  const maxY = (h - CROP_SIZE) / 2;
  return {
    zoom: state.zoom,
    x: Math.min(maxX, Math.max(-maxX, state.x)),
    y: Math.min(maxY, Math.max(-maxY, state.y)),
  };
}

/** Região da imagem original (px naturais) que está dentro da área de recorte. */
export function sourceRect(state: CropState, natW: number, natH: number) {
  const { w } = displaySize(natW, natH, state.zoom);
  const scale = natW / w; // px naturais por px de tela
  const size = CROP_SIZE * scale;
  const cx = natW / 2 - state.x * scale;
  const cy = natH / 2 - state.y * scale;
  return { sx: cx - size / 2, sy: cy - size / 2, size };
}

export function cropToBlob(img: HTMLImageElement, state: CropState): Promise<Blob> {
  const { sx, sy, size } = sourceRect(state, img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas indisponível neste navegador.'));
  ctx.drawImage(img, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Não foi possível gerar a imagem.'))),
      'image/jpeg',
      0.9
    )
  );
}
