import React from 'react';
import { QuizResult, RespostaEstudanteQuestaoDTO, Question, QuestionOption } from '../../model/Question.types';
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
  const { totalQuestions, correctAnswers, wrongAnswers, score, respostas } = result;

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
        <div className="results-summary">
          <div className="score-circle">
            <span className="score-value">{score}%</span>
            <span className="score-label">Pontuação</span>
          </div>
          <div className="results-stats">
            <div className="stat-item correct">
              <span className="stat-number">{correctAnswers}</span>
              <span className="stat-label">Corretas</span>
            </div>
            <div className="stat-item wrong">
              <span className="stat-number">{wrongAnswers}</span>
              <span className="stat-label">Erradas</span>
            </div>
            <div className="stat-item total">
              <span className="stat-number">{totalQuestions}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>
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