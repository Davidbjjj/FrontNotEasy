// Define a estrutura dos dados esperados do backend
export const createDesempenhoModel = (data) => ({
  notaLista: data.notaLista || 0,
  percentualAcertos: data.percentualAcertos || 0,
  totalQuestoes: data.totalQuestoes || 0,
  questoesRespondidas: data.questoesRespondidas || 0,
  questoes: data.questoes || [],
});
