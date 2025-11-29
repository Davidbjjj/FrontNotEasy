import React, { useState } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';

interface DisciplinaManagerProps {
    instituicaoId: string;
    professorOptions: { id: string; nome: string }[];
    disciplinasList: any[];
    onSuccess: () => void;
}

const DisciplinaManager: React.FC<DisciplinaManagerProps> = ({ instituicaoId, professorOptions, disciplinasList, onSuccess }) => {
    const [disciplina, setDisciplina] = useState({ nome: '', professorId: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleCreateDisciplina = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!disciplina.nome) return setMessage('Informe o nome da disciplina');
        // Professor is optional in some contexts, but let's keep it consistent with previous logic
        // if (!disciplina.professorId) return setMessage('Informe o professor responsável (ID)');

        setLoading(true);
        try {
            const payload = { nome: disciplina.nome, instituicaoId, professorId: disciplina.professorId };
            await instituicaoService.createDisciplina(payload);
            setMessage('Disciplina criada com sucesso');
            setDisciplina({ nome: '', professorId: '' });
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manager-container">
            <h2>Gerenciar Disciplinas</h2>
            {message && <div className="instituicao-message">{message}</div>}

            <div className="form-section">
                <h3>Criar Nova Disciplina</h3>
                <form onSubmit={handleCreateDisciplina} className="instituicao-form">
                    <div className="form-group">
                        <label>Nome da Disciplina</label>
                        <input placeholder="Ex: Matemática Avançada" value={disciplina.nome} onChange={(e) => setDisciplina({ ...disciplina, nome: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Professor Responsável (Opcional)</label>
                        <select value={disciplina.professorId} onChange={(e) => setDisciplina({ ...disciplina, professorId: e.target.value })}>
                            <option value="">-- Selecionar Professor --</option>
                            {professorOptions.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="submit-btn">{loading ? 'Criando...' : 'Criar Disciplina'}</button>
                </form>
            </div>

            <div className="list-section" style={{ marginTop: '30px' }}>
                <h3>Disciplinas Cadastradas</h3>
                {disciplinasList.length === 0 ? (
                    <p>Nenhuma disciplina encontrada.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '10px' }}>Nome</th>
                                <th style={{ padding: '10px' }}>Professor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disciplinasList.map((d) => (
                                <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px' }}>{d.nome}</td>
                                    <td style={{ padding: '10px' }}>{d.nomeProfessor || (d.professor && d.professor.nome) || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DisciplinaManager;
