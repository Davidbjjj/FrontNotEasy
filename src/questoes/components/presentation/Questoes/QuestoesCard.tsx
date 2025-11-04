// src/presentation/components/Questoes/QuestaoCard.tsx

import React from 'react';
import { QuestaoEstudante } from '../../../model/Questoes.types';
import './Questoes.css';

interface QuestaoCardProps {
  questao: QuestaoEstudante;
  onSelect: (questaoId: number) => void;
  className?: string;
}

export const QuestaoCard: React.FC<QuestaoCardProps> = ({
  questao,
  onSelect,
  className = '',
}) => {
  const handleClick = () => {
    onSelect(questao.id);
  };

  const indiceParaLetra = (indice: number): string => {
    return String.fromCharCode(65 + indice);
  };

  const getStatus = () => {
    if (!questao.respondida) return { text: 'Não respondida', class: 'pending' };
    if (questao.correta) return { text: 'Correta', class: 'correct' };
    return { text: 'Incorreta', class: 'wrong' };
  };

  const status = getStatus();

  return (
    <div className={`questao-card ${className} ${status.class}`} onClick={handleClick}>
      <div className="questao-card__header">
        <h3 className="questao-card__title">{questao.cabecalho}</h3>
        <span className={`questao-card__status questao-card__status--${status.class}`}>
          {status.text}
        </span>
      </div>
      
      <div className="questao-card__content">
        <p className="questao-card__enunciado">{questao.enunciado}</p>
        
        <div className="questao-card__alternativas">
          {questao.alternativas.slice(0, 2).map((alternativa, index) => (
            <div key={index} className="questao-card__alternativa">
              <span className="questao-card__alternativa-label">
                {indiceParaLetra(index)})
              </span>
              <span className="questao-card__alternativa-text">
                {alternativa.substring(3)} {/* Remove o "a) ", "b) ", etc. */}
              </span>
            </div>
          ))}
          {questao.alternativas.length > 2 && (
            <div className="questao-card__more-alternatives">
              +{questao.alternativas.length - 2} alternativas...
            </div>
          )}
        </div>

        {questao.respondida && questao.respostaEstudante !== undefined && (
          <div className="questao-card__resposta">
            <strong>Sua resposta:</strong> {indiceParaLetra(questao.respostaEstudante)}
            {questao.correta ? (
              <span className="questao-card__feedback correct">✓ Correta</span>
            ) : (
              <span className="questao-card__feedback wrong">
                ✗ A resposta correta é {indiceParaLetra(questao.gabarito)}
              </span>
            )}
          </div>
        )}
      </div>

      <button className="questao-card__button">
        {questao.respondida ? 'Revisar' : 'Responder'}
      </button>
    </div>
  );
};

export default QuestaoCard;