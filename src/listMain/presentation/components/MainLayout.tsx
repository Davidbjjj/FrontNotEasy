// presentation/components/MainLayout.tsx
import React from 'react';
import VerticalNavbar from '../../../VerticalNavbar/presentation/components/VerticalNavbar';
import TopBar from '../../../TopBar/presentation/components/TopBar';
import { useAuth } from '../../../auth/AuthProvider';
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

  const { logout } = useAuth();

  const handleLogoutClick = () => {
    // call auth provider logout which will call server and clear storage
    try {
      logout();
    } catch (e) {
      console.error('Erro ao fazer logout', e);
      // fallback: clear local storage and redirect
      try {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } catch (err) {}
    }
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