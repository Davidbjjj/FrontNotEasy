import React, { useState } from 'react';
import { Button } from '../ui/Button/Button';
import { useToast } from '../ui/Toast/ToastProvider';
import { validateNewPassword } from './passwordRules';
import { apiMessage, perfilService } from './perfilService';
import styles from './Perfil.module.css';

export const PasswordSection: React.FC = () => {
  const toast = useToast();
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirma, setConfirma] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atual) {
      setError('Informe a senha atual.');
      return;
    }
    const check = validateNewPassword(atual, nova, confirma);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setError('');
    setSaving(true);
    try {
      await perfilService.changePassword({ senhaAtual: atual, novaSenha: nova });
      setAtual('');
      setNova('');
      setConfirma('');
      toast.show({ variant: 'success', message: 'Senha alterada com sucesso.' });
    } catch (err) {
      setError(apiMessage(err, 'Não foi possível alterar a senha.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="sec-senha">
      <h2 id="sec-senha" className={styles.cardTitle}>Alterar senha</h2>
      <form onSubmit={submit} noValidate className={styles.form}>
        <label className={styles.field}>
          <span>Senha atual</span>
          <input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} autoComplete="current-password" />
        </label>
        <label className={styles.field}>
          <span>Nova senha</span>
          <input type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" aria-describedby="senha-dica" />
        </label>
        <p id="senha-dica" className={styles.hint}>Mínimo de 8 caracteres, com letras e números.</p>
        <label className={styles.field}>
          <span>Confirmar nova senha</span>
          <input type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} autoComplete="new-password" />
        </label>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <Button type="submit" loading={saving}>Alterar senha</Button>
        </div>
      </form>
    </section>
  );
};

export default PasswordSection;
