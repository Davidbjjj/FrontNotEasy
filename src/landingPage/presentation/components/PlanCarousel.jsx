import React, { useState } from 'react';
import './PlanCarousel.css';

const PlanCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const plans = [
    {
      id: 1,
      title: "Instituição Médio Porte",
      students: "250 e 299 alunos",
      price: "R$ 700",
      features: [
        { name: "Questões", included: false },
        { name: "Listas", included: true },
        { name: "Relatório", included: true },
        { name: "Sugestões de IA", included: true }
      ],
      popular: false
    },
    {
      id: 2,
      title: "Instituição Pequeno Porte",
      students: "100 e 199 alunos",
      price: "R$ 400",
      features: [
        { name: "Questões", included: true },
        { name: "Listas", included: true },
        { name: "Relatório", included: false },
        { name: "Sugestões de IA", included: false }
      ],
      popular: false
    },
    {
      id: 3,
      title: "Instituição Grande Porte",
      students: "500+ alunos",
      price: "R$ 1.200",
      features: [
        { name: "Questões", included: true },
        { name: "Listas", included: true },
        { name: "Relatório", included: true },
        { name: "Sugestões de IA", included: true },
        { name: "Suporte Prioritário", included: true },
        { name: "Customização", included: true }
      ],
      popular: true
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === plans.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? plans.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="plan-carousel">
      <div className="carousel-header">
        <h2>Planos para Instituições de Ensino</h2>
        <p>Escolha o plano ideal para o tamanho da sua instituição</p>
      </div>

      <div className="carousel-container">
        <button className="carousel-btn prev" onClick={prevSlide}>
          ‹
        </button>

        <div className="carousel-wrapper">
          <div 
            className="carousel-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {plans.map((plan) => (
              <div key={plan.id} className="carousel-slide">
                <div className={`plan-card ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && <div className="popular-badge">Mais Popular</div>}
                  
                  <div className="plan-header">
                    <h3 className="plan-title">{plan.title}</h3>
                    <div className="student-range">
                      
                      {plan.students}
                    </div>
                  </div>

                  <div className="plan-features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <span className={`feature-check ${feature.included ? 'included' : 'excluded'}`}>
                          {feature.included ? '✓' : '✗'}
                        </span>
                        <span className={`feature-name ${!feature.included ? 'excluded' : ''}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="plan-price">
                    <div className="price-amount">{plan.price}</div>
                    <div className="price-period">por mês</div>
                  </div>

                  <button className="subscribe-btn">
                    Assinar Agora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="carousel-btn next" onClick={nextSlide}>
          ›
        </button>
      </div>

      <div className="carousel-indicators">
        {plans.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanCarousel;