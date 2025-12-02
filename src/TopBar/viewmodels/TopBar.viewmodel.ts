import { useState, useCallback } from 'react';
import { UserInfo, Notification, TopBarViewModel } from '../model/TopBar.types';
import { decodeJwt } from '../../auth/jwt';

export const useTopBarViewModel = (
  initialUserInfo?: UserInfo,
  initialNotifications?: Notification[],
  onNotificationClick?: (notification: Notification) => void,
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

  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications || [
      {
        id: '1',
        title: 'Nova mensagem',
        message: 'Você tem uma nova mensagem não lida',
        read: false,
        timestamp: new Date(),
      },
      {
        id: '2',
        title: 'Atualização do sistema',
        message: 'Sistema será atualizado às 02:00',
        read: false,
        timestamp: new Date(Date.now() - 3600000),
      },
    ]
  );

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      // Marcar como lida
      setNotifications(prev =>
        prev.map(item =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );

      if (onNotificationClick) {
        onNotificationClick(notification);
      }
    },
    [onNotificationClick]
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

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen(prev => !prev);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  return {
    userInfo,
    notifications,
    unreadCount,
    isNotificationsOpen,
    handleNotificationClick,
    handleSupportClick,
    handleLogoutClick,
    toggleNotifications,
    markAllAsRead,
  };
};