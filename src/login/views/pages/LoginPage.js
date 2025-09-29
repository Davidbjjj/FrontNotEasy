import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginComponent from '../../presentation/components/LoginComponent';
import { useLoginViewModel } from '../../viewmodels/loginViewModel';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loading, error, handleLogin } = useLoginViewModel();

  const onLogin = async (credentials) => {
    const success = await handleLogin(credentials);
    if (success) {
      navigate("/home");
    }
  };

  return (
    <LoginComponent 
      onLogin={onLogin}
      loading={loading}
      error={error}
    />
  );
};

export default LoginPage;