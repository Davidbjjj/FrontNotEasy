import React, { useState } from 'react';
import { Button } from '../ui/Button/Button';
import { Modal } from '../ui/Modal/Modal';
import { useToast } from '../ui/Toast/ToastProvider';
import { apiMessage, perfilService } from './perfilService';
import { Profile } from './types';
import styles from './Perfil.module.css';

export const CONFIRM_WORD = 'EXCLUIR';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

interface Props {
  profile: Profile;
  onChange: (p: Profile) => void;
}

/** Pedido de exclusão (LGPD) em duas etapas: entender as consequências → confirmar com senha. */
export const DeleteAccountSection: React.FC<Props> = ({ profile, onChange }) => {
  const toast = useToast();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [understood, setUnderstood] = useState(false);
  const [word, setWord] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const pending = profile.exclusaoAgendadaPara;

  const close = () => {
    if (busy) return;
    setStep(0);
    setUnderstood(false);
    setWord('');
    setSenha('');
    setError('');
  };

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      const { exclusaoAgendadaPara } = await perfilService.requestAccountDeletion(senha);
      onChange({ ...profile, exclusaoAgendadaPara });
      setBusy(false);
      close();
      toast.show({ variant: 'info', message: 'Pedido de exclusão registrado.' });
    } catch (err) {
      setError(apiMessage(err, 'Não foi possível registrar o pedido.'));
      setBusy(false);
    }
  };

  const cancelPending = async () => {
    setBusy(true);
    try {
      await perfilService.cancelAccountDeletion();
      onChange({ ...profile, exclusaoAgendadaPara: null });
      toast.show({ variant: 'success', message: 'Pedido de exclusão cancelado.' });
    } catch (err) {
      toast.show({ variant: 'error', message: apiMessage(err, 'Não foi possível cancelar o pedido.') });
    } finally {
      setBusy(false);
    }
  };

  const canConfirm = word.trim().toUpperCase() === CONFIRM_WORD && senha.length > 0;

  return (
    <section className={`${styles.card} ${styles.danger}`} aria-labelledby="sec-excluir">
      <h2 id="sec-excluir" className={styles.cardTitle}>Excluir conta</h2>

      {pending ? (
        <>
          <p role="status">
            Seu pedido de exclusão foi registrado. Sua conta e seus dados serão apagados em{' '}
            <strong>{formatDate(pending)}</strong>. Até lá você pode desistir.
          </p>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={cancelPending} loading={busy}>Cancelar exclusão</Button>
          </div>
        </>
      ) : (
        <>
          <p>
            Você pode pedir a exclusão da sua conta e dos seus dados pessoais, conforme a LGPD.
            O pedido tem um prazo de arrependimento antes de a exclusão ser definitiva.
          </p>
          <div className={styles.actions}>
            <Button variant="danger" onClick={() => setStep(1)}>Excluir minha conta</Button>
          </div>
        </>
      )}

      <Modal
        open={step === 1}
        size="sm"
        title="Excluir conta — etapa 1 de 2"
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancelar</Button>
            <Button variant="danger" disabled={!understood} onClick={() => setStep(2)}>Continuar</Button>
          </>
        }
      >
        <p>Ao excluir sua conta:</p>
        <ul className={styles.list}>
          <li>seus dados pessoais, foto e preferências serão apagados;</li>
          <li>você perde o acesso a disciplinas, listas, atividades e notas;</li>
          <li>a exclusão pode ser desfeita apenas durante o prazo de arrependimento.</li>
        </ul>
        <label className={styles.toggleRow}>
          <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
          <span>Entendo as consequências e quero continuar.</span>
        </label>
      </Modal>

      <Modal
        open={step === 2}
        size="sm"
        title="Excluir conta — etapa 2 de 2"
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>Cancelar</Button>
            <Button variant="danger" disabled={!canConfirm} loading={busy} onClick={confirm}>
              Confirmar exclusão
            </Button>
          </>
        }
      >
        <label className={styles.field}>
          <span>Digite {CONFIRM_WORD} para confirmar</span>
          <input value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" />
        </label>
        <label className={styles.field}>
          <span>Sua senha</span>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </Modal>
    </section>
  );
};

export default DeleteAccountSection;
