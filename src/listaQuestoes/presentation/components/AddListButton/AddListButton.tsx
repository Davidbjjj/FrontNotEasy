import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAddListButtonViewModel } from '../../../viewmodels/AddListButton.viewmodel';
import { eventoService } from '../../../../Atividade/services/api/eventoService';
import { getCurrentUser } from '../../../../auth/auth';
import { useNavigate } from 'react-router-dom';
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
  const [toastData, setToastData] = useState<{
    title?: string;
    message: string;
    variant?: 'success'|'error'|'info';
    actionLabel?: string;
    onAction?: (() => void) | null;
  } | null>(null);

  const navigate = useNavigate();

  // Ler role do token ou localStorage e normalizar para evitar exibição indevida
  const rawRole = getCurrentUser()?.role || localStorage.getItem('role') || '';
  const normalizedRole = String(rawRole).toUpperCase();
  // Institutions should be treated like professors for create/list management
  const isProfessor = normalizedRole === 'PROFESSOR' || normalizedRole === 'TEACHER' || normalizedRole === 'INSTITUICAO';

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
          // build an Activity-like object so the rest of the UI can consume it
          const newActivity = {
            id: String(eventoId || Date.now()),
            title: payload.titulo,
            subject: createdList.disciplina || (createdList.disciplinaNome ?? ''),
            class: '',
            completed: false,
            deadline: payload.data || ''
          } as any;

          // dispatch a global event so pages showing activities can update instantly
          try {
            window.dispatchEvent(new CustomEvent('activity:created', { detail: newActivity }));
          } catch (e) {
            // fallback: no-op
          }

          // show a rich success toast with action to open the activity
          setToastData({
            title: 'Atividade criada',
            message: 'Atividade criada e associada à lista com sucesso.',
            variant: 'success',
            actionLabel: 'Abrir atividade',
            onAction: () => {
              try {
                navigate(`/atividades/${eventoId}`);
              } catch (e) {
                window.location.href = `/atividades/${eventoId}`;
              }
            }
          });
      } else {
        setToastData({ title: 'Atividade criada', message: 'Atividade criada, porém id não retornado pelo servidor.', variant: 'info' });
      }
      } catch (err) {
      console.error('Erro ao criar/associar atividade:', err);
      setToastData({ title: 'Erro', message: 'Erro ao criar atividade.', variant: 'error' });
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
        onClose={() => { if (!isCreatingActivity) { setShowConfirm(false); setCreatedList(null); } }}
        onConfirm={handleConfirmCreateActivity}
        listTitle={createdList?.titulo}
        isLoading={isCreatingActivity}
      />

      {toastData && (
        <div style={{ position: 'fixed', right: 16, top: 18, zIndex: 4000 }}>
          <Toast
            title={toastData.title}
            message={toastData.message}
            variant={toastData.variant}
            onClose={() => setToastData(null)}
            actionLabel={toastData.actionLabel}
            onAction={() => { toastData.onAction && toastData.onAction(); setToastData(null); }}
          />
        </div>
      )}
    </>
  );
};

export default AddListButton;