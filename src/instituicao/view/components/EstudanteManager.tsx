import React, { useState } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';

interface EstudanteManagerProps {
    instituicaoId: string;
}

const EstudanteManager: React.FC<EstudanteManagerProps> = ({ instituicaoId }) => {
    const [estudante, setEstudante] = useState({ nome: '', email: '', senha: '', dataNascimento: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const isEmailValid = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    const isDateValid = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

    const handleCreateEstudante = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!estudante.nome) return setMessage('Informe o nome do estudante');
        if (!estudante.email) return setMessage('Informe o email do estudante');
        if (!isEmailValid(estudante.email)) return setMessage('Email do estudante inválido');
        if (!estudante.senha || estudante.senha.length < 6) return setMessage('Senha deve ter ao menos 6 caracteres');
        if (!estudante.dataNascimento) return setMessage('Informe a data de nascimento');
        if (!isDateValid(estudante.dataNascimento)) return setMessage('Formato de data inválido (YYYY-MM-DD)');

        setLoading(true);
        try {
            const payload = { nome: estudante.nome, dataNascimento: estudante.dataNascimento || '', email: estudante.email, senha: estudante.senha, instituicaoId };
            await instituicaoService.registerEstudante(payload);
            setMessage('Estudante criado com sucesso');
            setEstudante({ nome: '', email: '', senha: '', dataNascimento: '' });
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
            <h2>Gerenciar Estudantes</h2>
            {message && <div className="instituicao-message">{message}</div>}

            <div className="form-section">
                <h3>Criar Novo Estudante</h3>
                <form onSubmit={handleCreateEstudante} className="instituicao-form">
                    <div className="form-group">
                        <label>Nome</label>
                        <input placeholder="Nome completo" value={estudante.nome} onChange={(e) => setEstudante({ ...estudante, nome: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input placeholder="Email" value={estudante.email} onChange={(e) => setEstudante({ ...estudante, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input type="password" placeholder="Senha" value={estudante.senha} onChange={(e) => setEstudante({ ...estudante, senha: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Data de Nascimento</label>
                        <input type="date" value={estudante.dataNascimento} onChange={(e) => setEstudante({ ...estudante, dataNascimento: e.target.value })} />
                    </div>
                    <button type="submit" disabled={loading} className="submit-btn">{loading ? 'Criando...' : 'Criar Estudante'}</button>
                </form>
            </div>
        </div>
    );
};

export default EstudanteManager;
