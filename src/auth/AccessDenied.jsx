import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';

const AccessDenied = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="access-denied">
      <div className="access-denied-container">
        <div className="access-denied-icon">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" 
              fill="#EF4444"
            />
            <path 
              d="M4 4L20 20" 
              stroke="#EF4444" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="access-denied-title">Acesso Negado</h1>
        
        <p className="access-denied-message">
          Você precisa estar autenticado para acessar esta página.
        </p>

        <p className="access-denied-submessage">
          Por favor, faça login com suas credenciais ou retorne à página inicial.
        </p>

        <div className="access-denied-actions">
          <button 
            className="btn-primary" 
            onClick={handleGoToLogin}
          >
            Fazer Login
          </button>
          <button 
            className="btn-secondary" 
            onClick={handleGoHome}
          >
            Voltar ao Início
          </button>
        </div>

        <div className="access-denied-help">
          <p>Precisa de ajuda? <a href="mailto:suporte@noteasy.com">Entre em contato</a></p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
