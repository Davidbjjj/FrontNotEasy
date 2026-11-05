import React, { useRef, useState } from 'react';
import { Button } from '../ui/Button/Button';
import { useToast } from '../ui/Toast/ToastProvider';
import ImageCropper from './ImageCropper';
import { validateImageFile } from './avatarCrop';
import { apiMessage, perfilService } from './perfilService';
import { Profile } from './types';
import styles from './Perfil.module.css';

const initials = (name: string) =>
  name.split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '?';

interface Props {
  profile: Profile;
  onChange: (p: Profile) => void;
}

export const ProfileSection: React.FC<Props> = ({ profile, onChange }) => {
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [nome, setNome] = useState(profile.nome);
  const [nameError, setNameError] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [picked, setPicked] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  const trimmed = nome.trim();
  const dirty = trimmed !== profile.nome;

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (trimmed.length < 3) {
      setNameError('Informe um nome com pelo menos 3 caracteres.');
      return;
    }
    setNameError('');
    setSavingName(true);
    try {
      onChange(await perfilService.updateName(trimmed));
      toast.show({ variant: 'success', message: 'Nome atualizado.' });
    } catch (err) {
      setNameError(apiMessage(err, 'Não foi possível atualizar o nome.'));
    } finally {
      setSavingName(false);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite escolher o mesmo arquivo de novo
    if (!file) return;
    const problem = validateImageFile(file);
    setPhotoError(problem ?? '');
    if (!problem) setPicked(file);
  };

  const savePhoto = async (blob: Blob) => {
    setSavingPhoto(true);
    try {
      onChange(await perfilService.uploadPhoto(blob));
      setPicked(null);
      toast.show({ variant: 'success', message: 'Foto atualizada.' });
    } catch (err) {
      setPicked(null);
      setPhotoError(apiMessage(err, 'Não foi possível enviar a foto.'));
    } finally {
      setSavingPhoto(false);
    }
  };

  const removePhoto = async () => {
    setPhotoError('');
    try {
      onChange(await perfilService.removePhoto());
      toast.show({ variant: 'success', message: 'Foto removida.' });
    } catch (err) {
      setPhotoError(apiMessage(err, 'Não foi possível remover a foto.'));
    }
  };

  return (
    <section className={styles.card} aria-labelledby="sec-perfil">
      <h2 id="sec-perfil" className={styles.cardTitle}>Dados pessoais</h2>

      <div className={styles.avatarRow}>
        {profile.fotoUrl ? (
          <img src={profile.fotoUrl} alt="Sua foto de perfil" className={styles.avatar} />
        ) : (
          <div className={styles.avatar} role="img" aria-label="Sem foto de perfil">{initials(profile.nome)}</div>
        )}
        <div className={styles.avatarActions}>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-label="Escolher foto"
            onChange={onFile}
          />
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            {profile.fotoUrl ? 'Trocar foto' : 'Adicionar foto'}
          </Button>
          {profile.fotoUrl && <Button variant="ghost" onClick={removePhoto}>Remover</Button>}
          <p className={styles.hint}>JPG, PNG ou WebP, até 5 MB.</p>
        </div>
      </div>
      {photoError && <p role="alert" className={styles.error}>{photoError}</p>}

      <form onSubmit={saveName} noValidate className={styles.form}>
        <label className={styles.field}>
          <span>Nome</span>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'nome-erro' : undefined}
          />
        </label>
        {nameError && <p id="nome-erro" role="alert" className={styles.error}>{nameError}</p>}
        <label className={styles.field}>
          <span>E-mail</span>
          <input value={profile.email} readOnly aria-describedby="email-dica" />
        </label>
        <p id="email-dica" className={styles.hint}>Para trocar o e-mail, fale com o suporte.</p>
        <div className={styles.actions}>
          <Button type="submit" loading={savingName} disabled={!dirty}>Salvar nome</Button>
        </div>
      </form>

      {picked && (
        <ImageCropper file={picked} saving={savingPhoto} onCancel={() => setPicked(null)} onConfirm={savePhoto} />
      )}
    </section>
  );
};

export default ProfileSection;
