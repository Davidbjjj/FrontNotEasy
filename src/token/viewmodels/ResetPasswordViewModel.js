import { useState } from "react";
import { AuthService } from "../services/api/AuthService";

export const useResetPasswordViewModel = (token) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (newPassword) => {
    setLoading(true);
    try {
      const response = await AuthService.resetPassword(token, newPassword);
      if (response.success) {
        setMessage("Senha redefinida com sucesso!");
      } else {
        setMessage("Erro ao redefinir senha.");
      }
    } catch {
      setMessage("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, message, handleResetPassword };
};
