// presentation/components/MainLayout.tsx
import React from 'react';
import VerticalNavbar from '../../../VerticalNavbar/presentation/components/VerticalNavbar';
import TopBar from '../../../TopBar/presentation/components/TopBar';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayoutComponent: React.FC<MainLayoutProps> = ({ children }) => {
  const handleNotificationClick = (notification: any) => {
    console.log('Notificação clicada:', notification);
  };

  const handleSupportClick = () => {
    console.log('Suporte clicado');
  };

  const handleLogoutClick = () => {
    console.log('Sair clicado');
  };

  return (
    <div className="main-layout">
      {/* Barra superior ocupa toda a largura */}
      <TopBar
        onNotificationClick={handleNotificationClick}
        onSupportClick={handleSupportClick}
        onLogoutClick={handleLogoutClick}
      />

      <div className="main-layout__body">
        {/* Navbar lateral inicia abaixo da TopBar */}
        <VerticalNavbar />

        <main className="main-layout__main">
          <div className="main-layout__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Memoizar para evitar re-renderizações quando as páginas filhas mudam
const MainLayout = React.memo(MainLayoutComponent);

export default MainLayout;