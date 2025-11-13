import React from "react";
import RouterConfig from "./RouterConfig";
import MainLayout from "./listMain/presentation/components/MainLayout";
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();

  // Rotas onde o layout (header + navbar) deve ser oculto
  const noLayoutPaths = [
    '/',
    '/login',
    '/redefinir-senha',
    '/reset-password',
    '/validar-token'
  ];

  const hideLayout = noLayoutPaths.includes(location.pathname);

  if (hideLayout) {
    return <RouterConfig />;
  }

  return (
    <MainLayout>
      <RouterConfig />
    </MainLayout>
  );
};

export default App;
