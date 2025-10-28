import React, { useState } from 'react';
import './NotEasyDashboard.css';

const NotEasyDashboard = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = {
    exercicios: "https://www.youtube.com/embed/VIDEO_EXERCICIOS",
    atividades: "https://www.youtube.com/embed/VIDEO_ATIVIDADES", 
    melhorias: "https://www.youtube.com/embed/VIDEO_MELHORIAS",
    performance: "https://www.youtube.com/embed/VIDEO_PERFORMANCE"
  };

  const handleCardClick = (videoKey) => {
    setSelectedVideo(videoKey);
  };

  return (
    <div className="not-easy-dashboard">
      <header className="dashboard-header">
        <div className="logo">
          <span className="logo-text">NotEasy</span>
          <span className="logo-subtext">te ajuda</span>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-layout">
          {/* Cards à esquerda */}
          <div className="cards-left">
            <div 
              className="dashboard-card card-exercicios"
              onClick={() => handleCardClick('exercicios')}
            >
              <h2 className="card-title">Lista de Exercicios</h2>
            </div>
            
            <div 
              className="dashboard-card card-atividades"
              onClick={() => handleCardClick('atividades')}
            >
              <h2 className="card-title">Gerencialmento de Atividades</h2>
            </div>
          </div>

          {/* Área central para o vídeo */}
          <div className="video-center">
            <div className="video-container">
              {selectedVideo ? (
                <div className="video-player">
                  <iframe
                    width="100%"
                    height="100%"
                    src={videos[selectedVideo]}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="video-placeholder">
                  <div className="placeholder-icon">▶</div>
                  <p>Clique em um dos cards para ver o vídeo</p>
                </div>
              )}
            </div>
          </div>

          {/* Cards à direita */}
          <div className="cards-right">
            <div 
              className="dashboard-card card-melhorias"
              onClick={() => handleCardClick('melhorias')}
            >
              <h2 className="card-title">Sugestões de Melhoria</h2>
            </div>
            
            <div 
              className="dashboard-card card-performance"
              onClick={() => handleCardClick('performance')}
            >
              <h2 className="card-title">Relatórios De Performance</h2>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotEasyDashboard;