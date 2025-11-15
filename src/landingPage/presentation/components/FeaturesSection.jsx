import React from 'react';
import './FeaturesSection.css';

const features = [
  {
    title: 'Banco de Questões',
    desc: 'Crie, organize e reutilize questões por disciplina e assunto.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 0v4h4"/>
      </svg>
    )
  },
  {
    title: 'Listas e Atividades',
    desc: 'Monte listas, defina prazos e receba as entregas em um só lugar.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9 11l3 3L22 4M2 12l7 7 3-3"/>
      </svg>
    )
  },
  {
    title: 'Relatórios Inteligentes',
    desc: 'Acompanhe a performance por turma, aluno e conteúdo em tempo real.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3 3h18v2H3V3zm2 6h3v12H5V9zm5 4h3v8h-3v-8zm5-6h3v14h-3V7z"/>
      </svg>
    )
  },
  {
    title: 'Sugestões com IA',
    desc: 'Receba recomendações para reforço e criação de atividades.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 9a2 2 0 100-4 2 2 0 000 4z"/>
      </svg>
    )
  }
];

const FeaturesSection = () => {
  return (
    <section id="como-funciona" className="features">
      <div className="container">
        <header className="features-header">
          <h2>Como o notEasy ajuda sua instituição</h2>
          <p>Recursos pensados para coordenações, professores e alunos</p>
        </header>
        <div className="features-grid">
          {features.map((f, i) => (
            <article className="feature-card" key={i}>
              <div className="feature-icon" aria-hidden>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
