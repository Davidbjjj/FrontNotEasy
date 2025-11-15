import React, { useMemo, useState } from 'react';
import './PlanCarousel.css';

const PlanCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  const YEARLY_DISCOUNT = 0.2;

  const plans = useMemo(() => ([
    {
      id: 1,
      tier: 'Starter',
      title: 'Starter',
      subtitle: 'Para começar com o essencial',
      priceMonthly: 29,
      features: [
        { name: 'Banco de Questões', included: true },
        { name: 'Listas e Atividades', included: true },
        { name: 'Relatórios básicos', included: true },
        { name: 'Sugestões com IA', included: false },
        { name: 'Suporte padrão', included: true }
      ],
      accent: 'accent-blue',
      popular: false
    },
    {
      id: 2,
      tier: 'Pro',
      title: 'Pro',
      subtitle: 'Para escolas em crescimento',
      priceMonthly: 59,
      features: [
        { name: 'Tudo do Starter', included: true },
        { name: 'Relatórios avançados', included: true },
        { name: 'Sugestões com IA', included: true },
        { name: 'Integrações básicas (API)', included: true },
        { name: 'Suporte prioritário', included: true }
      ],
      accent: 'accent-indigo',
      popular: true
    },
    {
      id: 3,
      tier: 'Business',
      title: 'Business',
      subtitle: 'Para múltiplas unidades e times',
      priceMonthly: 99,
      features: [
        { name: 'Tudo do Pro', included: true },
        { name: 'Relatórios personalizáveis', included: true },
        { name: 'SLA dedicado', included: true },
        { name: 'Treinamento inicial', included: true },
        { name: 'Customizações pontuais', included: true }
      ],
      accent: 'accent-teal',
      popular: false
    },
    {
      id: 4,
      tier: 'Enterprise',
      title: 'Enterprise',
      subtitle: 'Soluções sob medida',
      priceMonthly: null,
      features: [
        { name: 'Implementação dedicada', included: true },
        { name: 'Integrações avançadas', included: true },
        { name: 'SLA e compliance', included: true },
        { name: 'Customizações completas', included: true },
        { name: 'Suporte 24/7', included: true }
      ],
      accent: 'accent-slate',
      popular: false
    }
  ]), []);

  const formatBRL = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const getPrice = (plan) => {
    if (!plan.priceMonthly) return null;
    if (billing === 'monthly') {
      return {
        amount: formatBRL(plan.priceMonthly),
        period: 'por mês'
      };
    }
    const yearly = Math.round(plan.priceMonthly * 12 * (1 - YEARLY_DISCOUNT));
    return {
      amount: formatBRL(yearly),
      period: 'por ano',
      note: 'Economize 20%'
    };
  };

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
        <h2>Escolha seu plano</h2>
        <p>Assinatuas do notEasy</p>
        <div className="billing-toggle" role="tablist" aria-label="Periodicidade de cobrança">
          <button
            role="tab"
            aria-selected={billing === 'monthly'}
            className={`billing-option ${billing === 'monthly' ? 'active' : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Mensal
          </button>
          <button
            role="tab"
            aria-selected={billing === 'yearly'}
            className={`billing-option ${billing === 'yearly' ? 'active' : ''}`}
            onClick={() => setBilling('yearly')}
          >
            Anual <span className="save-badge">-20%</span>
          </button>
        </div>
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
                <div className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.accent || ''}`}>
                  {plan.popular && <div className="popular-badge">Mais Popular</div>}
                  
                  <div className="plan-header">
                    <div className="tier">{plan.tier}</div>
                    <h3 className="plan-title">{plan.title}</h3>
                    <div className="plan-subtitle">{plan.subtitle}</div>
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
                    {getPrice(plan) ? (
                      <>
                        <div className="price-amount">{getPrice(plan).amount}</div>
                        <div className="price-period">{getPrice(plan).period}</div>
                        {getPrice(plan).note && (
                          <div className="price-note">{getPrice(plan).note}</div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="price-amount">Sob consulta</div>
                        <div className="price-period">Projetos personalizados</div>
                      </>
                    )}
                  </div>

                  {plan.tier === 'Enterprise' ? (
                    <button className="subscribe-btn outline">
                      Fale com Vendas
                    </button>
                  ) : (
                    <button className="subscribe-btn">
                      Assinar Agora
                    </button>
                  )}
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