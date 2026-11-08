import React from "react";
import { HelpCircle, LogOut } from "lucide-react";
import NotificationBell from "../../../notifications/NotificationBell";
import { useTopBarViewModel } from "../../viewmodels/TopBar.viewmodel";
import { TopBarProps } from "../../model/TopBar.types";
import "./TopBar.css";

export const TopBar: React.FC<TopBarProps> = ({
  userInfo,
  onSupportClick,
  onLogoutClick,
  className = "",
}) => {
  const {
    userInfo: currentUserInfo,
    handleSupportClick,
    handleLogoutClick,
  } = useTopBarViewModel(userInfo, onSupportClick, onLogoutClick);

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
        {/* Notificações (FE-003) */}
        <NotificationBell />

        {/* Suporte */}
        <button
          className="top-bar__action"
          onClick={handleSupportClick}
          type="button"
          aria-label="Suporte"
        >
          <HelpCircle size={20} />
          <span>Suporte</span>
        </button>

        {/* Sair */}
        <button
          className="top-bar__action"
          onClick={handleLogoutClick}
          type="button"
          aria-label="Sair"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;