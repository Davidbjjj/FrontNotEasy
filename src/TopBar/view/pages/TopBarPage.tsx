import React from 'react';
import TopBar from '../../presentation/components/TopBar';

const TopBarPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const handleNotificationClick = (notification: any) => {
    console.log('Notificação clicada:', notification);
  };

  const handleSupportClick = () => {
    console.log('Suporte clicado');
  };

  const handleLogoutClick = () => {
    // If running inside app with AuthProvider, call logout via custom event
    // This demo page may not have the provider mounted; just attempt graceful fallback
    try {
      // Try to get a global hook first
      const event = new CustomEvent('app-logout');
      window.dispatchEvent(event);
    } catch (e) {
      console.log('Sair clicado');
    }
  };

  return (
    <div style={{ display: 'flex' }}>

      <div style={{ marginLeft: '100px', flex: 1 }}>
        <TopBar
          onNotificationClick={handleNotificationClick}
          onSupportClick={handleSupportClick}
          onLogoutClick={handleLogoutClick}
        />
        <main style={{ marginTop: '70px', padding: '20px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default TopBarPage;