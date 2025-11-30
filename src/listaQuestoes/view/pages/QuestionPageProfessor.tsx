import React, { useEffect, useState, useRef } from 'react';
import api from '../../../services/apiClient';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService } from '../../../question/service/api/question.service';
import { respostaService } from '../../../question/service/api/respostaService';
import ImageWithAuth from '../../../components/ImageWithAuth';
import './QuestionPageProfessor.css';

// Small helper components inside file to keep everything together
const Modal: React.FC<{ onClose: () => void; title?: string; children?: React.ReactNode }> = ({ onClose, title, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="qpp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="qpp-modal" ref={ref}>
        <div className="qpp-modal-header">
          <div className="qpp-modal-title">{title}</div>
          <div>
            <button className="qpp-hamburger" aria-label="Fechar" onClick={onClose}>✕</button>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Small toast system local to this page (no extra deps)
type ToastItem = { id: string; message: string; type?: 'success' | 'error' | 'info' };
const useLocalToasts = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const show = (message: string, type: ToastItem['type'] = 'info', timeout = 3500) => {
    const id = String(Date.now()) + Math.random().toString(16).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  };
  return { toasts, show };
};

const ToastList: React.FC<{ toasts: ToastItem[] }> = ({ toasts }) => {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="qpp-toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`qpp-toast ${t.type || ''}`}>{t.message}</div>
      ))}
    </div>
  );
};


