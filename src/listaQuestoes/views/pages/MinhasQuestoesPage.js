import React, { useEffect } from 'react';
import MinhasQuestoesComponent from '../../presentation/components/MinhasQuestoesComponent';
import { useQuestionsViewModel } from '../../viewmodels/questionsViewModel';

const MinhasQuestoesPage = () => {
  const {
    mensagemSucesso,
    uploading,
    error,
    questoes,
    fileInputRef,
    handleFileUpload,
    triggerFileInput,
    handleAcessarQuestao,
    loadQuestoes
  } = useQuestionsViewModel();

  useEffect(() => {
    loadQuestoes();
  }, []);

  return (
    <MinhasQuestoesComponent
      mensagemSucesso={mensagemSucesso}
      uploading={uploading}
      error={error}
      questoes={questoes}
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      onTriggerFileInput={triggerFileInput}
      onAcessarQuestao={handleAcessarQuestao}
    />
  );
};

export default MinhasQuestoesPage;