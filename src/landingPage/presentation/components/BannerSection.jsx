import React from "react";
import "./BannerSection.css";
const BRAND_LOGO = "/Alunos.svg";
const BannerSection = () => {
  return (
    <section className="banner-section">
      <div className="banner-content">
        <h1>
          A Plataforma Inteligente <br />
          que Transforma Conteúdo em Dados <br />
          e Dados em Aprendizado.
        </h1>

        <button className="cta-button">Teste Grátis</button>
      </div>

      <div className="banner-images">
        <img src={BRAND_LOGO} alt="Logo GGE" />

      </div>
    </section>
  );
};

export default BannerSection;
