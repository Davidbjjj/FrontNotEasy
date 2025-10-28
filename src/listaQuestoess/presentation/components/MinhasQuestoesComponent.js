import React from 'react';
import FileUploadComponent from './FileUploadComponent';
import QuestionCard from './QuestionCard';
import './MinhasQuestoesComponent.css';

const MinhasQuestoesComponent = ({
  mensagemSucesso,
  uploading,
  error,
  questoes,
  fileInputRef,
  onFileUpload,
  onTriggerFileInput,
  onAcessarQuestao
}) => {
  return (
    <div className="minhas-questoes-container">
      {mensagemSucesso && (
        <div className="alert-mensagem">
          Arquivo enviado com sucesso!
        </div>
      )}
      
      {error && (
        <div className="alert-erro">
          Erro: {error}
        </div>
      )}

      <FileUploadComponent
        onFileUpload={onFileUpload}
        onTriggerFileInput={onTriggerFileInput}
        fileInputRef={fileInputRef}
        uploading={uploading}
      />

      <div className="questoes-container">
        {questoes.map((questao, index) => (
          <QuestionCard
            key={questao.id || index}
            questao={questao}
            onAcessar={onAcessarQuestao}
          />
        ))}
      </div>
    </div>
  );
};

export default MinhasQuestoesComponent;