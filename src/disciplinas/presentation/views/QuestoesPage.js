import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from '../../../services/apiClient';
import { getCurrentUser } from '../../../auth/auth';
import QuestionEstudante from '../../../questionaluno/QuestionEstudante';
import QuestionProfessor from '../../../questionaluno/QuestionProfessor';

export default function QuestoesPage() {
    const { id } = useParams();
    const [questoes, setQuestoes] = useState([]);
    const currentUser = getCurrentUser();
    // Normaliza a leitura do papel (role): primeiro do token decodificado, depois do localStorage.
    const rawRole = currentUser?.role || localStorage.getItem('role') || '';
    const normalizedRole = String(rawRole).toUpperCase();
    const isProfessor = normalizedRole === 'PROFESSOR' || normalizedRole === 'INSTITUICAO' || normalizedRole === 'TEACHER';

    useEffect(() => {
        const fetchQuestoes = async () => {
            try {
                const response = await api.get(`/listas/${id}/questoes`);
                setQuestoes(response.data);
            } catch (error) {
                console.error("Erro ao buscar questões:", error);
            }
        };
        fetchQuestoes();
    }, [id]);

    const handleAdd = () => {
        // Navegar para página de criação/edição ou abrir modal
        // Implementação mínima: redirecionar para uma rota de criação (se existir)
        window.location.href = `/listas/${id}/questoes/novo`;
    };

    const handleEdit = (questaoId) => {
        // Redireciona para rota de edição (implemente a rota conforme necessário)
        window.location.href = `/listas/${id}/questoes/${questaoId}/editar`;
    };

    const handleDelete = async (questaoId) => {
        if (!window.confirm('Deseja realmente excluir esta questão?')) return;
        try {
            await api.delete(`/listas/${id}/questoes/${questaoId}`);
            // atualizar lista local
            setQuestoes((prev) => prev.filter((q) => q.id !== questaoId));
        } catch (err) {
            console.error('Erro ao excluir questão:', err);
            alert('Erro ao excluir a questão. Verifique o console.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
            <div className="w-full max-w-4xl bg-white shadow-lg rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <ArrowLeft
                        size={22}
                        className="cursor-pointer text-gray-600 hover:text-black transition"
                        onClick={() => window.history.back()}
                    />
                    <h1 className="text-2xl font-bold text-gray-800">
                        Questões da Lista {id}
                    </h1>
                </div>

                {isProfessor && (
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={handleAdd}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Adicionar questão
                        </button>
                    </div>
                )}

                {questoes.length === 0 ? (
                    <p className="text-gray-500">Nenhuma questão encontrada.</p>
                ) : (
                    <div className="space-y-6">
                        {questoes.map((q) => (
                            <div key={q.id}>
                                {isProfessor ? (
                                    <QuestionProfessor questao={q} onEdit={handleEdit} onDelete={handleDelete} />
                                ) : (
                                    <QuestionEstudante questao={q} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
