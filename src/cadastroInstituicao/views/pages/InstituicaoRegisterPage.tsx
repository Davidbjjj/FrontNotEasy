import React from 'react';
import { useNavigate } from 'react-router-dom';
import InstituicaoRegisterComponent from '../../presentation/components/InstituicaoRegisterComponent';
import { useInstituicaoRegisterViewModel } from '../../viewmodels/instituicaoRegisterViewModel';

const InstituicaoRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, handleRegister } = useInstituicaoRegisterViewModel();

  const onRegister = async (data: any) => {
    const success = await handleRegister(data);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <InstituicaoRegisterComponent 
      onRegister={onRegister}
      loading={loading}
      error={error}
    />
  );
};

export default InstituicaoRegisterPage;
