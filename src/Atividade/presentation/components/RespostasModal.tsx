import React, { useEffect } from 'react';
import { LoadingState, ErrorState, EmptyState } from './StateComponents';
import {
  RespostaHeader,
  RespostaDivider,
  RespostaSection,
  PerformanceMetrics,
  RespostasList,
} from './RespostasComponents';
import './styles/RespostasModal.css';
import './styles/RespostasHeader.css';
import './styles/PerformanceMetrics.css';
import './styles/RespostasItemCard.css';
import { StudentResponses } from '../../model/Activity';

interface RespostasModalProps {
  onClose: () => void;
  loading: boolean;
  error: string | null;
  data: StudentResponses | null;
  studentName?: string;
}

/**
 * Modal premium para exibir respostas detalhadas do estudante
 * Centraliza apresentação de dados de resposta em componentes especializados
 */
export const RespostasModal: React.FC<RespostasModalProps> = ({
  onClose,
  loading,
  error,
  data,
  studentName,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    // Previne scroll do body quando modal está aberto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="respostas-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="respostas-modal respostas-modal--premium"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="respostas-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        {!loading && !error && data && (
          <RespostaHeader
            tituloLista={data.tituloLista ?? 'Lista sem título'}
            nomeEstudante={studentName}
            onClose={onClose}
          />
        )}

        {/* Conteúdo */}
        <div className="respostas-modal-content">
          {loading && (
            <LoadingState message="Analisando respostas do estudante..." />
          )}

          {error && <ErrorState message={error} />}

          {!loading && !error && data && (
            <>
              {/* Performance Metrics */}
              <RespostaSection
                title="Desempenho"
                subtitle="Análise completa de acertos e erros"
                icon="📈"
              >
                <PerformanceMetrics
                  notaLista={data.notaLista ?? 0}
                  porcentagemAcertos={data.porcentagemAcertos ?? 0}
                  totalQuestoes={data.totalQuestoes ?? 0}
                  questõesRespondidas={
                    data.questõesRespondidas ??
                    data.questoesRespondidas ??
                    data.respondidas ??
                    0
                  }
                  questõesCorretas={
                    data.questõesCorretas ??
                    data.questoesCorretas ??
                    data.corretas ??
                    0
                  }
                />
              </RespostaSection>

              <RespostaDivider />

              {/* Respostas Detalhadas */}
              <RespostaSection
                title="Respostas Detalhadas"
                subtitle={`${data.respostas?.length ?? 0} questão${
                  data.respostas?.length !== 1 ? 's' : ''
                }`}
                icon="📋"
              >
                <RespostasList
                  respostas={(data.respostas ?? []) as any}
                  totalQuestoes={data.totalQuestoes ?? 0}
                  questõesCorretas={
                    data.questõesCorretas ??
                    data.questoesCorretas ??
                    data.corretas ??
                    0
                  }
                />
              </RespostaSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
