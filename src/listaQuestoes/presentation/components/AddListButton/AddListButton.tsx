import React from 'react';
import { Plus } from 'lucide-react';
import { useAddListButtonViewModel } from '../../../viewmodels/AddListButton.viewmodel';
import { getCurrentUser } from '../../../../auth/auth';
import type { AddListButtonProps } from '../../../model/AddListButton.types';
import CreateListModal from './CreateListModal';
import './AddListButton.css';

export const AddListButton: React.FC<AddListButtonProps> = ({
  className = '',
  professorId,
}) => {
  const {
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
  } = useAddListButtonViewModel({ professorId, className });

  // Ler role do token ou localStorage e normalizar para evitar exibição indevida
  const rawRole = getCurrentUser()?.role || localStorage.getItem('role') || '';
  const normalizedRole = String(rawRole).toUpperCase();
  const isProfessor = normalizedRole === 'PROFESSOR' || normalizedRole === 'TEACHER';

  if (!isProfessor) return null;

  return (
    <>
      <button
        className={`add-list-button ${className}`}
        onClick={openModal}
        type="button"
        disabled={isLoading}
      >
        <Plus size={20} />
        Adicionar Nova Lista
      </button>

      <CreateListModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateList}
        isLoading={isLoading}
        isLoadingDisciplinas={isLoadingDisciplinas}
        error={error}
        titulo={titulo}
        onTituloChange={setTitulo}
        disciplinas={disciplinas}
        selectedDisciplinaId={selectedDisciplinaId}
        onDisciplinaChange={setSelectedDisciplinaId}
      />
    </>
  );
};

export default AddListButton;