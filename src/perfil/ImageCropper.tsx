import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import {
  CROP_SIZE,
  CropState,
  clampOffset,
  cropToBlob,
  displaySize,
} from './avatarCrop';
import styles from './Perfil.module.css';

const PREVIEW_SIZE = 96;
const KEY_STEP = 10;

interface Props {
  file: File;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (photo: Blob) => void;
}

/** Recorte quadrado com zoom, arraste e pré-visualização circular. */
export const ImageCropper: React.FC<Props> = ({ file, saving = false, onCancel, onConfirm }) => {
  const [src, setSrc] = useState<string>('');
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [state, setState] = useState<CropState>({ zoom: 1, x: 0, y: 0 });
  const [error, setError] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    setNat(null);
    setState({ zoom: 1, x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = useCallback(
    (next: CropState) => {
      if (nat) setState(clampOffset(next, nat.w, nat.h));
    },
    [nat]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { px: e.clientX, py: e.clientY, x: state.x, y: state.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    update({ zoom: state.zoom, x: d.x + e.clientX - d.px, y: d.y + e.clientY - d.py });
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const move: Record<string, [number, number]> = {
      ArrowLeft: [KEY_STEP, 0],
      ArrowRight: [-KEY_STEP, 0],
      ArrowUp: [0, KEY_STEP],
      ArrowDown: [0, -KEY_STEP],
    };
    const m = move[e.key];
    if (!m) return;
    e.preventDefault();
    update({ zoom: state.zoom, x: state.x + m[0], y: state.y + m[1] });
  };

  const confirm = async () => {
    if (!imgRef.current) return;
    try {
      onConfirm(await cropToBlob(imgRef.current, state));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível recortar a imagem.');
    }
  };

  const layer = (k: number): React.CSSProperties => {
    if (!nat) return { visibility: 'hidden' };
    const { w, h } = displaySize(nat.w, nat.h, state.zoom);
    return {
      width: w * k,
      height: h * k,
      transform: `translate(-50%, -50%) translate(${state.x * k}px, ${state.y * k}px)`,
    };
  };

  return (
    <Modal
      open
      size="sm"
      title="Ajustar foto"
      onClose={saving ? () => undefined : onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancelar</Button>
          <Button onClick={confirm} loading={saving} disabled={!nat}>Salvar foto</Button>
        </>
      }
    >
      <div className={styles.cropper}>
        <div
          className={styles.cropArea}
          style={{ width: CROP_SIZE, height: CROP_SIZE }}
          role="group"
          tabIndex={0}
          aria-label="Área de recorte. Arraste a imagem ou use as setas para posicionar."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          {src && (
            <img
              ref={imgRef}
              src={src}
              alt="Imagem escolhida para a foto de perfil"
              className={styles.cropImg}
              style={layer(1)}
              draggable={false}
              onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              onError={() => setError('Não foi possível ler esta imagem.')}
            />
          )}
        </div>

        <label className={styles.zoomRow}>
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={state.zoom}
            disabled={!nat}
            onChange={(e) => update({ ...state, zoom: Number(e.target.value) })}
          />
        </label>

        <div className={styles.previewRow}>
          <div
            className={styles.preview}
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            role="img"
            aria-label="Pré-visualização da foto"
          >
            {src && (
              <img src={src} alt="" className={styles.cropImg} style={layer(PREVIEW_SIZE / CROP_SIZE)} draggable={false} />
            )}
          </div>
          <p className={styles.hint}>Assim sua foto aparecerá para os outros usuários.</p>
        </div>

        {error && <p role="alert" className={styles.error}>{error}</p>}
      </div>
    </Modal>
  );
};

export default ImageCropper;
