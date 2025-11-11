/**
 * ViewModel hook para gerenciar estado de Disciplinas
 */

import { useState, useEffect, useCallback } from 'react';
import { disciplinaService } from '../services/api/disciplina.service';
import type { Disciplina } from '../model/Disciplina';

export const useDisciplinaViewModel = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [filteredDisciplinas, setFilteredDisciplinas] = useState<Disciplina[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Obter userId e role do localStorage
  const userId = localStorage.getItem('userId') || '';
  const role = localStorage.getItem('role') || 'ESTUDANTE';

  // Fetch disciplinas
  const fetchDisciplinas = useCallback(async () => {
    if (!userId) {
      setError('UserId não encontrado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await disciplinaService.getDisciplinas(userId, role);
      setDisciplinas(data);
      setFilteredDisciplinas(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar disciplinas';
      setError(errorMessage);
      console.error('Erro ao buscar disciplinas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role]);

  // Carregar disciplinas no mount
  useEffect(() => {
    fetchDisciplinas();
  }, [fetchDisciplinas]);

  // Filtrar disciplinas por termo de busca
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    
    const filtered = disciplinas.filter((disciplina) => {
      const searchLower = term.toLowerCase();
      return (
        disciplina.nome.toLowerCase().includes(searchLower) ||
        disciplina.nomeProfessor.toLowerCase().includes(searchLower) ||
        disciplina.nomeEscola.toLowerCase().includes(searchLower)
      );
    });

    setFilteredDisciplinas(filtered);
  }, [disciplinas]);

  // Recarregar disciplinas
  const reload = useCallback(() => {
    fetchDisciplinas();
  }, [fetchDisciplinas]);

  return {
    disciplinas: filteredDisciplinas,
    isLoading,
    error,
    searchTerm,
    handleSearch,
    reload,
    userRole: role,
  };
};
