import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAddListButtonViewModel } from '../../../viewmodels/AddListButton.viewmodel';
import { eventoService } from '../../../../Atividade/services/api/eventoService';
import { getCurrentUser } from '../../../../auth/auth';
import type { AddListButtonProps } from '../../../model/AddListButton.types';
import CreateListModal from './CreateListModal';
import ConfirmCreateActivityModal from './ConfirmCreateActivityModal';
import Toast from '../../../../components/Toast';
import './AddListButton.css';

export const AddListButton: React.FC<AddListButtonProps> = ({
  className = '',
  professorId,
  onCreated,
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

  const [createdList, setCreatedList] = useState<any | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ler role do token ou localStorage e normalizar para evitar exibição indevida
  const rawRole = getCurrentUser()?.role || localStorage.getItem('role') || '';
  const normalizedRole = String(rawRole).toUpperCase();
  const isProfessor = normalizedRole === 'PROFESSOR' || normalizedRole === 'TEACHER';

  if (!isProfessor) return null;

  const handleConfirmCreateActivity = async () => {
    if (!createdList) return setShowConfirm(false);
    setIsCreatingActivity(true);
    try {
      const payload = {
        titulo: `Prova - ${createdList.titulo}`,
        descricao: createdList.titulo || '',
        notaMaxima: 10,
        data: new Date().toISOString(),
        disciplinaId: createdList.disciplinaId || '',
        arquivos: [] as string[],
      };

      const evento = await eventoService.criarEvento(payload);
      const eventoId = (evento && (evento.idEvento || (evento as any).id)) as string | number;
      if (eventoId) {
        await eventoService.associarLista(eventoId, createdList.id);
        setToastMessage('Atividade criada e associada à lista com sucesso.');
      } else {
        setToastMessage('Atividade criada, porém id não retornado pelo servidor.');
      }
    } catch (err) {
      console.error('Erro ao criar/associar atividade:', err);
      setToastMessage('Erro ao criar atividade.');
    } finally {
      setIsCreatingActivity(false);
      setShowConfirm(false);
      setCreatedList(null);
    }
  };

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
        onSubmit={async () => {
          const created = await handleCreateList();
          if (created) {
            // notify parent
            if (onCreated) {
              try { onCreated(created); } catch (e) { console.error('onCreated callback error', e); }
            }
            // open confirm modal to ask whether to create an activity
            setCreatedList(created);
            setShowConfirm(true);
          }
        }}
        isLoading={isLoading}
        isLoadingDisciplinas={isLoadingDisciplinas}
        error={error}
        titulo={titulo}
        onTituloChange={setTitulo}
        disciplinas={disciplinas}
        selectedDisciplinaId={selectedDisciplinaId}
        onDisciplinaChange={setSelectedDisciplinaId}
      />
      <ConfirmCreateActivityModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setCreatedList(null); }}
        onConfirm={handleConfirmCreateActivity}
        listTitle={createdList?.titulo}
      />

      {toastMessage && (
        <div style={{ position: 'fixed', right: 16, top: 18, zIndex: 4000 }}>
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        </div>
      )}
    </>
  );
};

export default AddListButton;