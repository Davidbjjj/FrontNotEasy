const API_URL = "https://backnoteasy-production.up.railway.app/auth";

export const AuthService = {
  validateToken: async (token) => {
    const response = await fetch(`${API_URL}/validate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return response.json();
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    return response.json();
  },
};
