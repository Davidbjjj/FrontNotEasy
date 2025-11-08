import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { useAddQuestionsButtonViewModel } from '../../../viewmodels/AddQuestionsButton.viewmodel';
import type { AddQuestionsButtonProps } from '../../../model/AddQuestionsButton.types';
import AddQuestionsModal from './AddQuestionsModal';
import './AddQuestionsButton.css';

export const AddQuestionsButton: React.FC<AddQuestionsButtonProps> = ({
  listaId,
  className = '',
  onQuestionsAdded,
}) => {
  const {
    isModalOpen,
    isLoading,
    error,
    selectedFile,
    openModal,
    closeModal,
    handleFileSelect,
    handleProcessPDF
  } = useAddQuestionsButtonViewModel(listaId);

  const handleSuccess = () => {
    if (onQuestionsAdded) {
      onQuestionsAdded();
    }
    closeModal(); // Fechar modal após sucesso
  };

  return (
    <>
      <button
        className={`add-questions-button ${className}`}
        onClick={openModal}
        type="button"
        disabled={isLoading}
      >
        <FileText size={18} />
        Adicionar Questões
      </button>

      {isModalOpen && (
        <AddQuestionsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleProcessPDF}
          onSuccess={handleSuccess}
          isLoading={isLoading}
          error={error}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
        />
      )}
    </>
  );
};

export default AddQuestionsButton;