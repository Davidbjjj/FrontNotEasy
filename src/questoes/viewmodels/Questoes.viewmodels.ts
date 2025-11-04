// src/viewmodels/Questoes.viewmodels.ts

import { useState, useCallback, useEffect } from 'react';
import { QuestaoEstudante, QuestaoLandingViewModel } from '../model/Questoes.types';
import { questoesService } from '../service/api/questoes.service';

export const useQuestoesViewModel = (
  estudanteId: string,
  onQuestaoSelect?: (questaoId: number) => void
): QuestaoLandingViewModel => {
  const [questoes, setQuestoes] = useState<QuestaoEstudante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarQuestoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const questoesData = await questoesService.getQuestoesPorEstudante(estudanteId);
      
      // Carregar respostas para cada questão
      const questoesComRespostas = await Promise.all(
        questoesData.map(async (questao) => {
          try {
            const resposta = await questoesService.getRespostaQuestao(questao.id, estudanteId);
            return {
              ...questao,
              respondida: true,
              correta: resposta.correta,
              respostaEstudante: resposta.alternativa
            };
          } catch {
            return {
              ...questao,
              respondida: false,
              correta: false,
              respostaEstudante: undefined
            };
          }
        })
      );
      
      setQuestoes(questoesComRespostas);
    } catch (err) {
      setError('Erro ao carregar questões');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [estudanteId]);

  const handleQuestaoSelect = useCallback((questaoId: number) => {
    if (onQuestaoSelect) {
      onQuestaoSelect(questaoId);
    }
  }, [onQuestaoSelect]);

  const handleRefresh = useCallback(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  // Carregar questões no início
  useEffect(() => {
    carregarQuestoes();
  }, [carregarQuestoes]);

  return {
    questoes,
    loading,
    error,
    handleQuestaoSelect,
    handleRefresh,
  };
};