import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal/Modal';
import { Button } from '../ui/Button/Button';
import { SESSION_EXPIRED_EVENT } from '../auth/session';

/**
 * Avisa que a sessão expirou e leva ao login; o destino de retorno já foi
 * guardado em notifySessionExpired() e é consumido após o novo login.
 */
const SessionExpiredDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onExpired = () => setOpen(true);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const goToLogin = () => {
    setOpen(false);
    navigate('/login');
  };

  return (
    <Modal
      open={open}
      size="sm"
      title="Sua sessão expirou"
      onClose={goToLogin}
      closeOnOverlayClick={false}
      footer={<Button onClick={goToLogin}>Entrar novamente</Button>}
    >
      <p style={{ margin: 0 }}>
        Por segurança, você precisa entrar de novo. Depois do login você volta para a página em que estava.
      </p>
    </Modal>
  );
};

export default SessionExpiredDialog;
