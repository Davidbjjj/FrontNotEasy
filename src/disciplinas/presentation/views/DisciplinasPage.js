import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../components/Disciplinas.module.css";
import api from '../../../services/apiClient';

export default function DisciplinasPage() {
    const [listas, setListas] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    // mock por agora, mas isso vai ser trocado pela captura dos IDS dos usuários logados, pra fazer isso aqui rodar local é só pegar o ID de um usuário lá do banco, e passar a role também
    const userRole = "PROFESSOR"; // ou "ESTUDANTE"
    const mockIds = {
        PROFESSOR: "78ce4ef4-3a75-4975-9d38-2524b4402345",
        ESTUDANTE: "a77cb20e-3210-4f09-bb85-c1fda1245981",
    };
    const userId = mockIds[userRole];

    useEffect(() => {
        const fetchListas = async () => {
            try {
                const endpoint =
                    userRole === "PROFESSOR"
                        ? `https://backnoteasy-production.up.railway.app/listas/professor/${userId}`
                        : `https://backnoteasy-production.up.railway.app/listas/estudante/${userId}`;

                // endpoint is now a relative path handled by apiClient baseURL
                const path = userRole === 'PROFESSOR'
                    ? `/listas/professor/${userId}`
                    : `/listas/estudante/${userId}`;
                const response = await api.get(path);
                setListas(response.data);
            } catch (error) {
                console.error("Erro ao buscar listas:", error);
            }
        };

        fetchListas();
    }, [userRole, userId]);

    const listasFiltradas = listas.filter(
        (lista) =>
            lista.titulo.toLowerCase().includes(search.toLowerCase()) ||
            (lista.professorNome &&
                lista.professorNome.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <h1 className={styles.title}>
                    {userRole === "PROFESSOR" ? "Minhas Listas" : "Minhas Atividades"}
                </h1>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Buscar lista por título ou professor..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                    <Search size={18} color="#636e72" />
                </div>
            </div>


            <div className={styles.grid}>
                {listasFiltradas.length > 0 ? (
                    listasFiltradas.map((lista) => (
                        <div
                            key={lista.id}
                            className={styles.card}
                            onClick={() => navigate(`/listas/${lista.id}`)}
                        >
                            <img
                                src="https://img.icons8.com/color/240/books.png"
                                alt={lista.titulo}
                                className={styles.cardImage}
                            />
                            <h2 className={styles.cardTitle}>{lista.titulo}</h2>
                            <p className={styles.cardSubtitle}>
                                Professor(a):{" "}
                                {lista.professorNome ? lista.professorNome : "Desconhecido"}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className={styles.emptyText}>Nenhuma lista encontrada.</p>
                )}
            </div>
        </div>
    );
}
