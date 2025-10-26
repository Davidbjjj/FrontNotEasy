import React from 'react';
import './QuestionCard.css';

const QuestionCard = ({ questao, onAcessar }) => {
  const { id, nome, foto, lista } = questao;

  return (
    <div className="questao-card">
      <p className="lista-de">{lista}</p>
      <div className="perfil">
        {foto ? (
          <img src={foto} alt="Foto de perfil" className="foto" />
        ) : (
          <div className="foto-placeholder"></div>
        )}
        <p className="nome">{nome}</p>
      </div>
      <button 
        className="acessar-button"
        onClick={() => onAcessar(id)}
      >
        Acessar
      </button>
    </div>
  );
};

export default QuestionCard;