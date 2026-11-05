import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import RouterConfig from "./RouterConfig";
import MainLayout from "./listMain/presentation/components/MainLayout";
import { useLocation } from 'react-router-dom';
import ErrorBoundary from './errors/ErrorBoundary';
import ConnectionBanner from './errors/ConnectionBanner';
import SessionExpiredDialog from './errors/SessionExpiredDialog';

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

  const routes = (
    <ErrorBoundary resetKey={location.pathname}>
      <RouterConfig />
    </ErrorBoundary>
  );
  const content = hideLayout ? routes : <MainLayout>{routes}</MainLayout>;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ConnectionBanner />
      <SessionExpiredDialog />
      {content}
    </GoogleOAuthProvider>
  );
};

export default App;
