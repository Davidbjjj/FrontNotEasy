import React, { useState } from 'react';
import { eventoService } from '../../../../Atividade/services/api/eventoService';
import type { DisciplinaProfessorResponseDTO } from '../../../model/AddListButton.types';
import './CreateListModal.css';

interface CreateActivityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  listData: any;
  disciplinas: DisciplinaProfessorResponseDTO[];
  disciplinaId: string;
}

const CreateActivityConfirmModal: React.FC<CreateActivityConfirmModalProps> = ({
  isOpen,
  onClose,
  listData,
  disciplinas,
  disciplinaId,
}) => {
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);
  const [activityData, setActivityData] = useState({
    titulo: '',
    descricao: '',
    notaMaxima: 10,
    data: '',
  });
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleYes = () => {
    setShowActivityForm(true);
    // Pre-preencher título com o da lista
    if (listData?.titulo) {
      setActivityData(prev => ({ ...prev, titulo: listData.titulo }));
    }
  };

  const handleNo = () => {
    onClose();
    resetForm();
  };

  const handleCreateActivity = async () => {
    if (!activityData.titulo.trim() || !activityData.data) {
      setError('Preencha título e data da atividade');
      return;
    }

    setIsCreatingActivity(true);
    setError(null);

    try {
      const payload = {
        titulo: activityData.titulo.trim(),
        descricao: activityData.descricao.trim(),
        notaMaxima: activityData.notaMaxima,
        data: new Date(activityData.data).toISOString(),
        disciplinaId: disciplinaId || listData?.disciplinaId || '',
        arquivos: [],
      };

      const evento = await eventoService.criarEvento(payload);
      const eventoId = evento?.idEvento || (evento as any)?.id;

      // Associar lista ao evento
      if (eventoId && listData?.id) {
        try {
          await eventoService.associarLista(eventoId, listData.id);
        } catch (err) {
          console.warn('Falha ao associar lista ao evento:', err);
        }
      }

      // Sucesso - fechar modal
      onClose();
      resetForm();
      
      // Opcional: disparar evento customizado para atualizar lista de atividades
      window.dispatchEvent(new CustomEvent('activity:created', { 
        detail: { 
          id: String(eventoId), 
          title: payload.titulo,
          deadline: activityData.data 
        } 
      }));
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao criar atividade';
      setError(errorMessage);
    } finally {
      setIsCreatingActivity(false);
    }
  };

  const resetForm = () => {
    setShowActivityForm(false);
    setActivityData({
      titulo: '',
      descricao: '',
      notaMaxima: 10,
      data: '',
    });
    setError(null);
  };

  const selectedDisciplina = disciplinas.find(d => d.id === (disciplinaId || listData?.disciplinaId));

  return (
    <div className="modal-overlay" onClick={handleNo}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {showActivityForm ? 'Criar Atividade' : 'Lista Criada com Sucesso!'}
          </h2>
          <button className="modal-close" onClick={handleNo} type="button">
            ×
          </button>
        </div>

        {!showActivityForm ? (
          <div className="modal-form">
            <p style={{ marginBottom: '20px', fontSize: '16px' }}>
              Deseja criar uma atividade associada a esta lista?
            </p>
            
            {listData && (
              <div className="disciplina-info" style={{ marginBottom: '20px' }}>
                <h4 className="disciplina-info-title">Informações da Lista:</h4>
                <div className="disciplina-info-grid">
                  <div className="info-item">
                    <span className="info-label">Título:</span>
                    <span className="info-value">{listData.titulo}</span>
                  </div>
                  {selectedDisciplina && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Disciplina:</span>
                        <span className="info-value">{selectedDisciplina.nome}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Professor:</span>
                        <span className="info-value">{selectedDisciplina.professorNome}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleNo}
              >
                Não, apenas a lista
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleYes}
              >
                Sim, criar atividade
              </button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateActivity();
            }} 
            className="modal-form"
          >
            <div className="form-group">
              <label htmlFor="activity-titulo" className="form-label">
                Título da Atividade *
              </label>
              <input
                id="activity-titulo"
                type="text"
                className="form-input"
                value={activityData.titulo}
                onChange={(e) => setActivityData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Digite o título da atividade"
                disabled={isCreatingActivity}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity-descricao" className="form-label">
                Descrição
              </label>
              <textarea
                id="activity-descricao"
                className="form-input"
                value={activityData.descricao}
                onChange={(e) => setActivityData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Digite a descrição da atividade (opcional)"
                disabled={isCreatingActivity}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity-data" className="form-label">
                Data de Entrega *
              </label>
              <input
                id="activity-data"
                type="datetime-local"
                className="form-input"
                value={activityData.data}
                onChange={(e) => setActivityData(prev => ({ ...prev, data: e.target.value }))}
                disabled={isCreatingActivity}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="activity-nota" className="form-label">
                Nota Máxima *
              </label>
              <input
                id="activity-nota"
                type="number"
                className="form-input"
                value={activityData.notaMaxima}
                onChange={(e) => setActivityData(prev => ({ ...prev, notaMaxima: Number(e.target.value) }))}
                min="0"
                step="0.5"
                disabled={isCreatingActivity}
                required
              />
            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleNo}
                disabled={isCreatingActivity}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isCreatingActivity || !activityData.titulo.trim() || !activityData.data}
              >
                {isCreatingActivity ? 'Criando...' : 'Criar Atividade'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateActivityConfirmModal;
