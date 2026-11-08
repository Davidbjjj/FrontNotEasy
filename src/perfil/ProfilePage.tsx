import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button/Button';
import ProfileSection from './ProfileSection';
import PasswordSection from './PasswordSection';
import NotificationPrefsSection from './NotificationPrefsSection';
import DeleteAccountSection from './DeleteAccountSection';
import { PROFILE_UPDATED_EVENT, apiMessage, perfilService } from './perfilService';
import { Profile } from './types';
import styles from './Perfil.module.css';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const update = (p: Profile) => {
    setProfile(p);
    window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: { nome: p.nome, fotoUrl: p.fotoUrl } }));
  };

  useEffect(() => {
    let alive = true;
    setError('');
    perfilService
      .get()
      .then((p) => alive && setProfile(p))
      .catch((err) => alive && setError(apiMessage(err, 'Não foi possível carregar seu perfil.')));
    return () => {
      alive = false;
    };
  }, [attempt]);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Perfil e configurações</h1>
      {error && (
        <div role="alert" className={styles.error}>
          <p>{error}</p>
          <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Tentar novamente</Button>
        </div>
      )}
      {!profile && !error && <p role="status" className={styles.hint}>Carregando…</p>}
      {profile && (
        <>
          <ProfileSection profile={profile} onChange={update} />
          <PasswordSection />
          <NotificationPrefsSection />
          <DeleteAccountSection profile={profile} onChange={update} />
        </>
      )}
    </div>
  );
};

export default ProfilePage;
