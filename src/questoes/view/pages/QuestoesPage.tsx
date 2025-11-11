// src/view/pages/QuestoesPage.tsx

import React from 'react';
import { Questoes } from '../../components/presentation/Questoes/Questoes';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../listMain/presentation/components/MainLayout';

const QuestoesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Em produção, isso viria do contexto de autenticação / token.
  // Usar userId salvo no localStorage em vez de id mocado
  const estudanteId = localStorage.getItem('userId') || '';

  const handleQuestaoSelect = (questaoId: number) => {
    // Navega para uma página específica da questão ou mostra modal
    console.log('Questão selecionada:', questaoId);
    // navigate(`/questao/${questaoId}`);
  };

  return (
    <MainLayout>
      <div className="questoes-landing-page">
        <Questoes 
          estudanteId={estudanteId}
          onQuestaoSelect={handleQuestaoSelect}
        />
      </div>
    </MainLayout>
  );
};

export default QuestoesPage;