import React, { useEffect, useState } from 'react';
import ImageWithAuth from '../../../components/ImageWithAuth';
import './Question.css';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * Miniatura que abre em tela cheia ao toque. Na tela cheia o navegador
 * permite pinça (touch-action: pinch-zoom) e a imagem pode ser rolada.
 */
export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, className }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="question-image-btn"
        onClick={() => setOpen(true)}
        aria-label={`Ampliar imagem${alt ? `: ${alt}` : ''}`}
      >
        <ImageWithAuth src={src} alt={alt} className={className} />
      </button>
      {open && (
        <div className="image-zoom" role="dialog" aria-modal="true" aria-label="Imagem ampliada">
          <button type="button" className="image-zoom__close" onClick={() => setOpen(false)} aria-label="Fechar imagem">
            ✕ Fechar
          </button>
          <div className="image-zoom__scroller">
            <ImageWithAuth src={src} alt={alt} className="image-zoom__img" />
          </div>
          <p className="image-zoom__hint">Use dois dedos para ampliar</p>
        </div>
      )}
    </>
  );
};

export default ZoomableImage;
