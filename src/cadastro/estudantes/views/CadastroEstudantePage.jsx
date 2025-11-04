"use client"

import { useState } from "react"
import "./CadastroEstudantePage.css"

export default function StudentRegistration({ onBack }) {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "",
        birthDate: "",
        email: "",
        phone: "",
        secondaryPhone: "",
        password: "",
        instituicao: "Colégio GGE"
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1)
    }

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
        else onBack()
    }

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:8080/estudantes/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: formData.fullName,
                    email: formData.email,
                    senha: formData.password,
                    dataNascimento: new Date(formData.birthDate).toISOString(),
                    instituicao: formData.instituicao,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Erro do servidor:", errText);
                throw new Error("Erro ao cadastrar estudante");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.id);
            localStorage.setItem("role", "ESTUDANTE");
            localStorage.setItem("nome", data.nome);

            alert("Cadastro realizado com sucesso!");
            console.log("Estudante criado:", data);

            window.location.href = "/disciplinas";
        } catch (err) {
            console.error(err);
            alert("Falha ao cadastrar estudante.");
        }
    };


    const isStep1Valid = formData.fullName && formData.birthDate
    const isStep2Valid = formData.email && formData.password && formData.instituicao

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
                    <div className="step-header">
                        <h2 className="step-title">Cadastro - Estudante</h2>
                        <div className="step-indicator">
                            {currentStep === 1 && <span>1. Dados do(a) estudante</span>}
                            {currentStep === 2 && <span>2. Dados de contato</span>}
                            {currentStep === 3 && <span>3. Confirmação</span>}
                        </div>
                    </div>

                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(currentStep / 3) * 100}%` }}></div>
                    </div>

                    <div className="step-counter">{currentStep} de 3</div>

                    <form className="registration-form">
                        {currentStep === 1 && (
                            <div className="step-content">
                                <div className="form-group">
                                    <label className="form-label">Nome completo</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="Seu nome completo"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Data de nascimento</label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="step-content">
                                <div className="form-group">
                                    <label className="form-label">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="seu.email@exemplo.com"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Senha</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="********"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Instituição</label>
                                    <input
                                        type="text"
                                        name="instituicao"
                                        value={formData.instituicao}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Colégio GGE"
                                        className="form-input"
                                    />
                                </div>

                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="step-content">
                                <h3 className="confirmation-title">Confirme seus dados</h3>
                                <p><b>Nome:</b> {formData.fullName}</p>
                                <p><b>E-mail:</b> {formData.email}</p>
                                <p><b>Data de nascimento:</b> {formData.birthDate}</p>
                                <p><b>Instituição:</b> {formData.instituicao}</p>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="button" onClick={handleBack} className="btn-secondary">← Voltar</button>

                            {currentStep < 3 ? (
                                <button type="button" onClick={handleNext} disabled={!canContinue} className="btn-primary">
                                    Próximo →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="btn-primary"
                                >
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
