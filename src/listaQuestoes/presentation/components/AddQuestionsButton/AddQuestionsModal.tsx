import React, { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import type { ProcessarPDFResponse } from '../../../model/AddQuestionsButton.types';
import './AddQuestionsModal.css';

interface AddQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<ProcessarPDFResponse | null>;
  onSuccess: () => void;
  isLoading: boolean;
  error: string | null;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

const AddQuestionsModal: React.FC<AddQuestionsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  isLoading,
  error,
  selectedFile,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onSubmit();
    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Adicionar Questões via PDF</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">
              Selecione um arquivo PDF com questões
            </label>
            
            <div
              className={`file-drop-zone ${selectedFile ? 'file-drop-zone--has-file' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              
              {!selectedFile ? (
                <div className="file-drop-content">
                  <Upload size={48} className="file-drop-icon" />
                  <p className="file-drop-text">
                    Arraste e solte o PDF aqui ou clique para selecionar
                  </p>
                  <p className="file-drop-hint">
                    Apenas arquivos PDF são aceitos
                  </p>
                </div>
              ) : (
                <div className="file-selected-content">
                  <FileText size={32} className="file-selected-icon" />
                  <div className="file-info">
                    <p className="file-name">{selectedFile.name}</p>
                    <p className="file-size">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={handleRemoveFile}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !selectedFile}
            >
              {isLoading ? 'Processando...' : 'Processar PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionsModal;