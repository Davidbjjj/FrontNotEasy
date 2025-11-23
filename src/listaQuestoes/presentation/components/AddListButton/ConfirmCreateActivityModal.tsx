import React, { useEffect, useRef } from 'react';
import './ConfirmCreateActivityModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  listTitle?: string;
  isLoading?: boolean;
}

const ConfirmCreateActivityModal: React.FC<Props> = ({ isOpen, onClose, onConfirm, listTitle, isLoading = false }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ccam-backdrop" role="dialog" aria-modal="true" aria-label="Confirmar criação de atividade">
      <div className="ccam-modal" ref={ref}>
        <header className="ccam-header">
          <h2>Deseja criar uma atividade?</h2>
        </header>
        <div className="ccam-body">
          <p>Deseja criar uma atividade ligada a essa lista agora?</p>
          {listTitle && <div className="ccam-list-title">Lista: <strong>{listTitle}</strong></div>}
          <p className="ccam-sub">Você poderá configurar data, nota e outras opções depois.</p>
        </div>
        <footer className="ccam-footer">
          <button className="ccam-btn ccam-btn-ghost" onClick={onClose} disabled={isLoading}>Não, obrigado</button>
          <button className="ccam-btn ccam-btn-primary" onClick={onConfirm} disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar atividade'}</button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmCreateActivityModal;
