import React, { useState } from "react";
import { useTokenState } from "../../states/TokenState";
import { useResetPasswordViewModel } from "../../viewmodels/ResetPasswordViewModel";

export default function ResetPasswordPage() {
  const { token } = useTokenState();
  const [newPassword, setNewPassword] = useState("");
  const { loading, message, handleResetPassword } = useResetPasswordViewModel(token);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-xl font-bold mb-4">Redefinir Senha</h1>
      <p className="text-sm mb-4 text-gray-600">Token: {token}</p>
      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border p-2 rounded w-64 mb-4"
      />
      <button
        onClick={() => handleResetPassword(newPassword)}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Enviando..." : "Redefinir Senha"}
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}