import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button/Button';
import { useToast } from '../ui/Toast/ToastProvider';
import type { NotificationType } from '../notifications/types';
import { apiMessage, perfilService } from './perfilService';
import { NotificationPreferences } from './types';
import styles from './Perfil.module.css';

const OPTIONS: { type: NotificationType; label: string; description: string }[] = [
  { type: 'LISTA_NOVA', label: 'Nova lista publicada', description: 'Quando uma lista de questões é liberada para você.' },
  { type: 'PRAZO', label: 'Prazos se aproximando', description: 'Lembretes de atividades perto do vencimento.' },
  { type: 'NOTA_LANCADA', label: 'Nota lançada', description: 'Quando uma nota ou correção é publicada.' },
  { type: 'DUVIDA_RESPONDIDA', label: 'Dúvida respondida', description: 'Quando o professor responde uma dúvida ou contestação sua.' },
  { type: 'GERAL', label: 'Avisos gerais', description: 'Comunicados da instituição e novidades da plataforma.' },
];

export const NotificationPrefsSection: React.FC = () => {
  const toast = useToast();
  const [saved, setSaved] = useState<NotificationPreferences | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    perfilService
      .getNotificationPreferences()
      .then((p) => {
        if (!alive) return;
        setSaved(p);
        setPrefs(p);
      })
      .catch((err) => alive && setError(apiMessage(err, 'Não foi possível carregar suas preferências.')));
    return () => {
      alive = false;
    };
  }, []);

  const dirty = !!prefs && !!saved && OPTIONS.some((o) => prefs[o.type] !== saved[o.type]);

  const save = async () => {
    if (!prefs) return;
    setSaving(true);
    setError('');
    try {
      const result = await perfilService.saveNotificationPreferences(prefs);
      setSaved(result);
      setPrefs(result);
      toast.show({ variant: 'success', message: 'Preferências salvas.' });
    } catch (err) {
      setError(apiMessage(err, 'Não foi possível salvar as preferências.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="sec-notif">
      <h2 id="sec-notif" className={styles.cardTitle}>Preferências de notificação</h2>
      {!prefs && !error && <p className={styles.hint} role="status">Carregando…</p>}
      {prefs && (
        <fieldset className={styles.fieldset}>
          <legend className="sr-only">Quais avisos você quer receber</legend>
          {OPTIONS.map((o) => (
            <label key={o.type} className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={prefs[o.type]}
                onChange={(e) => setPrefs({ ...prefs, [o.type]: e.target.checked })}
              />
              <span>
                <strong>{o.label}</strong>
                <span className={styles.hint}>{o.description}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {prefs && (
        <div className={styles.actions}>
          <Button onClick={save} loading={saving} disabled={!dirty}>Salvar preferências</Button>
        </div>
      )}
    </section>
  );
};

export default NotificationPrefsSection;
