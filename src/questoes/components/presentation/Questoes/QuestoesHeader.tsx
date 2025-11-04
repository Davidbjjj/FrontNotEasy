// src/presentation/components/Questoes/QuestoesHeader.tsx

import React from 'react';
import { QuestoesHeaderProps } from '../../../model/Questoes.types';
import './Questoes.css';

export const QuestoesHeader: React.FC<QuestoesHeaderProps> = ({
  title,
  subtitle,
  totalQuestoes,
  questoesRespondidas,
  className = '',
}) => {
  const progress = totalQuestoes > 0 ? (questoesRespondidas / totalQuestoes) * 100 : 0;
  
  // Calcular questões corretas (em um cenário real, isso viria do viewmodel)
  const questoesCorretas = 0; // Placeholder - você precisará calcular isso

  return (
    <div className={`questoes-header ${className}`}>
      <h1 className="questoes-header__title">{title}</h1>
      <p className="questoes-header__subtitle">{subtitle}</p>
      
      <div className="questoes-header__progress">
        <div className="questoes-header__progress-bar">
          <div 
            className="questoes-header__progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="questoes-header__progress-text">
          <span>{questoesRespondidas} de {totalQuestoes} questões respondidas</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="questoes-header__stats">
        <div className="questoes-header__stat">
          <span className="questoes-header__stat-number">{totalQuestoes}</span>
          <span className="questoes-header__stat-label">Total</span>
        </div>
        <div className="questoes-header__stat">
          <span className="questoes-header__stat-number">{questoesRespondidas}</span>
          <span className="questoes-header__stat-label">Respondidas</span>
        </div>
        <div className="questoes-header__stat">
          <span className="questoes-header__stat-number">{questoesCorretas}</span>
          <span className="questoes-header__stat-label">Corretas</span>
        </div>
      </div>
    </div>
  );
};

export default QuestoesHeader;