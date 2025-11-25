import React from 'react';
import { QuestionContentProps } from '../../model/Question.types';
import './Question.css';
import ImageWithAuth from '../../../components/ImageWithAuth';
import api from '../../../services/apiClient';

export const QuestionContent: React.FC<QuestionContentProps> = ({
  content,
  options,
  imagens,
  selectedAnswer,
  onAnswerSelect,
  onSubmitAnswer,
  isSubmitting,
  isAnswered,
  className = '',
  onOptionSelect,
  questionId,
}) => {
  return (
    <div className={`question-content ${className}`}>
      <div className="question-content__text">
        {content}
      </div>

      {/* render question images if provided (uses same heuristics as professor view) */}
      {imagens && imagens.length > 0 && (
        <div className="question-images" style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {imagens.map((img: any, i: number) => {
            const textoOcr = (img?.textoOcr || '').toString().trim();
            const enunciado = String(content || '').toLowerCase();
            const alternativasText = (options || []).map((o: any) => String(o.text || '').toLowerCase()).join('\n');
            const isReferenced = textoOcr && (enunciado.includes(textoOcr.toLowerCase()) || alternativasText.includes(textoOcr.toLowerCase()));
            const imgClass = `question-image ${!isReferenced ? 'question-image--large' : ''}`;
            const rawSrc = img.urlPublica || img.url || img.src || '';
            const base = (api && (api.defaults && api.defaults.baseURL)) || 'http://localhost:8080';
            const normalized = rawSrc.startsWith('/') ? `${base}${rawSrc}` : rawSrc;
            return <ImageWithAuth key={i} src={normalized} alt={img.nomeArquivo || `imagem-${i}`} className={imgClass} />;
          })}
        </div>
      )}

      <div className="question-options">
        {options.map((option) => (
          <div
            key={option.id}
            className={`question-option ${
              selectedAnswer === option.id ? 'question-option--selected' : ''
            } ${isAnswered ? 'question-option--disabled' : ''}`}
                      onClick={() => {
                        if (isAnswered || isSubmitting) return;
                        onAnswerSelect(option.id);
                        if (onOptionSelect) {
                          const alternativaIndex = option.label.charCodeAt(0) - 65;
                          onOptionSelect(questionId ?? '', option.id, alternativaIndex);
                        }
                      }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (!isAnswered && !isSubmitting && (e.key === 'Enter' || e.key === ' ')) onAnswerSelect(option.id); }}
          >
            <span className="question-option__label">{option.label}</span>
            <span className="question-option__text">{option.text}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn-submit-answer"
          onClick={() => onSubmitAnswer && onSubmitAnswer()}
          disabled={!selectedAnswer || isAnswered || isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : (isAnswered ? 'Respondida' : 'Enviar resposta')}
        </button>
      </div>
    </div>
  );
};

export default QuestionContent;