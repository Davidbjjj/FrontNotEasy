import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import { authService } from '../../services/api/authService';

/**
 * Página de callback para autenticação GitHub OAuth
 * Recebe o código de autorização e faz a troca por um token
 */
const GitHubCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGitHubCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          message.error(`Erro de autenticação: ${error}`);
          navigate('/login');
          return;
        }

        if (!code) {
          message.error('Código de autorização não encontrado');
          navigate('/login');
          return;
        }

        // Faz login com GitHub usando o código
        await authService.loginWithGithub(code);
        message.success('Login com GitHub realizado com sucesso!');
        navigate('/listas');
      } catch (error) {
        console.error('GitHub callback error:', error);
        message.error(error.message || 'Erro ao autenticar com GitHub');
        navigate('/login');
      }
    };

    handleGitHubCallback();
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Spin size="large" tip="Autenticando com GitHub..." />
    </div>
  );
};

export default GitHubCallbackPage;
