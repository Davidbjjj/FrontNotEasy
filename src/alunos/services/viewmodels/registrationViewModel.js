import { useState } from 'react';
import { userService } from '../services/api/userService';

export const useRegistrationViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (userData) => {
    // Validação de senha
    if (userData.senha !== userData.confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.register(userData);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    handleRegister
  };
};