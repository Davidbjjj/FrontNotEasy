import React from 'react';

interface RespostaItem {
  respostaId?: number;
  questaoId?: number;
  enunciado?: string;
  estudanteId?: string;
  nomeEstudante?: string;
  alternativa?: number;
  correta?: boolean;
}

interface RespostaItemProps {
  resposta: RespostaItem;
  index: number;
}

/**
 * Card individual de uma resposta com feedback visual
 * Mostra enunciado, resposta selecionada e status de acerto/erro
 */
export const RespostaItemCard: React.FC<RespostaItemProps> = ({ resposta, index }) => {
  const statusIcon = resposta.correta ? '✓' : '✗';
  const statusClass = resposta.correta ? 'resposta-correct' : 'resposta-incorrect';
  const statusText = resposta.correta ? 'Acertou' : 'Errou';
  const statusColor = resposta.correta ? '#10b981' : '#ef4444';

  const alternativaToLetter = (alt?: number | null) => {
    if (alt === null || alt === undefined || Number.isNaN(Number(alt))) return '-';
    const n = Number(alt);
    // Map 0 -> A, 1 -> B, ..., 4 -> E
    if (n < 0) return '-';
    const code = 65 + (n % 26);
    return String.fromCharCode(code);
  };

  return (
    <div className={`resposta-item-card ${statusClass}`}>
      {/* Header com número e status */}
      <div className="resposta-item-header">
        <div className="resposta-item-number">
          <span className="question-number">Questão {index + 1}</span>
          {resposta.questaoId && (
            <span className="question-id">ID: {resposta.questaoId}</span>
          )}
        </div>
        <div className={`resposta-item-status ${statusClass}`}>
          <span className="status-icon">{statusIcon}</span>
          <span className="status-text">{statusText}</span>
        </div>
      </div>

      {/* Enunciado */}
      {resposta.enunciado && (
        <div className="resposta-item-enunciado">
          <p className="enunciado-label">Enunciado</p>
          <p className="enunciado-text">{resposta.enunciado}</p>
        </div>
      )}

      {/* Resposta selecionada */}
      <div className="resposta-item-answer">
        <div className="answer-label">
          Resposta selecionada
          <span className={`answer-indicator ${statusClass}`}>Alternativa {alternativaToLetter(resposta.alternativa)}</span>
        </div>
      </div>

      {/* Indicador visual de acerto */}
      <div className={`resposta-item-indicator ${statusClass}`} style={{ borderLeftColor: statusColor }} />
    </div>
  );
};

interface RespostasListProps {
  respostas: RespostaItem[];
  totalQuestoes: number;
  questõesCorretas: number;
}

/**
 * Lista completa de respostas com visualização em grid
 */
export const RespostasList: React.FC<RespostasListProps> = ({ 
  respostas, 
  totalQuestoes, 
  questõesCorretas 
}) => {
  if (!Array.isArray(respostas) || respostas.length === 0) {
    return (
      <div className="respostas-empty">
        <div className="empty-icon">📝</div>
        <p>Nenhuma resposta encontrada para esta lista</p>
      </div>
    );
  }

  return (
    <div className="respostas-list-container">
      <div className="respostas-list-grid">
        {respostas.map((resposta, index) => (
          <RespostaItemCard key={index} resposta={resposta} index={index} />
        ))}
      </div>
    </div>
  );
};

interface PerformanceMetricsProps {
  notaLista: number;
  porcentagemAcertos: number;
  totalQuestoes: number;
  questõesRespondidas: number;
  questõesCorretas: number;
}

/**
 * Componente com métricas de performance do estudante
 * Mostra nota, porcentagem, total e breakdown de questões
 */
