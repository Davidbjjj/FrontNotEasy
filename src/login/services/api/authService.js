export const authService = {
  async login(credentials) {
    // Simulação de API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          localStorage.setItem('token', 'fake-jwt-token');
          resolve(true);
        } else {
          reject(new Error('Credenciais inválidas'));
        }
      }, 1000);
    });
  },

  logout() {
    localStorage.removeItem('token');
  }
};