import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './CreateActivityModal.css';
import { professorService } from '../../../listaQuestoes/services/api/professorService';
import { listaService } from '../../../listaQuestoes/services/api/listaService';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: any) => void;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxGrade, setMaxGrade] = useState<number | ''>('');
  const [discipline, setDiscipline] = useState('');
  const [associatedList, setAssociatedList] = useState('');
  const [disciplinasOptions, setDisciplinasOptions] = useState<any[] | null>(null);
  const [listasOptions, setListasOptions] = useState<any[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // focus the first input when modal opens
      setTimeout(() => {
        try {
          nameRef.current?.focus();
        } catch (err) {}
      }, 50);
      // when opening modal, if user is professor, fetch disciplinas and listas
      (async () => {
        setLoadError(null);
        setDisciplinasOptions(null);
        setListasOptions(null);
        try {
          const rawRole = localStorage.getItem('role') || '';
          const normalizedRole = String(rawRole).toUpperCase();
          if (normalizedRole === 'PROFESSOR' || normalizedRole === 'TEACHER' || normalizedRole === 'INSTITUICAO') {
            const professorId = localStorage.getItem('userId') || '';
            if (professorId) {
              // fetch disciplinas and listas in parallel
              const [disc, lists] = await Promise.all([
                professorService.getDisciplinasByProfessor(professorId),
                listaService.getListsByProfessor(professorId),
              ]);
              setDisciplinasOptions(disc || []);
              setListasOptions(lists || []);
              // set defaults if available
              if (disc && disc.length > 0) setDiscipline(disc[0].id || disc[0].nome || '');
              if (lists && lists.length > 0) setAssociatedList(lists[0].id || '');
            }
          }
        } catch (err: any) {
          console.error('Erro ao carregar disciplinas/listas:', err);
          setLoadError('Erro ao carregar disciplinas ou listas. Você pode inserir manualmente.');
        }
      })();
    }
  }, [isOpen]);

  useEffect(() => {
    let prevOverflow: string | null = null;
    if (isOpen) {
      document.body.classList.add('modal-open');
      // lock background scroll
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.classList.remove('modal-open');
      // restore previous overflow
      if (prevOverflow !== null) {
        document.body.style.overflow = prevOverflow;
      } else {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen]);

  // simple focus-trap: keep focus inside modal and handle Escape
  useEffect(() => {
    if (!isOpen) return;

    const root = document.querySelector('.camodal-content');
    if (!root) return;

    const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector)).filter((el) => el.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          // shift+tab
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    // ensure first focusable is focused
    setTimeout(() => first?.focus(), 0);

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, description, dueDate, maxGrade, discipline, associatedList, file };
    if (onCreate) onCreate(payload);
    // minimal behavior: close modal after create
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const removeFile = () => setFile(null);

  const modal = (
    <div className="modal-overlay camodal-overlay" onClick={onClose}>
      <div className="modal-content camodal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
  <button className="camodal-close" aria-label="Fechar" onClick={onClose}>×</button>
  <h2 className="camodal-title">Criar Atividade</h2>
  <form className="camodal-form" onSubmit={handleSubmit}>
          <label className="camodal-label">Nome da atividade</label>
          <input ref={nameRef} className="camodal-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Prova - Capítulo 1" required />

          <label className="camodal-label">Descrição da atividade</label>
          <textarea className="camodal-textarea" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="camodal-row">
            <div className="camodal-col">
              <label className="camodal-label">Prazo</label>
              <input className="camodal-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="camodal-col">
              <label className="camodal-label">Nota máxima</label>
              <input className="camodal-input" type="number" value={maxGrade as any} onChange={(e) => setMaxGrade(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          </div>

          <label className="camodal-label">Disciplina</label>
          {disciplinasOptions && disciplinasOptions.length > 0 ? (
            <select className="camodal-input" value={discipline} onChange={(e) => setDiscipline(e.target.value)}>
              {disciplinasOptions.map((d: any) => (
                <option key={d.id || d.nome} value={d.id || d.nome}>{d.nome || d.nome}</option>
              ))}
            </select>
          ) : (
            <input className="camodal-input" value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder={loadError ? 'Insira a disciplina manualmente' : 'Carregando...'} />
          )}

          <label className="camodal-label">Associar a uma lista de exercícios (opcional)</label>
          {listasOptions && listasOptions.length > 0 ? (
            <select className="camodal-input" value={associatedList} onChange={(e) => setAssociatedList(e.target.value)}>
              <option value="">-- Nenhuma --</option>
              {listasOptions.map((l: any) => (
                <option key={l.id} value={l.id}>{l.titulo || l.title || `Lista ${l.id}`}</option>
              ))}
            </select>
          ) : (
            <input className="camodal-input" value={associatedList} onChange={(e) => setAssociatedList(e.target.value)} placeholder={loadError ? 'Insira o id da lista manualmente' : 'Carregando...'} />
          )}

          <label className="camodal-label">Anexação de documento</label>
          <div className="camodal-filewrap">
            <label htmlFor="camodal-file" className="camodal-filelabel">
              <span>{file ? file.name : 'Escolher arquivo'}</span>
              <input id="camodal-file" type="file" onChange={handleFileChange} />
            </label>
            {file && (
              <button type="button" className="camodal-file-remove" onClick={removeFile} aria-label="Remover arquivo">Remover</button>
            )}
            <div className="camodal-file-hint">PDF, DOCX ou imagens — máximo 10MB</div>
          </div>

          <div className="camodal-cta-full">
            <button type="submit" className="camodal-btn camodal-btn--primary" disabled={!name.trim()}>Criar</button>
          </div>
          <div className="camodal-actions">
            <button type="button" className="camodal-btn camodal-btn--muted" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default CreateActivityModal;
