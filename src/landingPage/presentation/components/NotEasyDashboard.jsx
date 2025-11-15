import React, { useState } from 'react';
import './NotEasyDashboard.css';

const NotEasyDashboard = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = {
    exercicios: "https://www.youtube.com/embed/VIDEO_EXERCICIOS",
    atividades: "https://www.youtube.com/embed/VIDEO_ATIVIDADES",
    melhorias: "https://www.youtube.com/embed/VIDEO_MELHORIAS",
    performance: "https://www.youtube.com/embed/VIDEO_PERFORMANCE",
  };

  const cards = [
    {
      key: 'exercicios',
      title: 'Listas de Exercícios',
      desc: 'Monte, publique e acompanhe entregas',
      className: 'card-exercicios',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      key: 'atividades',
      title: 'Gerenciamento de Atividades',
      desc: 'Prazos, rubricas e correções',
      className: 'card-atividades',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 11l3 3L22 4M4 7h8M4 13h6M4 19h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      key: 'melhorias',
      title: 'Sugestões com IA',
      desc: 'Recomendações de reforço e conteúdos',
      className: 'card-melhorias',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 9a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
      ),
    },
    {
      key: 'performance',
      title: 'Relatórios de Performance',
      desc: 'Insights por turma e aluno',
      className: 'card-performance',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 19V5m5 14V9m5 10V7m5 12V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const handleCardClick = (videoKey) => setSelectedVideo(videoKey);

  return (
    <section className="not-easy-dashboard" aria-label="Demonstração do notEasy">
      <header className="dashboard-header">
        <div className="logo">
          <span className="logo-text">notEasy</span>
          <span className="logo-subtext">da criação ao resultado, em um só lugar</span>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-layout">
          <div className="cards-left">
            {cards.slice(0, 2).map((c) => (
              <button
                key={c.key}
                type="button"
                className={`dashboard-card ${c.className} ${selectedVideo === c.key ? 'card-active' : ''}`}
                onClick={() => handleCardClick(c.key)}
                aria-pressed={selectedVideo === c.key}
              >
                <span className="card-icon" aria-hidden>{c.icon}</span>
                <div className="card-texts">
                  <h2 className="card-title">{c.title}</h2>
                  <p className="card-sub">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="video-center">
            <div className="video-container">
              {selectedVideo ? (
                <div className="video-player">
                  <iframe
                    width="100%"
                    height="100%"
                    src={videos[selectedVideo]}
                    title={`Demonstração: ${selectedVideo}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="video-placeholder" role="img" aria-label="Prévia do vídeo da plataforma">
                  <div className="placeholder-icon">▶</div>
                  <p>Escolha um recurso para visualizar a prévia</p>
                </div>
              )}
            </div>
          </div>

          <div className="cards-right">
            {cards.slice(2).map((c) => (
              <button
                key={c.key}
                type="button"
                className={`dashboard-card ${c.className} ${selectedVideo === c.key ? 'card-active' : ''}`}
                onClick={() => handleCardClick(c.key)}
                aria-pressed={selectedVideo === c.key}
              >
                <span className="card-icon" aria-hidden>{c.icon}</span>
                <div className="card-texts">
                  <h2 className="card-title">{c.title}</h2>
                  <p className="card-sub">{c.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </section>
  );
};

export default NotEasyDashboard;