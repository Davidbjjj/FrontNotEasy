import React, { useState } from 'react';
import './NavBar.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-text">NotEasy</span>
        </div>

        {/* Menu para desktop */}
        <ul className="navbar-menu">
          <li className="nav-item">
            <a href="#como-funciona" className="nav-link">Como funciona</a>
          </li>
          <li className="nav-item">
            <a href="#conheca-o-notasy" className="nav-link">Conheca o notasy</a>
          </li>
          <li className="nav-item">
            <a href="#planos" className="nav-link">Planos</a>
          </li>
          <li className="nav-item">
            <a href="#faq" className="nav-link">FAQ</a>
          </li>
        </ul>

           {/* Botões de ação */}
        <div className="navbar-actions">
          <button className="login-btn">Login</button>
          <button className="signup-btn">Criar conta</button>
        </div>

        {/* Botão de menu mobile */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menu mobile */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="mobile-menu-list">
            <li className="mobile-nav-item">
              <a href="#como-funciona" className="mobile-nav-link" onClick={toggleMenu}>
                Como funciona
              </a>
            </li>
            <li className="mobile-nav-item">
              <a href="#conheca-o-notasy" className="mobile-nav-link" onClick={toggleMenu}>
                Conheca o notEasy
              </a>
            </li>
            <li className="mobile-nav-item">
              <a href="#planos" className="mobile-nav-link" onClick={toggleMenu}>
                Planos
              </a>
            </li>
            <li className="mobile-nav-item">
              <a href="#faq" className="mobile-nav-link" onClick={toggleMenu}>
                FAQ
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;