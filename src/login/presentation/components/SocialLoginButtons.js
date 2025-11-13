import React from 'react';
import { Button, Space, Divider, message } from 'antd';
import { GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import styles from "./Login.module.css";

/**
 * Componente de Login Social
 * Suporta Google e GitHub
 */
export const SocialLoginButtons = ({ onGoogleSuccess, onGoogleError, onGitHubClick }) => {
  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      console.log('Google Token:', token);
      if (onGoogleSuccess) {
        onGoogleSuccess(token);
      }
      message.success('Login com Google realizado!');
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      message.error('Erro ao fazer login com Google');
    }
  };

  const handleGoogleError = () => {
    console.log('Google Login Failed');
    if (onGoogleError) {
      onGoogleError();
    }
    message.error('Falha ao fazer login com Google');
  };

  const handleGitHubClick = () => {
    // Redireciona para GitHub OAuth
    // Você precisa configurar as credenciais no GitHub
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
    const redirectUri = process.env.REACT_APP_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;
    const scope = 'user:email';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    if (onGitHubClick) {
      onGitHubClick();
    }
    window.location.href = githubAuthUrl;
  };

  return (
    <div className={styles.socialLoginContainer}>
      <Divider plain>OU</Divider>
      
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin"
            logo_alignment="center"
          />
        </div>

        <Button
          size="large"
          block
          icon={<GithubOutlined />}
          onClick={handleGitHubClick}
          className={styles.githubBtn}
        >
          Entrar com GitHub
        </Button>
      </Space>
    </div>
  );
};

export default SocialLoginButtons;
