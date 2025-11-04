import axios from "axios";

const API_URL = "http://localhost:8080"

export const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: credentials.email,
        senha: credentials.password, 
      });

      const { token, email, id } = response.data;

      
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userId", id);

      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new Error("E-mail ou senha incorretos");
      } else {
        throw new Error("Erro ao tentar realizar login");
      }
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
  },
};