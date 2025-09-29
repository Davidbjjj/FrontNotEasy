import React from 'react';
import documentoImg from '../../assets/documents.png';
import './FileUploadComponent.css';

const FileUploadComponent = ({ 
  onFileUpload, 
  onTriggerFileInput, 
  fileInputRef,
  uploading 
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      onFileUpload(file);
    } else {
      alert('Por favor, selecione um arquivo PDF.');
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    event.target.value = '';
  };

  return (
    <div className="scanner">
      <img src={documentoImg} alt="Scanner Icon" className="scanner-icon" />
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button 
        className={`scanner-button ${uploading ? 'uploading' : ''}`}
        onClick={onTriggerFileInput}
        disabled={uploading}
      >
        {uploading ? 'Processando...' : 'Scannerar Documento'}
      </button>
    </div>
  );
};

export default FileUploadComponent;