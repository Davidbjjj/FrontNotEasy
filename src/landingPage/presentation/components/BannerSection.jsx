import React from "react";
import { useNavigate } from "react-router-dom";
import "./BannerSection.css";
const BRAND_LOGO = "/Alunos.svg";
const BannerSection = () => {
  const navigate = useNavigate();
  const handleCTA = () => navigate("/login");

  return (
    <section className="banner-section">
      <div className="container banner-grid">
        <div className="banner-content">
          <p className="eyebrow">Plataforma para Instituições de Ensino</p>
          <h1 className="banner-title">
            Transforme conteúdo em dados e dados em aprendizado
          </h1>
          <p className="banner-subtitle">
            Organize listas, atividades e provas em um só lugar. Acompanhe o 
            desempenho em tempo real e tome decisões com base em dados.
          </p>
          <div className="banner-actions">
            <button className="cta-button" onClick={handleCTA}>Começar agora</button>
            <a className="cta-secondary" href="#conheca">Ver como funciona</a>
          </div>
        </div>

        <div className="banner-images">
          <img src={BRAND_LOGO} alt="Ilustração alunos" />
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
