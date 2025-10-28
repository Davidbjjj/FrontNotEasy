import React from 'react';
import './StudyPerformance.css';

const StudyPerformance = () => {
  return (
    <div className="study-performance-container">
      <div className="background-overlay"></div>
      
      <div className="content-wrapper">
        <div className="image-content">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80" 
            alt="Estudante utilizando plataforma de estudos" 
            className="side-image"
          />
        </div>
        <div className="text-content">
          <h1 className="title">NotEasy ajuda gerenciar sua performance nos estudos</h1>
          <p className="description">
            Acesse uma plataforma que você pode personalizar sua estrutura educacional, 
            lista e monta suas atividades de cada disciplina, resolva suas provas do 
            maneira que você achar melhor e monitore seus desempenhos
          </p>
        </div>
        

      </div>
    </div>
  );
};

export default StudyPerformance;