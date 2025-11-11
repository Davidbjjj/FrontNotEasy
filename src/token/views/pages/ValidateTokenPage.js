import React, { useState } from "react";
import api from '../../../services/apiClient';
import { useNavigate } from "react-router-dom";
import TokenValidationLayout from "../../presentation/components/TokenValidation/TokenValidationLayout";
import { useTokenState } from "../../../token/states/TokenState";

export default function ValidateTokenPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(45);
  const navigate = useNavigate();
  const { setToken } = useTokenState();

  const handleSubmit = async () => {
    try {
      const response = await api.post('/auth/validate-token', { token: tokenInput });

      if (response.data.valid) {
        setToken(tokenInput);
        navigate("/reset-password"); // redireciona
      } else {
        alert("Token inválido ou expirado!");
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      alert("Erro ao validar token!");
    }
  };

  const handleResend = () => {
    alert("Código reenviado!");
    setTimeLeft(45);
  };

  return (
    <TokenValidationLayout
      timeLeft={timeLeft}
      onResend={handleResend}
      onSubmit={handleSubmit}
      onTokenChange={setTokenInput}
      token={tokenInput}
    />
  );
}
