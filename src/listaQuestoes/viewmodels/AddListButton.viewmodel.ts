import { useState } from 'react';
import { listaService } from './../services/api/listaService';
import { eventoService } from '../../Atividade/services/api/eventoService';
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
        // se for professor, criar evento automaticamente e associar a lista
        const role = localStorage.getItem('role') || '';
        if (role === 'PROFESSOR') {
          try {
            const payload = {
              titulo: `Prova - ${createListRequest.titulo}`,
              descricao: createListRequest.titulo,
              notaMaxima: 10,
              data: new Date().toISOString(),
              disciplinaId: createListRequest.disciplinaId,
              arquivos: [] as string[],
            };

            const evento = await eventoService.criarEvento(payload);
            // A API do backend retorna idEvento (conforme especificado). Tenta extrair o id.
            const eventoId = (evento && (evento.idEvento || (evento as any).id)) as string | number;
            if (eventoId) {
              await eventoService.associarLista(eventoId, response.id);
              console.log('Lista associada ao evento:', eventoId);
            } else {
              console.warn('Evento criado mas não retornou idEvento:', evento);
            }
          } catch (err) {
            console.error('Erro ao criar/associar evento automaticamente:', err);
          }
        }

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