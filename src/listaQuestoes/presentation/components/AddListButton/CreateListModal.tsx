import React from 'react';
import type { DisciplinaProfessorResponseDTO } from '../../../model/AddListButton.types';
import './CreateListModal.css';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading: boolean;
  isLoadingDisciplinas: boolean;
  error: string | null;
  titulo: string;
  onTituloChange: (titulo: string) => void;
  disciplinas: DisciplinaProfessorResponseDTO[];
  selectedDisciplinaId: string;
  onDisciplinaChange: (disciplinaId: string) => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isLoadingDisciplinas,
  error,
  titulo,
  onTituloChange,
  disciplinas,
  selectedDisciplinaId,
  onDisciplinaChange,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const selectedDisciplina = disciplinas.find(d => d.id === selectedDisciplinaId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Nova Lista</h2>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="titulo" className="form-label">
              Título da Lista *
            </label>
            <input
              id="titulo"
              type="text"
              className="form-input"
              value={titulo}
              onChange={(e) => onTituloChange(e.target.value)}
              placeholder="Digite o título da lista"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="disciplina" className="form-label">
              Disciplina *
            </label>
            <select
              id="disciplina"
              className="form-select"
              value={selectedDisciplinaId}
              onChange={(e) => onDisciplinaChange(e.target.value)}
              disabled={isLoading || isLoadingDisciplinas || disciplinas.length === 0}
              required
            >
              <option value="">Selecione uma disciplina</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>
                  {disciplina.nome} - Prof. {disciplina.professorNome}
                </option>
              ))}
            </select>
            {isLoadingDisciplinas && (
              <p className="form-help">Carregando disciplinas...</p>
            )}
            {disciplinas.length === 0 && !isLoadingDisciplinas && (
              <p className="form-help">Nenhuma disciplina disponível</p>
            )}
          </div>

          {/* Informações da disciplina selecionada */}
          {selectedDisciplina && (
            <div className="disciplina-info">
              <h4 className="disciplina-info-title">Disciplina Selecionada:</h4>
              <div className="disciplina-info-grid">
                <div className="info-item">
                  <span className="info-label">Nome:</span>
                  <span className="info-value">{selectedDisciplina.nome}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Professor:</span>
                  <span className="info-value">{selectedDisciplina.professorNome}</span>
                </div>
                {selectedDisciplina.instituicaoNome && (
                  <div className="info-item">
                    <span className="info-label">Instituição:</span>
                    <span className="info-value">{selectedDisciplina.instituicaoNome}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !titulo.trim() || !selectedDisciplinaId}
            >
              {isLoading ? 'Criando...' : 'SIM, CONFIRMAR ENVIO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;