import React from 'react';
import { ListsViewProps, QuestionList } from '../../model/QuestionList.types';
import AddQuestionsButton from './AddQuestionsButton/AddQuestionsButton';
import AddListButton from './AddListButton/AddListButton';
import { ArrowRight, Clock, Book, FileText, Trash2, Loader2 } from 'lucide-react';
import './QuestionList.css';
import { formatDateTime } from '../../../utils/date';
import { respostaService } from '../../../question/service/api/respostaService';
import { listaService } from '../../services/api/listaService';
import { useEffect, useState } from 'react';
import { Popconfirm, message } from 'antd';
import { decodeJwt } from '../../../auth/jwt';

const getPreferredTeacherName = (fallbackName?: string) => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.nome) return payload.nome;
    }
  } catch (err) {
    // ignore
  }
  return fallbackName || '';
};

interface ListCardProps {
  list: QuestionList;
  onClick: (list: QuestionList) => void;
  viewMode: 'grid' | 'list';
  onQuestionsAdded?: () => void;
  isLoading?: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ list, onClick, viewMode, onQuestionsAdded, isLoading }) => {
  const progress = list.totalQuestions ? Math.round((list.questionsCompleted / list.totalQuestions) * 100) : 0;
  const role = (localStorage.getItem('role') || '').toUpperCase();
  const isProfessor = role === 'PROFESSOR' || role === 'INSTITUICAO';
  const estudanteId = localStorage.getItem('userId') || '';

  const [studentAnswered, setStudentAnswered] = useState<number | null>(null);
  const [studentTotal, setStudentTotal] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadStudentVisao = async () => {
      if (isProfessor) return;
      try {
        const visao = await respostaService.fetchVisao(list.id, estudanteId);
        if (!mounted) return;
        if (visao) {
          const total = visao.totalQuestoes ?? visao.lista?.questoes?.length ?? list.totalQuestions ?? 0;
          const responded = visao.questoesRespondidas ?? visao.respondidas ?? 0;
          setStudentTotal(total);
          setStudentAnswered(responded);
        }
      } catch (err) {
        // ignore per-list visao errors
      }
    };

    loadStudentVisao();
    return () => { mounted = false };
  }, [isProfessor, list.id, estudanteId, list.totalQuestions]);

  const handleAddQuestionsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique propague para o card
  };

  const handleDeleteList = async () => {
    setIsDeleting(true);
    const hide = message.loading('Deletando lista...', 0);
    try {
      await listaService.deleteLista(list.id);
      message.success('Lista deletada com sucesso');
      if (onQuestionsAdded) onQuestionsAdded();
    } catch (err) {
      console.error(err);
      message.error('Erro ao deletar lista');
    } finally {
      hide();
      setIsDeleting(false);
    }
  };

  const progressColor = progress >= 70 ? '#10b981' : progress >= 40 ? '#f59e0b' : '#ef4444';

  // compute displayed progress: professor sees class progress, student sees own progress if available
  const displayedPercent = isProfessor ? progress : (studentTotal && studentAnswered != null ? Math.round((studentAnswered / Math.max(1, studentTotal)) * 100) : 0);
  const progressText = isProfessor
    ? `Alunos que entregaram a lista ${list.questionsCompleted} de ${list.totalQuestions}`
    : (studentTotal != null && studentAnswered != null ? `Você respondeu ${studentAnswered} de ${studentTotal}` : `Alunos que entregaram a lista ${list.questionsCompleted} de ${list.totalQuestions}`);

  return (
    <div className="list-card" onClick={() => onClick(list)}>
      {isLoading && (
        <div className="list-card__loading-overlay" aria-hidden>
          <div className="list-card__spinner" />
        </div>
      )}
      <div className="list-card__inner">
        <div className="list-card__thumb">
          {/* Se houver subject color, mostrar um bloco com ícone */}
          <div className="list-card__thumb-image" style={{ backgroundColor: list.subject?.color || '#eef2ff' }}>
            <Book color="#ffffff" />
          </div>
        </div>

        <div className="list-card__main">
          <div className="list-card__top-row">
            <div>
              <h3 className="list-card__subject">{list.title}</h3>
              <p className="list-card__professor">{list.subject?.name} · {getPreferredTeacherName(list.professor.name)}</p>
            </div>
            <div className="list-card__actions" onClick={handleAddQuestionsClick}>
              {isProfessor && (
                <>
                  <Popconfirm
                    title="Deletar Lista"
                    description="Tem certeza que deseja deletar esta lista?"
                    onConfirm={handleDeleteList}
                    okText="Sim"
                    cancelText="Não"
                    disabled={isDeleting}
                  >
                    <button
                      className="icon-btn-danger"
                      title="Deletar Lista"
                      disabled={isDeleting}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </Popconfirm>
                  <AddQuestionsButton
                    listaId={list.id}
                    onQuestionsAdded={onQuestionsAdded}
                  />
                </>
              )}
            </div>
          </div>

          <div className="list-card__progress">
            <p className="list-card__progress-text">{progressText}</p>
            <div className="list-card__progress-bar">
              <div
                className="list-card__progress-fill"
                style={{ width: `${displayedPercent}%`, background: progressColor }}
              />
            </div>
            <div className="list-card__progress-percent" style={{ color: progressColor }}>{displayedPercent}%</div>
          </div>

          <div className="list-card__bottom-row">
            <div className="list-card__tags">
              {list.tags?.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="list-card__tag">{tag}</span>
              ))}
            </div>
            <div className="list-card__deadline">
              <Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {list.deadline ? `Prazo entrega em ${formatDateTime(list.deadline)}` : 'Prazo entrega em --'}
            </div>
          </div>
        </div>

        <div className="list-card__nav">
          <ArrowRight size={20} />
        </div>
      </div>
    </div>
  );
};

export const ListsView: React.FC<
  ListsViewProps & { onQuestionsAdded?: () => void; loadingListId?: string | null }
> = ({
  lists,
  viewMode,
  onListClick,
  onQuestionsAdded,
  loadingListId = null,
  className = '',
}) => {

    if (lists.length === 0) {
      return (
        <div className="question-list__empty">
          <FileText size={64} className="question-list__empty-icon" />
          <h3 className="question-list__empty-title">Nenhuma lista encontrada</h3>
          <p className="question-list__empty-desc">Parece que ainda não há listas de questões. Crie sua primeira lista para começar a organizar as avaliações.</p>
          <div className="question-list__empty-actions">
            {/* Usamos o AddListButton para abrir o modal de criação de lista */}
            <AddListButton className="add-list-button--empty" professorId={localStorage.getItem('userId') || ''} onCreated={() => onQuestionsAdded && onQuestionsAdded()} />
          </div>
        </div>
      );
    }

    return (
      <div className={`lists-view ${className}`}>
        <div className={viewMode === 'grid' ? 'lists-view__grid' : 'lists-view__list'}>
          {lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              onClick={onListClick}
              viewMode={viewMode}
              onQuestionsAdded={onQuestionsAdded}
              isLoading={Boolean(loadingListId && loadingListId === list.id)}
            />
          ))}
        </div>
      </div>
    );
  };

export default ListsView;