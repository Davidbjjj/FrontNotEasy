import { useState } from 'react';
import { serviceIAService } from './../services/api/serviceIAService';
import type { ProcessarPDFResponse } from './../model/AddQuestionsButton.types';

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

  const handleProcessPDF = async (): Promise<ProcessarPDFResponse | null> => {
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
      closeModal();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar PDF';
      setError(errorMessage);
      console.error('Erro ao processar PDF:', err);
      return null;
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