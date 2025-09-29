import { useState, useRef } from 'react';
import { questionService } from '../services/api/questionService';

export const useQuestionsViewModel = () => {
  const [mensagemSucesso, setMensagemSucesso] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [questoes, setQuestoes] = useState([]);
  const fileInputRef = useRef(null);

  // Carregar questões iniciais
  const loadQuestoes = () => {
    // Mock data - substituir por chamada API real
    const mockQuestoes = Array(8).fill({
      id: Math.random(),
      nome: "Carlos Alberto",
      foto: "",
      lista: "Lista de Exercícios"
    });
    setQuestoes(mockQuestoes);
  };

  // Upload de arquivo
  const handleFileUpload = async (file) => {
    setUploading(true);
    setError(null);
    
    try {
      const response = await questionService.uploadPdf(file);
      setMensagemSucesso(true);
      setTimeout(() => setMensagemSucesso(false), 3000);
      
      // Recarregar questões após upload bem-sucedido
      loadQuestoes();
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Trigger do input de arquivo
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Acessar questão
  const handleAcessarQuestao = (questaoId) => {
    console.log('Acessando questão:', questaoId);
    // Navegar para detalhes da questão ou abrir modal
  };

  return {
    mensagemSucesso,
    uploading,
    error,
    questoes,
    fileInputRef,
    handleFileUpload,
    triggerFileInput,
    handleAcessarQuestao,
    loadQuestoes
  };
};
