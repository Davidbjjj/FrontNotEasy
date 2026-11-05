import { useState, useCallback, useEffect } from 'react';
import { UserInfo, TopBarViewModel } from '../model/TopBar.types';
import { decodeJwt } from '../../auth/jwt';
import { PROFILE_UPDATED_EVENT, perfilService } from '../../perfil/perfilService';

export const useTopBarViewModel = (
  initialUserInfo?: UserInfo,
  onSupportClick?: () => void,
  onLogoutClick?: () => void
): TopBarViewModel => {
  // Get name from JWT token
  let initialName = 'Usuário';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.nome) {
        initialName = payload.nome;
      }
    }
  } catch (err) {
    // ignore parsing errors
  }

  const [userInfo, setUserInfo] = useState<UserInfo>(
    initialUserInfo || { name: initialName }
  );

  // Nome e foto vêm do perfil (FE-004); o nome do token é o valor inicial
  useEffect(() => {
    if (initialUserInfo) return undefined;
    let alive = true;
    perfilService
      .get()
      .then((p) => alive && setUserInfo({ name: p.nome || initialName, avatar: p.fotoUrl ?? undefined }))
      .catch(() => undefined);
    const onUpdated = (e: Event) => {
      const d = (e as CustomEvent<{ nome: string; fotoUrl: string | null }>).detail;
      if (d) setUserInfo({ name: d.nome, avatar: d.fotoUrl ?? undefined });
    };
    window.addEventListener(PROFILE_UPDATED_EVENT, onUpdated);
    return () => {
      alive = false;
      window.removeEventListener(PROFILE_UPDATED_EVENT, onUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSupportClick = useCallback(() => {
    if (onSupportClick) {
      onSupportClick();
    }
  }, [onSupportClick]);

  const handleLogoutClick = useCallback(() => {
    if (onLogoutClick) {
      onLogoutClick();
    }
  }, [onLogoutClick]);

  return {
    userInfo,
    handleSupportClick,
    handleLogoutClick,
  };
};