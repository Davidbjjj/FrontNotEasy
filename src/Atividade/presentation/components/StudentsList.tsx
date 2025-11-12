import React, { useState, useCallback, useEffect } from 'react';
import { RespostasModal } from './RespostasModal';
import { LoadingState, ErrorState, EmptyState } from './StateComponents';
import { useStudentClick, useStudentNotas } from '../../viewmodels/useActivityNotasViewModel';
import { Student, Activity, StudentGrade } from '../../model/Activity';
import './styles/StudentsList.css';

interface StudentCardProps {
  student: StudentGrade;
  disciplinaName?: string;
  onClick: () => void;
}

/**
 * Card individual de um estudante com sua nota
 * Componente puro de apresentação
 */
export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  disciplinaName,
  onClick,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradeClass = (nota?: number) => {
    if (nota === undefined || nota === null) return 'grade-warning';
    if (nota >= 8) return 'grade-excellent';
    if (nota >= 6) return 'grade-good';
    return 'grade-danger';
  };

  return (
    <div
      className="student-card clickable"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Ver detalhes de ${student.nomeEstudante}`}
    >
      {/* Avatar */}
      <div className="student-avatar" aria-hidden="true">
        {student.nomeEstudante ? getInitials(student.nomeEstudante) : '??'}
      </div>

      {/* Informações */}
      <div className="student-info">
        <p className="student-name">
          {student.nomeEstudante ?? 'Nome não disponível'}
        </p>
        {disciplinaName && (
          <p className="student-discipline">{disciplinaName}</p>
        )}
      </div>

      {/* Badge de Nota */}
      <div className={`grade-badge ${getGradeClass(student.nota)}`}>
        {student.nota !== undefined && student.nota !== null 
          ? student.nota.toFixed(1) 
          : '—'}
      </div>
    </div>
  );
};

interface StudentNotasListProps {
  listaId: string;
  evento?: Activity | null;
  eventoId?: string;
  disciplinaName?: string;
}

/**
 * Lista de notas consolidada (antes separadas em ByLista e Inline)
 * Responsabilidades:
 * - Carregar notas da lista ou evento
 * - Gerenciar modal de respostas
 * - Delegar apresentação para StudentCard
 */
export const StudentNotasList: React.FC<StudentNotasListProps> = ({
  listaId,
  evento,
  eventoId,
  disciplinaName,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Hooks da viewmodel
  const { notas, loading, error, fetchNotas } = useStudentNotas();
  const { loading: modalLoading, error: modalError, data: modalData, handleStudentClick } =
    useStudentClick();

  // Carrega notas ao montar ou quando listaId muda
  useEffect(() => {
    fetchNotas(listaId);
  }, [listaId, fetchNotas]);

  const onStudentCardClick = useCallback(
    async (student: Student) => {
      if (!eventoId || !listaId) {
        // Erro será capturado e exibido na modal
        setSelectedStudent(student);
        setModalOpen(true);
        return;
      }

      try {
        setSelectedStudent(student);
        await handleStudentClick(
          student.estudanteId ?? student.nomeEstudante ?? '',
          eventoId,
          listaId,
          evento
        );
        setModalOpen(true);
      } catch (err: any) {
        console.error('Erro ao carregar respostas:', err);
      }
    },
    [eventoId, listaId, evento, handleStudentClick]
  );

  if (loading) {
    return <LoadingState message="Carregando notas..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!notas || notas.length === 0) {
    return <EmptyState message="Nenhuma nota registrada ainda." />;
  }

  // Calcula estatísticas
  const validNotas = (notas as StudentGrade[]).filter(n => n.nota !== undefined && n.nota !== null).map(n => n.nota as number);
  const mediaNotas = validNotas.length > 0 ? validNotas.reduce((a, b) => a + b, 0) / validNotas.length : 0;
  const maiorNota = validNotas.length > 0 ? Math.max(...validNotas) : 0;
  const menorNota = validNotas.length > 0 ? Math.min(...validNotas) : 0;

  return (
    <>
      <div className="professor-notas-container">
        {/* Header com estatísticas */}
        <div className="professor-notas-header">
          <div>
            <h3 className="notas-title">Desempenho dos Alunos</h3>
          </div>
          <span className="notas-count">{notas.length} alunos</span>
        </div>

        {/* Cards dos alunos */}
        <div
          className="professor-notas-list-by-lista"
          role="list"
          aria-label="Lista de estudantes e notas"
        >
          {notas.map((nota, index) => (
            <StudentCard
              key={`${nota.estudanteId || index}`}
              student={nota}
              disciplinaName={disciplinaName}
              onClick={() => onStudentCardClick(nota)}
            />
          ))}
        </div>

        {/* Estatísticas resumidas */}
        {validNotas.length > 0 && (
          <div className="statistics-section">
            <div className="stat-item">
              <span className="stat-label">Média</span>
              <span className="stat-value">{mediaNotas.toFixed(1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maior</span>
              <span className="stat-value">{maiorNota.toFixed(1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Menor</span>
              <span className="stat-value">{menorNota.toFixed(1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Respondidos</span>
              <span className="stat-value">{validNotas.length}/{notas.length}</span>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <RespostasModal
          onClose={() => {
            setModalOpen(false);
            setSelectedStudent(null);
          }}
          loading={modalLoading}
          error={modalError}
          data={modalData}
          studentName={selectedStudent?.nomeEstudante}
        />
      )}
    </>
  );
};
