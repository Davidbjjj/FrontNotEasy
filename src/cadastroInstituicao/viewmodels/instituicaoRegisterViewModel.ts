import { useState } from 'react';
import { instituicaoRegisterService } from '../services/api/instituicaoRegisterService';
import type { InstituicaoRegisterData } from '../model/InstituicaoModel';

export const useInstituicaoRegisterViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (data: InstituicaoRegisterData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await instituicaoRegisterService.registerInstituicao(data);
      setSuccess(true);
      return true;
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao cadastrar instituição';
      setError(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    handleRegister,
  };
};
