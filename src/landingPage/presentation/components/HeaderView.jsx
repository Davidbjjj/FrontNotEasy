import React, { useState, useEffect } from 'react';
import './Header.css';

const logo = "/image.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Detecta mudanças de tamanho de tela e fecha menu ao redimensionar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    // Verifica tamanho inicial
    handleResize();

    window.addEventListener('resize', handleResize);
    
    // Previne scroll quando menu está aberto no mobile
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobile]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <img 
            src={logo} 
            alt="Logo notBsy" 
            className="logo-image" 
          />
        </div>

        {/* Menu de Navegação */}
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#como-funciona" className="nav-link" onClick={closeMenu}>
                Como funciona
              </a>
            </li>
            <li className="nav-item">
              <a href="#Conheca" className="nav-link" onClick={closeMenu}>
                Conheça o notEasy
              </a>
            </li>
            <li className="nav-item">
              <a href="#planos" className="nav-link" onClick={closeMenu}>
                Planos
              </a>
            </li>
            <li className="nav-item">
              <a href="#faq" className="nav-link" onClick={closeMenu}>
                FAQ
              </a>
            </li>
          </ul>
        </nav>

        {/* Botões CTA e Menu Mobile */}
        <div className="header-actions">
          <button className="btn btn-outline">Criar Conta</button>
          <button className="btn btn-solid">Login</button>

          {/* Botão do menu mobile */}
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;