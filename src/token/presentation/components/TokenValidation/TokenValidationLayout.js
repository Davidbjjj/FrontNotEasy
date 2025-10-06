import React from "react";
import "./styles.css";
import TokenInput from "./TokenInput";
import Timer from "./Timer";

export default function TokenValidationLayout({
  timeLeft,
  onResend,
  onSubmit,
  onTokenChange,
  token
}) {
  return (
    <div className="validation-container">
      {/* Lado esquerdo - Nova abordagem */}
      <div className="left-section">
        <div className="log-tag">
            <image src="/Rectangle 84.svg" alt="Logo Noteasy" className="logo-image" />
            <div>
                <image src="/Alunos.svg" alt="Logo GGE" className="logo-image" />
            </div>
        </div>
      < div className="imagem-letf">
        
        <img src="/Alunos.svg" alt="Logo GGE" className="logo-image" />
      </div>
        
      </div>

      {/* Lado direito */}
      <div className="right-section">
        <div className="validation-card">
          <h2 className="title">Validação</h2>
          <p className="instructions">
            Um código de verificação foi enviado para o seu e-mail.<br />
            Digite o código no campo abaixo:
          </p>

          <TokenInput length={6} onChange={onTokenChange} value={token} />

          <div className="timer-text">
            {timeLeft > 0 ? (
              <>Aguarde para reenviar código em <Timer timeLeft={timeLeft} /></>
            ) : (
              <button className="resend-btn" onClick={onResend}>Reenviar código</button>
            )}
          </div>

          <p className="support-text">
            Em caso de problemas, entre em contato com o suporte técnico:
            <a href="mailto:suporte@noteasy.com">suporte@noteasy.com</a>
          </p>

          <button className="submit-btn" onClick={onSubmit}>Validar Código</button>
        </div>
      </div>
    </div>
  );
}