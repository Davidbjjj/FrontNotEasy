// src/presentation/components/Questoes/Questoes.tsx

import React from 'react';
import { QuestoesLandingProps } from '../../../model/Questoes.types';
import { useQuestoesViewModel } from '../../../viewmodels/Questoes.viewmodels';
import QuestoesHeader from './QuestoesHeader';
import QuestoesList from './QuestoesList';
import './Questoes.css';

export const Questoes: React.FC<QuestoesLandingProps> = ({
  estudanteId,
  onQuestaoSelect,
  className = '',
}) => {
  const viewModel = useQuestoesViewModel(estudanteId, onQuestaoSelect);

  // Calcular estatísticas
  const totalQuestoes = viewModel.questoes.length;
  const questoesRespondidas = viewModel.questoes.filter(q => q.respondida).length;

  if (viewModel.loading && viewModel.questoes.length === 0) {
    return (
      <div className="questoes-page">
        <div className="loading-spinner"></div>
        <p>Carregando suas questões...</p>
      </div>
    );
  }

  if (viewModel.error) {
    return (
      <div className="questoes-page">
        <div className="error-message">
          <h2>Erro</h2>
          <p>{viewModel.error}</p>
          <button onClick={viewModel.handleRefresh} className="btn-retry">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`questoes-page ${className}`}>
      <QuestoesHeader 
        title="Minhas Questões"
        subtitle="Todas as questões que você precisa responder"
        totalQuestoes={totalQuestoes}
        questoesRespondidas={questoesRespondidas}
      />
      
      <QuestoesList
        questoes={viewModel.questoes}
        onQuestaoSelect={viewModel.handleQuestaoSelect}
      />
    </div>
  );
};

export default Questoes;