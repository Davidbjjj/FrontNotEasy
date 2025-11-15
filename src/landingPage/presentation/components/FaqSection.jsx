import React, { useState } from 'react';
import './FaqSection.css';

const qa = [
  { q: 'O notEasy é para qual tipo de instituição?', a: 'Atendemos escolas de ensino básico, médio, superior e cursos técnicos, com planos por faixa de alunos.' },
  { q: 'Preciso instalar algo?', a: 'Não. É 100% web. Basta criar sua conta e começar a usar.' },
  { q: 'Há período de teste?', a: 'Sim. Você pode explorar os recursos principais gratuitamente por um período limitado.' },
  { q: 'Posso integrar com outros sistemas?', a: 'Sim. Oferecemos API e integrações sob demanda conforme o plano.' }
];

const FaqItem = ({ q, a, idx }) => {
  const [open, setOpen] = useState(false);
  const id = `faq-${idx}`;
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button
        className="faq-question"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <span className="faq-icon" aria-hidden>{open ? '−' : '+'}</span>
      </button>
      <div id={id} className="faq-answer" role="region" hidden={!open}>
        <p>{a}</p>
      </div>
    </div>
  );
};

const FaqSection = () => {
  return (
    <section id="faq" className="faq">
      <div className="container">
        <header className="faq-header">
          <h2>Perguntas frequentes</h2>
          <p>Tire dúvidas rápidas sobre a plataforma</p>
        </header>
        <div className="faq-list">
          {qa.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
