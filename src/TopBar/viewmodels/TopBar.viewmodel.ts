import { useState, useCallback } from 'react';
import { UserInfo, TopBarViewModel } from '../model/TopBar.types';
import { decodeJwt } from '../../auth/jwt';

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

  const [userInfo] = useState<UserInfo>(
    initialUserInfo || { name: initialName }
  );

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