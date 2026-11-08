import React, { useEffect, useRef, useState } from "react";
import { HelpCircle, LogOut } from "lucide-react";
import GlobalSearch from "../../../busca/GlobalSearch";
import NotificationBell from "../../../notifications/NotificationBell";
import { useTopBarViewModel } from "../../viewmodels/TopBar.viewmodel";
import { requestTourRestart } from "../../../onboarding/onboardingStorage";
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

  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  // Fecha o menu de ajuda com Esc (devolvendo o foco ao botão) ou clique fora
  useEffect(() => {
    if (!helpOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelpOpen(false);
        helpButtonRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [helpOpen]);

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
          {currentUserInfo.avatar ? (
            <img src={currentUserInfo.avatar} alt="" className="top-bar__user-photo" />
          ) : (
            getUserInitials(currentUserInfo.name)
          )}
        </div>
        <span className="top-bar__user-name">{currentUserInfo.name}</span>
      </div>

      {/* Busca global (FE-007) */}
      <GlobalSearch />

      {/* Ações no lado direito */}
      <div className="top-bar__actions">
        {/* Notificações (FE-003) */}
        <div data-tour="notifications">
          <NotificationBell />
        </div>

        {/* Ajuda: rever o tour e suporte */}
        <div className="top-bar__help" ref={helpRef} data-tour="help-menu">
          <button
            ref={helpButtonRef}
            className="top-bar__action"
            onClick={() => setHelpOpen((o) => !o)}
            type="button"
            aria-label="Ajuda"
            aria-haspopup="menu"
            aria-expanded={helpOpen}
          >
            <HelpCircle size={20} />
            <span>Ajuda</span>
          </button>
          {helpOpen && (
            <div className="top-bar__menu" role="menu" aria-label="Ajuda">
              <button
                type="button"
                role="menuitem"
                className="top-bar__menu-item"
                onClick={() => {
                  setHelpOpen(false);
                  requestTourRestart();
                }}
              >
                Rever tour guiado
              </button>
              <button
                type="button"
                role="menuitem"
                className="top-bar__menu-item"
                onClick={() => {
                  setHelpOpen(false);
                  handleSupportClick();
                }}
              >
                Suporte
              </button>
            </div>
          )}
        </div>

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