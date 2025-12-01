import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import RouterConfig from "./RouterConfig";
import MainLayout from "./listMain/presentation/components/MainLayout";
import { useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();

  // Rotas onde o layout (header + navbar) deve ser oculto
  const noLayoutPaths = [
    '/',
    '/login',
    '/cadastro-instituicao',
    '/redefinir-senha',
    '/reset-password',
    '/validar-token'
  ];

  const hideLayout = noLayoutPaths.includes(location.pathname);

  // Inicializa Google OAuth Provider
  const googleClientId = '197044467131-mmc55c92o7o61sgmenfc9u0c6h3gfco0.apps.googleusercontent.com';

  const content = hideLayout ? <RouterConfig /> : <MainLayout><RouterConfig /></MainLayout>;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );
};

export default App;
