// src/presentation/components/Questoes/QuestoesList.tsx

import React from 'react';
import { QuestaoEstudante } from '../../../model/Question.types';
import QuestaoCard from './QuestoesCard';
import './Questoes.css';

interface QuestoesListProps {
  questoes: QuestaoEstudante[];
  onQuestaoSelect: (questaoId: number) => void;
  className?: string;
}

export const QuestoesList: React.FC<QuestoesListProps> = ({
  questoes,
  onQuestaoSelect,
  className = '',
}) => {
  if (questoes.length === 0) {
    return (
      <div className="questoes-empty">
        <h3>Nenhuma questão disponível</h3>
        <p>Você não tem questões para responder no momento.</p>
      </div>
    );
  }

  return (
    <div className={`questoes-list ${className}`}>
      {questoes.map((questao) => (
        <QuestaoCard
          key={questao.id}
          questao={questao}
          onSelect={onQuestaoSelect}
        />
      ))}
    </div>
  );
};

export default QuestoesList;