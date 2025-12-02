import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDisciplinaViewModel } from "../../viewmodels/useDisciplinaViewModel";
import styles from "../components/Disciplinas.module.css";

export default function DisciplinasPage() {
    const navigate = useNavigate();
    const {
        disciplinas,
        isLoading,
        error,
        searchTerm,
        handleSearch,
        userRole,
    } = useDisciplinaViewModel();

    const handleSearchChange = (e) => {
        handleSearch(e.target.value);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {userRole === "PROFESSOR" ? "Minhas Disciplinas" : "Minhas Disciplinas"}
                </h1>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Buscar disciplina por nome, professor ou escola..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <Search size={18} color="#636e72" />
                </div>
            </div>

            <div className={styles.grid}>
                {isLoading ? (
                    <p className={styles.emptyText}>Carregando disciplinas...</p>
                ) : error ? (
                    <p className={styles.emptyText}>Erro: {error}</p>
                ) : disciplinas.length > 0 ? (
                    disciplinas.map((disciplina) => (
                        <div
                            key={disciplina.id}
                            className={styles.card}
                            onClick={() => navigate(`/disciplinas/${disciplina.id}`)}
                        >
                            <img
                                src="https://img.icons8.com/color/240/books.png"
                                alt={disciplina.nome}
                                className={styles.cardImage}
                            />
                            <h2 className={styles.cardTitle}>{disciplina.nome}</h2>
                            <p className={styles.cardSubtitle}>
                                Professor(a): {(() => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        if (token) {
                                            const { decodeJwt } = require('../../../auth/jwt');
                                            const payload = decodeJwt(token);
                                            if (payload && payload.nome) return payload.nome;
                                        }
                                    } catch (err) {
                                        // ignore
                                    }
                                    return disciplina.nomeProfessor;
                                })()}
                            </p>
                            <p className={styles.cardSubtitle}>
                                Escola: {disciplina.nomeEscola}
                            </p>
                            <p className={styles.cardSubtitle}>
                                Alunos: {disciplina.quantidadeAlunos ?? (disciplina.alunos ? disciplina.alunos.length : 0)}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className={styles.emptyText}>Nenhuma disciplina encontrada.</p>
                )}
            </div>
        </div>
    );
}
