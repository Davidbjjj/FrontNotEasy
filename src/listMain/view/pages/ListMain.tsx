import React from 'react';
import VerticalNavbar from '../../../VerticalNavbar/presentation/components/VerticalNavbar';
import TopBar from '../../../TopBar/presentation/components/TopBar';
import QuestionList from '../../../listaQuestoes/presentation/components/QuestionList';
import './ListMain.css';

const ListMain: React.FC = () => {
  const handleNotificationClick = (notification: any) => {
    console.log('Notificação clicada:', notification);
  };

  const handleSupportClick = () => {
    console.log('Suporte clicado');
  };

  const handleLogoutClick = () => {
    console.log('Sair clicado');
  };

  const handleListClick = (list: any) => {
    console.log('Lista clicada:', list);
  };

  return (
    <div className="list-main">
      {/* Barra superior ocupa toda a largura */}
      <TopBar
        onNotificationClick={handleNotificationClick}
        onSupportClick={handleSupportClick}
        onLogoutClick={handleLogoutClick}
      />

      <div className="list-main__body">
        {/* Navbar lateral inicia abaixo da TopBar */}
        <VerticalNavbar />

        <main className="list-main__main">
          <div className="list-main__question-container">
            <QuestionList onListClick={handleListClick} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ListMain;
