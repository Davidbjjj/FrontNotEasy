import React from "react";
import { Bell, HelpCircle, LogOut } from "lucide-react";
import { useTopBarViewModel } from "../../viewmodels/TopBar.viewmodel";
import { TopBarProps } from "../../model/TopBar.types";
import "./TopBar.css";

export const TopBar: React.FC<TopBarProps> = ({
  userInfo,
  notifications,
  onNotificationClick,
  onSupportClick,
  onLogoutClick,
  className = "",
}) => {
  const {
    userInfo: currentUserInfo,
    notifications: currentNotifications,
    unreadCount,
    isNotificationsOpen,
    handleNotificationClick,
    handleSupportClick,
    handleLogoutClick,
    toggleNotifications,
    markAllAsRead,
  } = useTopBarViewModel(
    userInfo,
    notifications,
    onNotificationClick,
    onSupportClick,
    onLogoutClick
  );

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes} min atrás`;
    } else if (hours < 24) {
      return `${hours} h atrás`;
    } else {
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className={`top-bar ${className}`}>
      {/* Perfil do usuário no lado esquerdo */}
      <div className="top-bar__user-info">
        <div className="top-bar__user-avatar">
          {getUserInitials(currentUserInfo.name)}
        </div>
        <span className="top-bar__user-name">{currentUserInfo.name}</span>
      </div>

      {/* Ações no lado direito */}
      <div className="top-bar__actions">
        {/* Notificações */}
        <div className="top-bar__action-container">
          <button
            className={`top-bar__action top-bar__action--notifications ${
              isNotificationsOpen ? 'top-bar__action--active' : ''
            }`}
            onClick={toggleNotifications}
            type="button"
          >
            <Bell size={20} />
            <span>Notificações</span>
            {unreadCount > 0 && (
              <span className="top-bar__notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="top-bar__notifications-dropdown">
              <div className="top-bar__notifications-header">
                <h3 className="top-bar__notifications-title">Notificações</h3>
                {unreadCount > 0 && (
                  <button
                    className="top-bar__mark-all-read"
                    onClick={markAllAsRead}
                    type="button"
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>
              <div className="top-bar__notifications-list">
                {currentNotifications.length > 0 ? (
                  currentNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`top-bar__notification-item ${
                        !notification.read ? 'top-bar__notification-item--unread' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <h4 className="top-bar__notification-title">
                        {notification.title}
                      </h4>
                      <p className="top-bar__notification-message">
                        {notification.message}
                      </p>
                      <p className="top-bar__notification-time">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="top-bar__empty-notifications">
                    Nenhuma notificação
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Suporte */}
        <button
          className="top-bar__action"
          onClick={handleSupportClick}
          type="button"
        >
          <HelpCircle size={20} />
          <span>Suporte</span>
        </button>

        {/* Sair */}
        <button
          className="top-bar__action"
          onClick={handleLogoutClick}
          type="button"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;