export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  notaLista,
  porcentagemAcertos,
  totalQuestoes,
  questõesRespondidas,
  questõesCorretas,
}) => {
  const getNoteColor = (nota: number) => {
    if (nota >= 8) return '#10b981'; // Verde
    if (nota >= 6) return '#3b82f6'; // Azul
    if (nota >= 4) return '#f59e0b'; // Laranja
    return '#ef4444'; // Vermelho
  };

  const getGradeLabel = (nota: number) => {
    if (nota >= 9) return 'Excelente';
    if (nota >= 8) return 'Muito Bom';
    if (nota >= 7) return 'Bom';
    if (nota >= 6) return 'Satisfatório';
    if (nota >= 4) return 'Insuficiente';
    return 'Crítico';
  };

  const questõesErradas = totalQuestoes - questõesCorretas;
  const acertosPercentual = porcentagemAcertos ?? ((questõesCorretas / totalQuestoes) * 100);

  return (
    <div className="performance-metrics">
      {/* Card principal de nota */}
      <div className="performance-card performance-card--primary">
        <div className="performance-card-content">
          <div className="performance-grade-section">
            <div className="grade-value" style={{ color: getNoteColor(notaLista) }}>
              {notaLista.toFixed(2)}
            </div>
            <div className="grade-info">
              <p className="grade-label">{getGradeLabel(notaLista)}</p>
              <p className="grade-subtext">Nota Final</p>
            </div>
          </div>

          <div className="performance-percentage">
            <div className="percentage-circle" style={{ 
              background: `conic-gradient(${getNoteColor(notaLista)} 0deg ${(acertosPercentual / 100) * 360}deg, #e5e7eb ${(acertosPercentual / 100) * 360}deg)` 
            }}>
              <div className="percentage-inner">
                <span className="percentage-value">{acertosPercentual.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards secundários de detalhes */}
      <div className="performance-cards-grid">
        {/* Total de questões */}
        <div className="performance-card">
          <div className="card-icon card-icon--blue">📊</div>
          <div className="card-content">
            <p className="card-value">{totalQuestoes}</p>
            <p className="card-label">Total de Questões</p>
          </div>
        </div>

        {/* Questões respondidas */}
        <div className="performance-card">
          <div className="card-icon card-icon--purple">✏️</div>
          <div className="card-content">
            <p className="card-value">{questõesRespondidas}</p>
            <p className="card-label">Respondidas</p>
          </div>
        </div>

        {/* Questões corretas */}
        <div className="performance-card">
          <div className="card-icon card-icon--green">✓</div>
          <div className="card-content">
            <p className="card-value">{questõesCorretas}</p>
            <p className="card-label">Corretas</p>
          </div>
        </div>

        {/* Questões erradas */}
        <div className="performance-card">
          <div className="card-icon card-icon--red">✗</div>
          <div className="card-content">
            <p className="card-value">{questõesErradas}</p>
            <p className="card-label">Erradas</p>
          </div>
        </div>
      </div>

      {/* Barra de progresso detalhada */}
      <div className="performance-progress-section">
        <p className="progress-title">Distribuição de Respostas</p>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-segment progress-segment--correct" 
              style={{ width: `${(questõesCorretas / totalQuestoes) * 100}%` }}
              title={`${questõesCorretas} corretas`}
            />
            <div 
              className="progress-segment progress-segment--incorrect" 
              style={{ width: `${(questõesErradas / totalQuestoes) * 100}%` }}
              title={`${questõesErradas} erradas`}
            />
          </div>
          <div className="progress-legend">
            <div className="legend-item">
              <span className="legend-dot legend-dot--correct" />
              <span className="legend-text">{questõesCorretas} Corretas</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot legend-dot--incorrect" />
              <span className="legend-text">{questõesErradas} Erradas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RespostaHeaderProps {
  tituloLista: string;
  nomeEstudante?: string;
  onClose: () => void;
}

/**
 * Header do modal com informações da lista e estudante
 */
export const RespostaHeader: React.FC<RespostaHeaderProps> = ({
  tituloLista,
  nomeEstudante,
  onClose,
}) => {
  return (
    <div className="resposta-header">
      <div className="resposta-header-content">
        <div className="resposta-header-info">
          <h2 className="resposta-header-title">Análise de Respostas</h2>
          <p className="resposta-header-subtitle">
            {tituloLista}
            {nomeEstudante && ` • ${nomeEstudante}`}
          </p>
        </div>
        <button
          className="resposta-header-close"
          onClick={onClose}
          aria-label="Fechar detalhes de respostas"
          title="Fechar (ESC)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Divider com estilo premium
 */
export const RespostaDivider: React.FC = () => (
  <div className="resposta-divider">
    <div className="divider-line" />
  </div>
);

/**
 * Seção com título estilizado
 */
interface RespostaSectionProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
}

export const RespostaSection: React.FC<RespostaSectionProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => (
  <div className="resposta-section">
    <div className="resposta-section-header">
      {icon && <span className="section-icon">{icon}</span>}
      <div className="section-text">
        <h3 className="section-title">{title}</h3>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
    </div>
    <div className="resposta-section-content">
      {children}
    </div>
  </div>
);
