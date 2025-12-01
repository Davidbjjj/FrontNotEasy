  import React, { useState, useEffect } from 'react';
  import './Header.css';
  import { useNavigate } from "react-router-dom";
  import {message} from "antd";


  const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();

  const buttonRegister = async () => {
    try{
      navigate ("/cadastro-instituicao");
    }
    catch (error){
      message.error(error.message || "Erro ao redirecionar para cadastro.");
    }
  };    const buttonLogin = async () => {
    try {
      navigate("/login");
      console.log ("hello");

    } catch (error) {
      message.error(error.message || "Erro ao redirecionar para login.");
    }
  };

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
      setIsMenuOpen(false);
    };

    // Fecha menu ao clicar em links externos
    const handleLinkClick = () => {
      closeMenu();
    };

    // Detecta tamanho da tela e gerencia scroll
    useEffect(() => {
      const checkScreenSize = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        
        // Fecha menu ao mudar para desktop
        if (!mobile) {
          closeMenu();
        }
      };

      // Verifica tamanho inicial
      checkScreenSize();

      // Gerencia scroll do body
      if (isMenuOpen && isMobile) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }

      // Event listeners
      window.addEventListener('resize', checkScreenSize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', checkScreenSize);
        document.body.classList.remove('no-scroll');
      };
    }, [isMenuOpen, isMobile]);

    return (
      <header className="header">
        <div className="header-container">
          
          {/* Logo */}
          <div className="logo">
            <img 
              src="/image.png" 
              alt="notEasy - Transforma conteúdo em dados e dados em aprendizado" 
              className="logo-image" 
            />
          </div>

          {/* Navegação Desktop/Mobile */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            
            {/* Botões de Ação Mobile - No TOPO como prioridade UX */}
            <div className="mobile-buttons">
              <button className="btn btn-solid" onClick={handleLinkClick}>
                Criar Conta
              </button>
              <button className="btn btn-outline" onClick={buttonLogin}  >
                Login
              </button>
            </div>

            {/* Menu de Navegação */}
            <ul className="nav-list">
              <li className="nav-item">
                <a 
                  href="#como-funciona" 
                  className="nav-link" 
                  onClick={handleLinkClick}
                >
                  Como funciona
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="#conheca" 
                  className="nav-link" 
                  onClick={handleLinkClick}
                >
                  Conheça o notEasy
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="#planos" 
                  className="nav-link" 
                  onClick={handleLinkClick}
                >
                  Planos
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="#faq" 
                  className="nav-link" 
                  onClick={handleLinkClick}
                >
                  FAQs
                </a>
              </li>
            </ul>

          </nav>

          {/* Ações do Header (Desktop) */}
          <div className="header-actions">
            <button className="btn btn-outline" onClick={buttonLogin}>
              Login
            </button>
            <button className="btn btn-solid" onClick={buttonRegister}>
              Criar Conta
            </button>

            {/* Botão Hamburguer Mobile */}
            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
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