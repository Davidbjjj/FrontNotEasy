import { useState } from 'react';
import { message } from 'antd';
import { serviceIAService } from './../services/api/serviceIAService';

export const useAddQuestionsButtonViewModel = (listaId: string) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const openModal = () => {
    // Abre o modal normalmente (permitir abertura mesmo que outro modal exista)
    setIsModalOpen(true);
    // marca no body que um modal está aberto para desativar hover/interações na lista
    try {
      document.body.classList.add('modal-open');
    } catch (err) {
      // ignore
    }
    setError(null);
    setSelectedFile(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setError(null);
    try {
      document.body.classList.remove('modal-open');
    } catch (err) {
      // ignore
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleProcessPDF = async (): Promise<boolean | null> => {
    if (!selectedFile) {
      setError('Selecione um arquivo PDF');
      return null;
    }

    // Verificar se é um PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF');
      return null;
    }

    // Verificar tamanho do arquivo (opcional: limite de 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 10MB');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await serviceIAService.processarPDF(listaId, selectedFile);
      // Se chegou aqui, é sucesso (200)
      const success = !!response && (response.questoesAdicionadas !== undefined ? response.questoesAdicionadas >= 0 : true);
      
      if (success) {
        message.success('Questões adicionadas com sucesso!');
        closeModal();
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro ao processar as questões';
      setError(errorMessage);
      message.error(errorMessage);
      console.error('Erro ao processar PDF:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isModalOpen,
    isLoading,
    error,
    selectedFile,
    openModal,
    closeModal,
    handleFileSelect,
    handleProcessPDF
  };
};