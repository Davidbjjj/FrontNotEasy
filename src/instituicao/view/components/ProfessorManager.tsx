import React, { useState } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';
import { Materia } from '../../services/api/materia.service';

interface ProfessorManagerProps {
    instituicaoId: string;
    materiasList: Materia[];
    onSuccess: () => void;
}

const ProfessorManager: React.FC<ProfessorManagerProps> = ({ instituicaoId, materiasList, onSuccess }) => {
    const [professor, setProfessor] = useState({ nome: '', email: '', senha: '', dataNascimento: '', materia1Id: '', materia2Id: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const isEmailValid = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    const isDateValid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

    const handleCreateProfessor = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        // basic validation
        if (!professor.nome) return setMessage('Informe o nome do professor');
        if (!professor.email) return setMessage('Informe o email do professor');
        if (!isEmailValid(professor.email)) return setMessage('Email do professor inválido');
        if (!professor.senha || professor.senha.length < 6) return setMessage('Senha deve ter ao menos 6 caracteres');
        if (!professor.materia1Id) return setMessage('Informe a matéria principal');
        if (professor.dataNascimento && !isDateValid(professor.dataNascimento)) return setMessage('Formato de data inválido (YYYY-MM-DD)');

        setLoading(true);
        try {
            const payload = {
                nome: professor.nome,
                dataNascimento: professor.dataNascimento || '',
                email: professor.email,
                senha: professor.senha,
                materia1Id: professor.materia1Id || '',
                materia2Id: professor.materia2Id || '',
                instituicaoId,
            };
            await instituicaoService.registerProfessor(payload);
            setMessage('Professor criado com sucesso');
            setProfessor({ nome: '', email: '', senha: '', dataNascimento: '', materia1Id: '', materia2Id: '' });
            onSuccess();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const msg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            // If backend says email not authorized, offer to add
            if (err?.response?.status === 400 && String(msg).toLowerCase().includes('email não autorizado')) {
                const confirmAdd = window.confirm('Email não autorizado. Deseja adicionar este e-mail à lista de permitidos?');
                if (confirmAdd) {
                    try {
                        await instituicaoService.addPermittedEmails(instituicaoId, [professor.email]);
                        setMessage('Email adicionado. Tente criar o professor novamente.');
                    } catch (addErr: any) {
                        setMessage(addErr?.response?.data || String(addErr));
                    }
                } else {
                    setMessage(msg);
                }
            } else {
                setMessage(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="manager-container">
            <h2>Gerenciar Professores</h2>
            {message && <div className="instituicao-message">{message}</div>}

            <div className="form-section">
                <h3>Criar Novo Professor</h3>
                <form onSubmit={handleCreateProfessor} className="instituicao-form">
                    <div className="form-group">
                        <label>Nome</label>
                        <input placeholder="Nome completo" value={professor.nome} onChange={(e) => setProfessor({ ...professor, nome: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input placeholder="Email" value={professor.email} onChange={(e) => setProfessor({ ...professor, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input type="password" placeholder="Senha" value={professor.senha} onChange={(e) => setProfessor({ ...professor, senha: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Data de Nascimento</label>
                        <input type="date" value={professor.dataNascimento} onChange={(e) => setProfessor({ ...professor, dataNascimento: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Matéria Principal</label>
                        <select value={professor.materia1Id} onChange={(e) => setProfessor({ ...professor, materia1Id: e.target.value })} required>
                            <option value="">-- Selecionar --</option>
                            {materiasList.map((m) => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Matéria Secundária (Opcional)</label>
                        <select value={professor.materia2Id} onChange={(e) => setProfessor({ ...professor, materia2Id: e.target.value })}>
                            <option value="">-- Selecionar --</option>
                            {materiasList.map((m) => (
                                <option key={m.id} value={m.id}>{m.nome}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="submit-btn">{loading ? 'Criando...' : 'Criar Professor'}</button>
                </form>
            </div>
        </div>
    );
};

export default ProfessorManager;
