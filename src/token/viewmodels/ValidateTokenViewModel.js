import { useState } from "react";
import { AuthService } from "../services/api/AuthService";

export const useValidateTokenViewModel = (setToken, navigate) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleValidateToken = async (tokenValue) => {
    setLoading(true);
    try {
      const response = await AuthService.validateToken(tokenValue);

      if (response.valid === true) {
        setMessage("✅ Token válido!");
        setToken(tokenValue); 
        navigate("/reset-password");
      } else {
        setMessage(response.message || "Token inválido ou expirado.");
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      setMessage("Erro ao validar token. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, message, handleValidateToken };
};
