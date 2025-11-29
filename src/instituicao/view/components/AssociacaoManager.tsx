import React, { useState } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';

interface AssociacaoManagerProps {
    disciplinasList: any[];
    professorOptions: { id: string; nome: string }[];
}

const AssociacaoManager: React.FC<AssociacaoManagerProps> = ({ disciplinasList, professorOptions }) => {
    const [addEstPayload, setAddEstPayload] = useState({ disciplinaId: '', estudanteId: '' });
    const [assocProfPayload, setAssocProfPayload] = useState({ disciplinaId: '', professorId: '' });
    const [loadingAddEst, setLoadingAddEst] = useState(false);
    const [loadingAssociateProf, setLoadingAssociateProf] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleAddEstudanteToDisciplina = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!addEstPayload.disciplinaId) return setMessage('Informe disciplinaId');
        if (!addEstPayload.estudanteId) return setMessage('Informe estudanteId');
        setLoadingAddEst(true);
        try {
            const payload = { estudanteId: addEstPayload.estudanteId, disciplinaId: addEstPayload.disciplinaId };
            await instituicaoService.addEstudanteToDisciplina(payload);
            setMessage('Estudante matriculado com sucesso');
            setAddEstPayload({ disciplinaId: '', estudanteId: '' });
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            setMessage(errorMsg);
        } finally {
            setLoadingAddEst(false);
        }
    };

    const handleAssociateProfessor = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!assocProfPayload.disciplinaId) return setMessage('Informe disciplinaId');
        if (!assocProfPayload.professorId) return setMessage('Informe professorId');
        setLoadingAssociateProf(true);
        try {
            await instituicaoService.associateProfessorToDisciplina(assocProfPayload.disciplinaId, assocProfPayload.professorId);
            setMessage('Professor associado com sucesso');
            setAssocProfPayload({ disciplinaId: '', professorId: '' });
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.message || errorData?.error || String(err));
            setMessage(errorMsg);
        } finally {
            setLoadingAssociateProf(false);
        }
    };

    return (
        <div className="manager-container">
            <h2>Associações</h2>
            {message && <div className="instituicao-message">{message}</div>}

            <div className="form-section">
                <h3>Adicionar Estudante a Disciplina</h3>
                <form onSubmit={handleAddEstudanteToDisciplina} className="instituicao-form">
                    <div className="form-group">
                        <label>Disciplina</label>
                        <select value={addEstPayload.disciplinaId} onChange={(e) => setAddEstPayload({ ...addEstPayload, disciplinaId: e.target.value })}>
                            <option value="">-- Selecionar --</option>
                            {disciplinasList.map((d) => (
                                <option key={d.id} value={d.id}>{d.nome}{d.nomeProfessor ? ` — ${d.nomeProfessor}` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>ID do Estudante</label>
                        <input placeholder="EstudanteId" value={addEstPayload.estudanteId} onChange={(e) => setAddEstPayload({ ...addEstPayload, estudanteId: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loadingAddEst} className="submit-btn">{loadingAddEst ? 'Processando...' : 'Adicionar Estudante'}</button>
                </form>
            </div>

            <div className="form-section" style={{ marginTop: '30px' }}>
                <h3>Associar Professor a Disciplina</h3>
                <form onSubmit={handleAssociateProfessor} className="instituicao-form">
                    <div className="form-group">
                        <label>Disciplina</label>
                        <select value={assocProfPayload.disciplinaId} onChange={(e) => setAssocProfPayload({ ...assocProfPayload, disciplinaId: e.target.value })}>
                            <option value="">-- Selecionar --</option>
                            {disciplinasList.map((d) => (
                                <option key={d.id} value={d.id}>{d.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Professor</label>
                        <select value={assocProfPayload.professorId} onChange={(e) => setAssocProfPayload({ ...assocProfPayload, professorId: e.target.value })}>
                            <option value="">-- Selecionar --</option>
                            {professorOptions.map((p) => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={loadingAssociateProf} className="submit-btn">{loadingAssociateProf ? 'Processando...' : 'Associar Professor'}</button>
                </form>
            </div>
        </div>
    );
};

export default AssociacaoManager;
