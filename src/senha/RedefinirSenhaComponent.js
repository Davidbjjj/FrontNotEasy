import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RedefinirSenha.module.css";

export default function RedefinirSenha() {
  // Estados para armazenar as senhas digitadas
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const navigate = useNavigate(); // Usado para redirecionar para outra rota
  
  // Função para validar a senha de acordo com os critérios de segurança

  const validarSenha = (senha) => {
    const regras = [];
    if (senha.length < 8) regras.push("Mínimo de 8 caracteres");
    if (!/[A-Z]/.test(senha)) regras.push("Pelo menos 1 letra maiúscula");
    if (!/[a-z]/.test(senha)) regras.push("Pelo menos 1 letra minúscula");
    if (!/[0-9]/.test(senha)) regras.push("Pelo menos 1 número");
    if (!/[^A-Za-z0-9]/.test(senha)) regras.push("Pelo menos 1 caractere especial");
    return regras;
  };

  // Função que é chamada ao enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Valida a senha de acordo com os critérios de segurança
    const errosSenha = validarSenha(novaSenha);

    // Só prossegue se não houver erros e as senhas coincidirem
    if (errosSenha.length === 0 && novaSenha === confirmarSenha) {
      try {
        /**
         * ===> AQUI ENTRA SUA CHAMADA PARA O BACK-END <===
         * Exemplo com fetch:
         * 
         * const response = await fetch("http://seu-backend.com/auth/reset-password", {
         *   method: "POST",
         *   headers: { "Content-Type": "application/json" },
         *   body: JSON.stringify({ token: "TOKEN_DO_EMAIL", password: novaSenha })
         * });
         * 
         * if (!response.ok) {
         *   throw new Error("Erro ao redefinir a senha");
         * }
         */

        // Se a API retornar sucesso:
        alert("Senha redefinida com sucesso!");
        navigate("/login"); // Redireciona para a tela de login
      } catch (err) {
        // Se a API retornar erro (ex.: token inválido ou expirado)
        alert("Erro ao redefinir a senha. Verifique o link de recuperação.");
      }
    }
  };

  // Variável booleana que controla se o botão deve estar habilitado
  const senhaValida =
    validarSenha(novaSenha).length === 0 && novaSenha === confirmarSenha;

  const regras = [
    { ok: novaSenha.length >= 8, texto: "Mínimo de 8 caracteres" },
    { ok: /[A-Z]/.test(novaSenha), texto: "Pelo menos 1 letra maiúscula" },
    { ok: /[a-z]/.test(novaSenha), texto: "Pelo menos 1 letra minúscula" },
    { ok: /[0-9]/.test(novaSenha), texto: "Pelo menos 1 número" },
    { ok: /[^A-Za-z0-9]/.test(novaSenha), texto: "Pelo menos 1 caractere especial" },
  ];

  return (
    <main className={styles.page}>
      {/* Lado esquerdo com imagem ilustrativa (decorativa) */}
      <div className={styles.illustration}>
        <img src="/assets/redefinir-senha.png" alt="" />
      </div>

      {/* Lado direito com formulário */}
      <div className={styles.formSide}>
        <div className={styles.card}>
          <h1 className={styles.title}>Redefinir senha</h1>

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="nova-senha" className={styles.label}>Nova senha</label>
              <input
                id="nova-senha"
                type="password"
                autoComplete="new-password"
                aria-describedby="regras-senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmar-senha" className={styles.label}>Confirmar senha</label>
              <input
                id="confirmar-senha"
                type="password"
                autoComplete="new-password"
                aria-invalid={confirmarSenha !== "" && confirmarSenha !== novaSenha}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Checklist: estado dito em texto, não só por cor */}
            <ul id="regras-senha" className={styles.rules}>
              {regras.map((r) => (
                <li key={r.texto} className={r.ok ? styles.ok : styles.pending}>
                  <span aria-hidden="true">{r.ok ? "✓" : "•"}</span> {r.texto}
                  <span className="sr-only">{r.ok ? " (atendido)" : " (pendente)"}</span>
                </li>
              ))}
            </ul>

            <button type="submit" disabled={!senhaValida} className={styles.submit}>
              Confirmar
            </button>
          </form>

          <button type="button" onClick={() => navigate("/login")} className={styles.back}>
            Voltar para login
          </button>
        </div>
      </div>
    </main>
  );
}
