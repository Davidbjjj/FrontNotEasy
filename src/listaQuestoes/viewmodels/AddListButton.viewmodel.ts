import { useState } from 'react';
import { listaService } from './../services/api/listaService';
// removed unused eventoService import
import { professorService } from './../services/api/professorService';
import type { 
  CreateListRequest, 
  ListaResponseDTO, 
  DisciplinaProfessorResponseDTO,
  AddListButtonProps 
} from './../model/AddListButton.types';

export const useAddListButtonViewModel = (props: AddListButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disciplinas, setDisciplinas] = useState<DisciplinaProfessorResponseDTO[]>([]);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>('');
  const [titulo, setTitulo] = useState('');

  const openModal = async () => {
    setIsModalOpen(true);
    try {
      document.body.classList.add('modal-open');
    } catch (err) {
      // ignore
    }
    setError(null);
    await loadDisciplinas();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    try {
      document.body.classList.remove('modal-open');
    } catch (err) {
      // ignore
    }
    setTitulo('');
    setSelectedDisciplinaId('');
    setError(null);
  };

  const loadDisciplinas = async () => {
    try {
      setIsLoadingDisciplinas(true);
      const disciplinasData = await professorService.getDisciplinasByProfessor(props.professorId);
      setDisciplinas(disciplinasData);
    } catch (err) {
      setError('Erro ao carregar disciplinas');
      console.error('Erro ao carregar disciplinas:', err);
    } finally {
      setIsLoadingDisciplinas(false);
    }
  };

  const handleCreateList = async (): Promise<ListaResponseDTO | null> => {
    if (!titulo.trim() || !selectedDisciplinaId) {
      setError('Preencha todos os campos obrigatórios');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const createListRequest: CreateListRequest = {
        titulo: titulo.trim(),
        professorId: props.professorId,
        disciplinaId: selectedDisciplinaId
      };

      const response = await listaService.criarListaComDisciplina(createListRequest);

      // Nota: anteriormente criávamos um evento automaticamente para professores aqui.
      // Agora a criação automática foi movida para a camada de apresentação (AddListButton)
      // para perguntar ao usuário se deseja criar uma atividade associada à lista.

      closeModal();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar lista';
      setError(errorMessage);
      console.error('Erro ao criar lista:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isModalOpen,
    isLoading,
    isLoadingDisciplinas,
    error,
    disciplinas,
    selectedDisciplinaId,
    titulo,
    openModal,
    closeModal,
    setTitulo,
    setSelectedDisciplinaId,
    handleCreateList
  };
};