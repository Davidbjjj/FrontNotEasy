import React, { useEffect, useState } from 'react';
import { disciplinaService } from '../../services/api/disciplina.service';

interface EstudanteDTO {
  id: string;
  nome: string;
  email: string;
}

interface Props {
  disciplinaId: string;
  onClose: () => void;
  onSuccess?: (updatedDisciplina: any) => void;
}

const AdicionarAlunoModal: React.FC<Props> = ({ disciplinaId, onClose, onSuccess }) => {
  const [estudantes, setEstudantes] = useState<EstudanteDTO[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await disciplinaService.getAvailableStudents(disciplinaId);
        if (mounted) setEstudantes(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { mounted = false; document.removeEventListener('keydown', onKey); previouslyFocused.current?.focus(); };
  }, [disciplinaId, onClose]);

  const filtered = estudantes.filter(s => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (s.email || '').toLowerCase().includes(q) || (s.nome || '').toLowerCase().includes(q);
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedId) return setError('Selecione um estudante');
    setLoading(true);
    setError(null);
    try {
      const updated = await disciplinaService.addStudentToDisciplina(disciplinaId, selectedId);
      onSuccess && onSuccess(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao adicionar estudante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 520, maxWidth: '95%' }}>
        <h3>Adicionar Aluno à Disciplina</h3>
        <p>Buscar por email ou nome</p>

        <input
          ref={inputRef}
          placeholder="Buscar por email ou nome"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: 8, marginBottom: 8, borderRadius:6, border:'1px solid #e6eef6' }}
          aria-label="Buscar estudante por nome ou email"
        />

        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: 260, overflow: 'auto', border: '1px solid #eee', padding: 8, marginBottom: 8 }} role="listbox" aria-label="Lista de estudantes">
            {filtered.length === 0 ? (
              <div style={{ padding: 8, color: '#666' }}>Nenhum estudante encontrado.</div>
            ) : (
              filtered.map((s) => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 6 }} role="option" aria-selected={selectedId === s.id}>
                  <input type="radio" name="estudante" value={s.id} checked={selectedId === s.id} onChange={() => setSelectedId(s.id)} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.nome}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{s.email}</div>
                  </div>
                </label>
              ))
            )}
          </div>

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading || !selectedId}>{loading ? 'Adicionando...' : 'Adicionar Aluno'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdicionarAlunoModal;
