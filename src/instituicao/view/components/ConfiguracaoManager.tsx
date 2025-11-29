import React, { useState } from 'react';
import { instituicaoService } from '../../services/api/instituicao.service';

interface ConfiguracaoManagerProps {
    instituicaoId: string;
    permittedEmails: string[];
    onUpdate: () => void;
}

const ConfiguracaoManager: React.FC<ConfiguracaoManagerProps> = ({ instituicaoId, permittedEmails, onUpdate }) => {
    const [email, setEmail] = useState('');
    const [loadingAddEmail, setLoadingAddEmail] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const isEmailValid = (em: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!email) return setMessage('Informe um email');
        if (!isEmailValid(email)) return setMessage('Email inválido');
        setLoadingAddEmail(true);
        try {
            await instituicaoService.addPermittedEmails(instituicaoId, [email]);
            setMessage('Email(s) permitidos adicionados com sucesso');
            setEmail('');
            onUpdate();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            setMessage(errorMsg);
        } finally {
            setLoadingAddEmail(false);
        }
    };

    const handleRemovePermittedEmail = async (emailToRemove: string) => {
        setMessage(null);
        try {
            await instituicaoService.removePermittedEmail(instituicaoId, emailToRemove);
            setMessage('Email removido com sucesso');
            onUpdate();
        } catch (err: any) {
            const errorData = err?.response?.data;
            const errorMsg = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || String(err));
            setMessage(errorMsg);
        }
    };

    return (
        <div className="manager-container">
            <h2>Configurações</h2>
            {message && <div className="instituicao-message">{message}</div>}

            <div className="form-section">
                <h3>Permitir Email de Professor</h3>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                    Adicione emails que podem ser usados para cadastro de professores nesta instituição.
                </p>
                <form onSubmit={handleAddEmail} className="instituicao-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input placeholder="email@dominio.edu.br" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type="submit" disabled={loadingAddEmail} className="submit-btn">{loadingAddEmail ? 'Adicionando...' : 'Adicionar Email'}</button>
                </form>

                <div style={{ marginTop: '20px' }}>
                    <strong>Emails permitidos:</strong>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        {permittedEmails.length === 0 ? (
                            <div style={{ color: '#6b7280' }}>Nenhum email cadastrado</div>
                        ) : (
                            permittedEmails.map((em) => (
                                <div key={em} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '4px' }}>
                                    <div>{em}</div>
                                    <div>
                                        <button type="button" onClick={() => handleRemovePermittedEmail(em)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Remover</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracaoManager;
