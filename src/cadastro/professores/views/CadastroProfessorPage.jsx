"use client"

import { useState } from "react"
import "./CadastroProfessorPage.css"

export default function TeacherRegistration({ onBack }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nome: "",
        materia1: "",
        materia2: "",
        instituicao: "Colégio GGE",
        email: "",
        senha: "",
        dataNascimento: ""
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleNext = () => currentStep < 3 && setCurrentStep(currentStep + 1)
    const handleBack = () => (currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack())

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:8080/professor/registrar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.fullName,
                    materia1: formData.subjects, // corresponde ao campo "materia1"
                    materia2: formData.expertise, // corresponde ao campo "materia2"
                    instituicao: "Colégio GGE",
                    email: formData.email,
                    senha: "123456", // provisório até termos campo senha
                    dataNascimento: new Date(formData.birthDate).toISOString(), // formato correto para o Spring
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Erro do servidor:", errText);
                throw new Error("Erro ao cadastrar professor");
            }

            const data = await response.json();

            // 🧩 salva sessão no localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.id);
            localStorage.setItem("role", "PROFESSOR");
            localStorage.setItem("nome", data.nome);

            alert("Cadastro realizado com sucesso!");
            console.log("Professor criado:", data);

            // Redirecionamento pós-cadastro
            window.location.href = "/disciplinas";
        } catch (err) {
            console.error(err);
            alert("Falha ao cadastrar professor.");
        }
    };



    const isStep1Valid = formData.nome && formData.dataNascimento
    const isStep2Valid = formData.email && formData.senha
    const canContinue = currentStep === 1 ? isStep1Valid : currentStep === 2 ? isStep2Valid : true

    return (
        <div className="registration-page">
            <header className="header">
                <div className="logo-container">
                    <span className="logo-ggf">GGE</span>
                    <span className="logo-noteasy">noteasy</span>
                </div>
            </header>

            <main className="registration-main">
                <div className="registration-container">
                    <h2 className="step-title">Cadastro - Professor</h2>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                    </div>

                    <form className="registration-form">
                        {currentStep === 1 && (
                            <>
                                <label className="form-label">Nome completo</label>
                                <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} className="form-input" />
                                <label className="form-label">Data de nascimento</label>
                                <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} className="form-input" />
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <label className="form-label">E-mail</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" />
                                <label className="form-label">Senha</label>
                                <input type="password" name="senha" value={formData.senha} onChange={handleInputChange} className="form-input" />
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <label className="form-label">Matéria 1</label>
                                <input type="text" name="materia1" value={formData.materia1} onChange={handleInputChange} className="form-input" />
                                <label className="form-label">Matéria 2 (opcional)</label>
                                <input type="text" name="materia2" value={formData.materia2} onChange={handleInputChange} className="form-input" />
                            </>
                        )}

                        <div className="form-actions">
                            <button type="button" onClick={handleBack} className="btn-secondary">← Voltar</button>
                            {currentStep < 3 ? (
                                <button type="button" onClick={handleNext} disabled={!canContinue} className="btn-primary">Próximo →</button>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary">
                                    {loading ? "Enviando..." : "Confirmar"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
