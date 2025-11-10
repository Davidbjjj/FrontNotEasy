import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from '../../../services/apiClient';

export default function QuestoesPage() {
    const { id } = useParams();
    const [questoes, setQuestoes] = useState([]);

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

                {questoes.length === 0 ? (
                    <p className="text-gray-500">Nenhuma questão encontrada.</p>
                ) : (
                    <div className="space-y-6">
                        {questoes.map((q) => (
                            <div
                                key={q.id}
                                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
                            >
                                <h2 className="font-semibold text-lg text-gray-800 mb-2">
                                    {q.cabecalho}
                                </h2>
                                <p className="text-gray-700 mb-4">{q.enunciado}</p>
                                <ul className="space-y-2">
                                    {q.alternativas.map((alt, i) => (
                                        <li
                                            key={i}
                                            className="border rounded-lg p-2 hover:bg-gray-100 transition"
                                        >
                                            {alt}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
