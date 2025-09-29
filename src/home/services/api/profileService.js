// Serviço para gerenciar perfis (mock data por enquanto)
export const profileService = {
  async getProfiles() {
    // Simulação de API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: "Jose Almeida",
            job: "ETE PORTO DIGITAL",
            description: "Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos cu eum an brute copiosae hendrerit.",
            imgSrc: "https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg",
            isSelected: false,
            isExpanded: false
          },
          {
            id: 2,
            name: "Jose Almeida",
            job: "ETE PORTO DIGITAL",
            description: "Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos cu eum an brute copiosae hendrerit.",
            imgSrc: "https://static.vecteezy.com/ti/vetor-gratis/p1/11186876-simbolo-de-foto-de-perfil-masculino-vetor.jpg",
            isSelected: false,
            isExpanded: false
          },
          // Adicione mais perfis conforme necessário
        ]);
      }, 500);
    });
  },

  async getProfileById(id) {
    // Implementar busca por ID
  },

  async updateProfile(profileData) {
    // Implementar atualização de perfil
  }
};