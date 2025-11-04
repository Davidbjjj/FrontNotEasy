import { useNavigate } from "react-router-dom"
import "./HomePage.css"

export default function HomePage() {
    const navigate = useNavigate()

    const handleSelectRole = (role) => {
        if (role === "student") {
            navigate("/cadastro-estudante")
        } else if (role === "teacher") {
            navigate("/cadastro-professor")
        }
    }

    return (
        <div className="home-page">
            <header className="header">
                <div className="logo-container">
                    <span className="logo-ggf">GGE</span>
                    <span className="logo-noteasy">noteasy</span>
                </div>
            </header>

            <main className="home-main">
                <h1 className="home-title">Bem-vindo ao Sistema de Cadastro</h1>
                <p className="home-subtitle">Selecione seu perfil para continuar</p>

                <div className="cards-container">
                    <div className="role-card" onClick={() => handleSelectRole("student")}>
                        <div className="card-icon student-icon">👨‍🎓</div>
                        <h2 className="card-title">Sou Aluno</h2>
                        <p className="card-description">Cadastro para estudantes</p>
                        <button className="card-button">Continuar como Aluno</button>
                    </div>

                    <div className="role-card" onClick={() => handleSelectRole("teacher")}>
                        <div className="card-icon teacher-icon">👨‍🏫</div>
                        <h2 className="card-title">Sou Professor</h2>
                        <p className="card-description">Cadastro para professores</p>
                        <button className="card-button">Continuar como Professor</button>
                    </div>
                </div>
            </main>
        </div>
    )
}
