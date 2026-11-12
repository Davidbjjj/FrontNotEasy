import React, { useEffect, useState } from 'react';
import { Button, Modal } from '../../ui';
import styles from '../Professor.module.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Campos da primeira etapa. */
  children: React.ReactNode;
  /** Frase mostrada na etapa de confirmação, descrevendo exatamente o que vai acontecer. */
  resumo: React.ReactNode;
  /** Erro de validação da primeira etapa; enquanto existir, não deixa continuar. */
  bloqueio?: string | null;
  continuarLabel?: string;
  confirmarLabel: string;
  onConfirm: () => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Modal de ação em duas etapas (FE-203): preencher → confirmar. A confirmação repete o que vai acontecer
 * antes de executar; quem chama mostra o toast de sucesso depois de `onConfirm` resolver.
 */
export const ModalAcao: React.FC<Props> = ({
  open, title, onClose, children, resumo, bloqueio, continuarLabel = 'Continuar', confirmarLabel, onConfirm, size = 'md',
}) => {
  const [etapa, setEtapa] = useState<'form' | 'confirmar'>('form');
  const [executando, setExecutando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setEtapa('form'); setErro(null); setExecutando(false); }
  }, [open]);

  const confirmar = async () => {
    setExecutando(true);
    setErro(null);
    try {
      await onConfirm();
    } catch (e: any) {
      setErro(typeof e?.message === 'string' && e.message ? e.message : 'Não foi possível concluir a ação.');
    } finally {
      setExecutando(false);
    }
  };

  const fechar = () => { if (!executando) onClose(); };

  return (
    <Modal
      open={open}
      title={etapa === 'form' ? title : `Confirmar: ${title}`}
      onClose={fechar}
      size={size}
      footer={etapa === 'form' ? (
        <>
          <Button variant="ghost" onClick={fechar}>Cancelar</Button>
          <Button onClick={() => setEtapa('confirmar')} disabled={!!bloqueio}>{continuarLabel}</Button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={() => { setErro(null); setEtapa('form'); }} disabled={executando}>Voltar</Button>
          <Button onClick={() => void confirmar()} loading={executando}>{confirmarLabel}</Button>
        </>
      )}
    >
      {etapa === 'form' ? (
        <div className={styles.stack}>
          {children}
          {bloqueio && <p role="alert" className={styles.errorText}>{bloqueio}</p>}
        </div>
      ) : (
        <div className={styles.stack}>
          <div className={styles.cardAlt}>{resumo}</div>
          {erro && <p role="alert" className={styles.errorText}>{erro}</p>}
        </div>
      )}
    </Modal>
  );
};

export default ModalAcao;
