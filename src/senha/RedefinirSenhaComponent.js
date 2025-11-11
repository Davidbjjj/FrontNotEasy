import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Lado esquerdo com imagem ilustrativa */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-white">
        <img
          src="/assets/redefinir-senha.png"
          alt="GGE Noteasy"
          className="max-w-md"
        />
      </div>

      {/* Lado direito com formulário */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Redefinir senha</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo de nova senha */}
            <div>
              <input
                type="password"
                placeholder="Nova Senha"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            {/* Campo de confirmar senha */}
            <div>
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            {/* Checklist de validação visual */}
            <ul className="text-sm space-y-1">
              <li className={novaSenha.length >= 8 ? "text-green-600" : "text-red-500"}>
                • Mínimo de 8 caracteres
              </li>
              <li className={/[A-Z]/.test(novaSenha) ? "text-green-600" : "text-red-500"}>
                • Pelo menos 1 letra maiúscula
              </li>
              <li className={/[a-z]/.test(novaSenha) ? "text-green-600" : "text-red-500"}>
                • Pelo menos 1 letra minúscula
              </li>
              <li className={/[0-9]/.test(novaSenha) ? "text-green-600" : "text-red-500"}>
                • Pelo menos 1 número
              </li>
              <li className={/[^A-Za-z0-9]/.test(novaSenha) ? "text-green-600" : "text-red-500"}>
                • Pelo menos 1 caractere especial
              </li>
            </ul>

            {/* Botão de confirmar (só habilita se senha for válida) */}
            <button
              type="submit"
              disabled={!senhaValida}
              className={`w-full py-2 px-4 rounded text-white ${
                senhaValida ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"
              }`}
            >
              Confirmar
            </button>
          </form>

          {/* Botão para voltar ao login */}
          <button
            onClick={() => navigate("/login")}
            className="mt-4 text-sm text-red-600 hover:underline"
          >
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
}
