import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationComponent from '../../presentation/components/RegistrationComponent';
import { useRegistrationViewModel } from '../../viewmodels/registrationViewModel';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { loading, error, success, handleRegister } = useRegistrationViewModel();

  const onRegister = async (userData) => {
    const result = await handleRegister(userData);
    if (result && success) {
      // Redirecionar após um breve delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }
  };

  return (
    <RegistrationComponent 
      onRegister={onRegister}
      loading={loading}
      error={error}
      success={success}
    />
  );
};

export default RegistrationPage;