// presentation/components/VerticalNavbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  FileText, 
  List, 
  ClipboardList, 
  Settings,
  Book,
  Calendar, // Ícone para atividades
  Building2 // Ícone para instituição
} from "lucide-react";
import { useVerticalNavbarViewModel } from "../../viewmodels/VerticalNavbar.viewmodel";
import { VerticalNavbarProps } from "../../model/VerticalNavbar.types";
import "./VerticalNavbar.css";
import { JSX } from "react/jsx-runtime";

const VerticalNavbarComponent: React.FC<VerticalNavbarProps> = ({
  items,
  onItemClick,
  className = "",
}) => {
  const { navItems, handleItemClick } = useVerticalNavbarViewModel(items, onItemClick);

  const icons: Record<string, JSX.Element> = {
    "questoes": <FileText className="vertical-navbar__icon" />,
    "listas": <List className="vertical-navbar__icon" />,
    "atividades": <Calendar className="vertical-navbar__icon" />,
    "simulados": <ClipboardList className="vertical-navbar__icon" />,
    "disciplinas": <Book className="vertical-navbar__icon" />,
    "instituicao": <Building2 className="vertical-navbar__icon" />,
    "config": <Settings className="vertical-navbar__icon" />,
  };

  return (
    <nav className={`vertical-navbar ${className}`}>
      <ul className="vertical-navbar__list">
        {navItems.map((item) => (
          <li key={item.id} className="vertical-navbar__item">
            <Link
              to={item.path || "#"}
              className={`vertical-navbar__button ${
                item.isActive ? "vertical-navbar__button--active" : ""
              }`}
              onClick={() => handleItemClick(item)}
              aria-current={item.isActive ? "page" : undefined}
            >
              {icons[item.id] || <BookOpen className="vertical-navbar__icon" />}
              <span className="vertical-navbar__label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

// Memoizar o componente para evitar re-renderizações desnecessárias
export const VerticalNavbar = React.memo(VerticalNavbarComponent);

export default VerticalNavbar;