const ConfirmModal: React.FC<{ open: boolean; title?: string; message?: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }> = ({ open, title, message, onConfirm, onCancel, loading }) => {
  if (!open) return null;
  return (
    <div className="qpp-modal-backdrop">
      <div className="qpp-modal">
        <div className="qpp-modal-header">
          <div className="qpp-modal-title">{title || 'Confirmação'}</div>
        </div>
        <div style={{ marginTop: 6 }}>{message}</div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="qpp-btn" onClick={onCancel} disabled={!!loading}>Cancelar</button>
          <button className="qpp-btn danger" onClick={onConfirm} disabled={!!loading}>
            {loading ? <span className="qpp-spinner" /> : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionPageProfessor: React.FC = () => {
  const { listaId } = useParams<{ listaId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal / edit state
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [formState, setFormState] = useState<{ cabecalho: string; enunciado: string; alternativas: string[]; gabarito: number } | null>(null);
  const [altEditIndex, setAltEditIndex] = useState<number | null>(null);

  // menu state per alternative (open menu index)
  const [openAltMenuIndex, setOpenAltMenuIndex] = useState<number | null>(null);
  const { toasts, show } = useLocalToasts();
  // delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewVisaoStudent, setPreviewVisaoStudent] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!listaId) return setError('Lista não informada');
      try {
        setLoading(true);
        // allow professor to view a specific student's visao by adding
        // ?estudanteId=<id> to the URL. If provided, prefer the visao
        // values (when lista is not finalizada) so the professor sees
        // provisional student data instead of the sampling endpoint.
        const params = new URLSearchParams(window.location.search);
        const estudanteQuery = params.get('estudanteId');

        if (estudanteQuery) {
          try {
            const vis = await respostaService.fetchVisao(listaId, estudanteQuery);
            // Support both shapes: vis.lista.questoes and vis.questoes (top-level)
            const questoesFromVis = (vis && (vis.questoes || vis.lista?.questoes)) || null;
            const isFinalizada = Boolean(vis && (vis.finalizada || vis.respondida || vis.respondida === true));

            if (questoesFromVis && !isFinalizada) {
              // use the questoes from visao as source of truth while not finalized
              const totalQ = Array.isArray(questoesFromVis) ? questoesFromVis.length : 0;
              const questionsData = (questoesFromVis || []).map((dto: any, idx: number) => (questionService as any).transformDTOToQuestion ? (questionService as any).transformDTOToQuestion(dto, idx, totalQ) : dto);
              setQuestions(questionsData);
              setPreviewVisaoStudent({ estudanteId: estudanteQuery, visao: vis });
            } else if (questoesFromVis && isFinalizada) {
              // if the student's view is already finalized/respondida, show empty or final data
              setQuestions([]);
              setPreviewVisaoStudent({ estudanteId: estudanteQuery, visao: vis });
            } else {
              const dados = await questionService.getQuestionsByListId(listaId);
              setQuestions(dados);
              setPreviewVisaoStudent(null);
            }
          } catch (err) {
            // fall back to regular questions when visao fetch fails
            console.warn('Falha ao buscar visao do estudante, carregando questões normalmente', err);
            const dados = await questionService.getQuestionsByListId(listaId);
            setQuestions(dados);
            setPreviewVisaoStudent(null);
          }
        } else {
          const dados = await questionService.getQuestionsByListId(listaId);
          setQuestions(dados);
          setPreviewVisaoStudent(null);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar questões');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listaId]);

  // Open editor modal for a specific question
  const openEditor = (q: any) => {
    const initial = {
      cabecalho: q.title || '',
      enunciado: q.content || '',
      alternativas: q.options ? q.options.map((o: any) => o.text || '') : [],
      gabarito: q.correctAnswer ? q.correctAnswer.charCodeAt(0) - 65 : 0,
    };
    setEditingQuestion(q);
    setFormState(initial);
    setAltEditIndex(null);
    setOpenAltMenuIndex(null);
  };

  const closeEditor = () => {
    setEditingQuestion(null);
    setFormState(null);
    setAltEditIndex(null);
    setOpenAltMenuIndex(null);
  };

  // local setters
  const setField = (field: 'cabecalho' | 'enunciado' | 'alternativas' | 'gabarito', value: any) => {
    if (!formState) return;
    setFormState({ ...formState, [field]: value } as any);
  };

  const updateAlternativeText = (index: number, text: string) => {
    if (!formState) return;
    const next = [...formState.alternativas];
    next[index] = text;
    setFormState({ ...formState, alternativas: next });
  };

  const addAlternative = () => {
    if (!formState) return;
    setFormState({ ...formState, alternativas: [...formState.alternativas, ''] });
  };

  const removeAlternative = (index: number) => {
    if (!formState) return;
    const next = formState.alternativas.filter((_, i) => i !== index);
    let g = formState.gabarito;
    if (g >= next.length) g = Math.max(0, next.length - 1);
    setFormState({ ...formState, alternativas: next, gabarito: g });
  };

  const setAsGabarito = (index: number) => {
    if (!formState) return;
    setFormState({ ...formState, gabarito: index });
    setOpenAltMenuIndex(null);
  };

  const handleSave = async () => {
    if (!editingQuestion || !formState || !listaId) return;
    // validations
    if (!formState.alternativas || formState.alternativas.length === 0) {
      show('Alternativas não pode ser vazia.', 'error');
      return;
    }
    if (typeof formState.gabarito !== 'number' || formState.gabarito < 0 || formState.gabarito >= formState.alternativas.length) {
      show('Gabarito inválido. Selecione uma alternativa como gabarito.', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const body = {
        cabecalho: formState.cabecalho,
        enunciado: formState.enunciado,
        alternativas: formState.alternativas,
        gabarito: formState.gabarito,
      };
      const updated = await questionService.updateQuestion(listaId, editingQuestion.id, body);

      // update local list
      setQuestions((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? {
        ...p,
        id: String(updated.id),
        title: updated.cabecalho,
        content: updated.enunciado,
        options: (updated.alternativas || []).map((a: any, i: number) => {
          const text = typeof a === 'string' ? a : (a?.texto ?? '');
          return { id: String.fromCharCode(65 + i), label: String.fromCharCode(65 + i), value: String.fromCharCode(65 + i), text };
        }),
        correctAnswer: String.fromCharCode(65 + updated.gabarito),
        imagens: updated.imagens || []
      } : p)));

      closeEditor();
      show('Questão atualizada com sucesso.', 'success');
    } catch (err: any) {
      console.error(err);
      if (err && err.status === 400) {
        show('Validação inválida: ' + err.message, 'error');
      } else if (err && err.status === 404) {
        show('Questão não encontrada nesta lista.', 'error');
      } else {
        show('Erro ao atualizar questão.', 'error');
      }
    }
    finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (q: any) => {
    // open confirm modal
    setDeleteTarget(q);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !listaId) return setDeleteTarget(null);
    try {
      setIsDeleting(true);
      await questionService.deleteQuestion(listaId, deleteTarget.id);
      setQuestions((prev) => prev.filter((p) => String(p.id) !== String(deleteTarget.id)));
      setDeleteTarget(null);
      closeEditor();
      show('Questão excluída.', 'success');
    } catch (err: any) {
      console.error(err);
      if (err && err.status === 404) {
        show('Questão não encontrada nesta lista.', 'error');
      } else {
        show('Erro ao deletar questão.', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="qpp-container">Carregando questões...</div>;
  if (error) return (
    <div className="qpp-container">
      <h3>Erro</h3>
      <p>{error}</p>
      <button onClick={() => navigate('/listas')}>Voltar</button>
    </div>
  );

  return (
    <div className="qpp-container">
      <div className="qpp-header">
        <div className="qpp-title">Questões — Modo Professor</div>
        <div className="qpp-muted">Lista: {listaId}</div>
      </div>

      {previewVisaoStudent && previewVisaoStudent.estudanteId && (
        <div className="qpp-preview-banner" style={{ marginTop: 8, padding: 8, background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 6 }}>
          <div>
            Visualizando visão do estudante <strong>{previewVisaoStudent.estudanteId}</strong>
            {previewVisaoStudent.visao?.titulo && <span> — Lista: <strong>{previewVisaoStudent.visao.titulo}</strong></span>}
          </div>
          <div style={{ marginTop: 6 }}>
            {previewVisaoStudent.visao?.progresso ? (
              <span>Progresso: {previewVisaoStudent.visao.progresso.questoesRespondidas} / {previewVisaoStudent.visao.progresso.totalQuestoes}</span>
            ) : (previewVisaoStudent.visao?.totalQuestoes ? (
              <span>Progresso: {previewVisaoStudent.visao.questoesRespondidas ?? 0} / {previewVisaoStudent.visao.totalQuestoes}</span>
            ) : null)}
            {previewVisaoStudent.visao?.professorNome && <span style={{ marginLeft: 12 }}>Professor: {previewVisaoStudent.visao.professorNome}</span>}
          </div>
          <div style={{ marginTop: 6, fontStyle: 'italic' }}>Valores provisórios — o aluno ainda não finalizou a lista.</div>
        </div>
      )}

      <div>
        {questions.map((q, idx) => (
          <article key={q.id} className="qpp-question-card" aria-labelledby={`q-title-${q.id}`}>
            <div className="qpp-question-head">
              <div>
                <div className="qpp-question-number">QUESTÃO {idx + 1}</div>
                <div id={`q-title-${q.id}`} className="qpp-question-title">{q.title}</div>
              </div>
              <div className="qpp-actions">
                <button className="qpp-btn" onClick={() => openEditor(q)}>Editar</button>
                <button className="qpp-btn danger" onClick={() => handleDelete(q)}>Excluir</button>
              </div>
            </div>

            <div className="qpp-question-enunciado">{q.content}</div>

            {(q.imagens && q.imagens.length > 0) && (
              <div className="qpp-images" style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {q.imagens.map((img: any, i: number) => {
                  // Determine if image text (OCR) appears inside enunciado or any alternativa
                  const textoOcr = (img?.textoOcr || '').toString().trim();
                  const enunciado = String(q.content || '').toLowerCase();
                  const alternativasText = (q.options || []).map((o: any) => String(o.text || '').toLowerCase()).join('\n');
                  const isReferenced = textoOcr && (enunciado.includes(textoOcr.toLowerCase()) || alternativasText.includes(textoOcr.toLowerCase()));
                  const imgClass = `qpp-quest-image ${!isReferenced ? 'qpp-quest-image--large' : ''}`;
                  const rawSrc = img.urlPublica || img.url || img.src || '';
                  // Normalize relative URLs: if starts with '/' use api.defaults.baseURL as origin
                  const base = (api && (api.defaults && api.defaults.baseURL)) || 'https://backnoteasy-production.up.railway.app';
                  const normalized = rawSrc.startsWith('/') ? `${base}${rawSrc}` : rawSrc;
                  return (
                    <ImageWithAuth key={i} src={normalized} alt={img.nomeArquivo || `imagem-${i}`} className={imgClass} />
                  );
                })}
              </div>
            )}

            <ul className="qpp-alt-list">
              {q.options && q.options.map((o: any, i: number) => {
                const isCorrect = String(q.correctAnswer || '').toUpperCase() === String.fromCharCode(65 + i);
                return (
                  <li key={i} className={`qpp-alt-card ${isCorrect ? 'qpp-alt-correct' : ''}`} aria-label={`Alternativa ${String.fromCharCode(65 + i)}`}>
                    <div className="qpp-alt-letter">{String.fromCharCode(65 + i)}</div>
                    <div className="qpp-alt-text">{o.text}</div>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      {editingQuestion && formState && (
        <Modal title="Editar Questão" onClose={closeEditor}>
          <div className="qpp-row">
            <div className="qpp-col">
              <label className="qpp-label">Cabeçalho</label>
              <input className="qpp-input" value={formState.cabecalho} onChange={(e) => setField('cabecalho', e.target.value)} />

              <label className="qpp-label" style={{ marginTop: 12 }}>Enunciado</label>
              <textarea className="qpp-textarea" value={formState.enunciado} onChange={(e) => setField('enunciado', e.target.value)} />

              <div className="qpp-alternatives">
                <label className="qpp-label">Alternativas</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {formState.alternativas.map((alt, idx) => (
                    <div className="qpp-alt-item" key={idx}>
                      <div style={{ width: 36 }}><strong>{String.fromCharCode(65 + idx)}</strong></div>
                      <div className="qpp-alt-text">
                        {altEditIndex === idx ? (
                          <input className="qpp-input" value={alt} onChange={(e) => updateAlternativeText(idx, e.target.value)} />
                        ) : (
                          <div>{alt || <span style={{ color: '#9ca3af' }}>Texto vazio</span>}</div>
                        )}
                      </div>

                      <div style={{ marginRight: 12 }}>
                        {formState.gabarito === idx && <span className="qpp-badge">Gabarito</span>}
                      </div>

                      <div className="qpp-alt-actions">
                        <button className="qpp-hamburger" aria-label="Menu" onClick={() => setOpenAltMenuIndex(openAltMenuIndex === idx ? null : idx)}>⋮</button>
                        {openAltMenuIndex === idx && (
                          <div className="qpp-menu">
                            <button onClick={() => { setAsGabarito(idx); }}>Definir como gabarito</button>
                            <button onClick={() => { setAltEditIndex(idx); setOpenAltMenuIndex(null); }}>Editar alternativa</button>
                            <button onClick={() => { removeAlternative(idx); setOpenAltMenuIndex(null); }}>Remover alternativa</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10 }}>
                  <button className="qpp-btn" onClick={addAlternative}>Adicionar alternativa</button>
                </div>
              </div>

            </div>
          </div>

          <div className="qpp-footer">
            <div className="qpp-muted">Selecione a alternativa correta clicando em "⋮" → "Definir como gabarito"</div>
            <div>
              <button className="qpp-btn" onClick={closeEditor} style={{ marginRight: 8 }} disabled={isSaving}>Cancelar</button>
              <button className="qpp-btn primary" onClick={handleSave} disabled={isSaving}>{isSaving ? <span className="qpp-spinner" /> : 'Salvar alterações'}</button>
            </div>
          </div>
        </Modal>
      )}

      <div style={{ marginTop: 18 }}>
        <button className="qpp-btn" onClick={() => navigate('/listas')}>Voltar para Listas</button>
      </div>

      {/* Confirm delete modal */}
      <ConfirmModal open={!!deleteTarget} title="Excluir Questão" message="Deseja realmente excluir essa questão? Esta ação é irreversível." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} loading={isDeleting} />

      {/* Toasts */}
      <ToastList toasts={toasts} />
    </div>
  );
};

export default QuestionPageProfessor;
