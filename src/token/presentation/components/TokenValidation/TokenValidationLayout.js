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
       {/* Lado esquerdo */}
  <div className="left-section">
  <div className="imagem-letf">
    <div className="overlay">
      <img src="/Alunos.svg" alt="Background alunos" />
    </div>
    <div className="imagem-letf2">
      <div className="content-container">
        <img src="Rectangle 84.svg" alt="Logo Noteasy" className="logo-image" />
        <div className="text-overlay">
          <img src="LogoGGE.svg" alt="Icone Noteasy" className="icon-image" />
          <div className="text-content">
            Aqui, enquanto o(a) aluno(a) pratica,
            o(a) professor(a) descobre onde focar. {/* Adicione o texto que desejar */}
          </div>
        </div>
      </div>
    </div>
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