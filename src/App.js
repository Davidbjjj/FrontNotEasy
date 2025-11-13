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
    '/redefinir-senha',
    '/reset-password',
    '/validar-token'
  ];

  const hideLayout = noLayoutPaths.includes(location.pathname);

  // Inicializa Google OAuth Provider
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  const content = hideLayout ? <RouterConfig /> : <MainLayout><RouterConfig /></MainLayout>;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );
};

export default App;
