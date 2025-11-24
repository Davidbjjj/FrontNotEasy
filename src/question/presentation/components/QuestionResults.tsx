import React from 'react';
import { QuizResult, Question, QuestionOption } from '../../model/Question.types';
import './QuestionResults.css';

interface QuestionResultsProps {
  result: QuizResult;
  questions: Question[];
  onRetry?: () => void;
  onClose?: () => void;
}

export const QuestionResults: React.FC<QuestionResultsProps> = ({
  result,
  questions,
  onRetry,
  onClose,
}) => {
  const { respostas } = result;
  const visao = (result as any).visao as {
    porcentagemAcertos?: number;
    totalQuestoes?: number;
    respondida?: boolean;
    nota?: number;
    questoesRespondidas?: number;
    questoesCorretas?: number;
  } | undefined;

  // Encontrar a questão correspondente para cada resposta
  const getQuestionDetails = (questaoId: number): Question | undefined => {
    return questions.find(q => q.id === questaoId.toString());
  };

  // Converter índice numérico para letra (0 -> A, 1 -> B, etc.)
  const indiceParaLetra = (indice: number): string => {
    return String.fromCharCode(65 + indice);
  };

  // Encontrar a opção correta
  const getCorrectOption = (question: Question): QuestionOption | undefined => {
    return question.options.find((opt: QuestionOption) => opt.id === question.correctAnswer);
  };

  // Encontrar a opção selecionada
  const getSelectedOption = (question: Question, alternativa: number): QuestionOption | undefined => {
    return question.options[alternativa];
  };

  return (
    <div className="question-results">
      <div className="results-header">
        <h2 className="results-title">Resultado do Questionário</h2>
        {visao && (
          <div className="student-vision-summary">
            <div className="summary-row"><strong>Nota:</strong> {visao.nota ?? '—'}</div>
            <div className="summary-row"><strong>% Acertos:</strong> {typeof visao.porcentagemAcertos === 'number' ? visao.porcentagemAcertos.toFixed(2) + '%' : '—'}</div>
            <div className="summary-row"><strong>Total questões:</strong> {visao.totalQuestoes ?? '—'}</div>
            <div className="summary-row"><strong>Questões respondidas:</strong> {visao.questoesRespondidas ?? '—'}</div>
            <div className="summary-row"><strong>Questões corretas:</strong> {visao.questoesCorretas ?? '—'}</div>
          </div>
        )}
      </div>

      <div className="results-details">
        <h3 className="details-title">Detalhes das Respostas</h3>
        <div className="answers-list">
          {respostas.map((resposta, index) => {
            const question = getQuestionDetails(resposta.questaoId);
            const selectedOption = question ? getSelectedOption(question, resposta.alternativa) : undefined;
            const correctOption = question ? getCorrectOption(question) : undefined;

            return (
              <div key={resposta.respostaId} className={`answer-item ${resposta.correta ? 'correct' : 'wrong'}`}>
                <div className="answer-header">
                  <span className="question-number">Questão {index + 1}</span>
                  <span className={`answer-status ${resposta.correta ? 'correct' : 'wrong'}`}>
                    {resposta.correta ? '✓ Correta' : '✗ Errada'}
                  </span>
                </div>
                {question && (
                  <>
                    <div className="question-content">
                      <p className="question-text">{question.content}</p>
                    </div>
                    <div className="answer-details">
                      <div className="answer-given">
                        <strong>Sua resposta:</strong> {indiceParaLetra(resposta.alternativa)}
                        {selectedOption && (
                          <span className="option-text"> - {selectedOption.text}</span>
                        )}
                      </div>
                      {!resposta.correta && correctOption && (
                        <div className="correct-answer">
                          <strong>Resposta correta:</strong> {correctOption.label}
                          <span className="option-text"> - {correctOption.text}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="results-actions">
        {onRetry && (
          <button className="btn-retry" onClick={onRetry}>
            Tentar Novamente
          </button>
        )}
        {onClose && (
          <button className="btn-close" onClick={onClose}>
            Fechar
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionResults;