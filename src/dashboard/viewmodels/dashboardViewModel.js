import { useEffect, useState } from "react";
import { DesempenhoService } from "../services/dashboardService";

export const useDesempenhoViewModel = (listId, estudanteId) => {
  const [desempenho, setDesempenho] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDesempenho = async () => {
      try {
        const dados = await DesempenhoService.buscarDesempenho(listId, estudanteId);
        setDesempenho(dados);
      } catch (error) {
        console.error("Erro ao carregar desempenho:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDesempenho();
  }, [listId, estudanteId]);

  return { desempenho, loading };
};
