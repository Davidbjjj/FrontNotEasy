// presentation/components/BottomNavbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  List,
  ClipboardList,
  Book,
  Settings,
  Calendar,
  Building2,
  Home,
  CalendarDays,
  TrendingUp
} from "lucide-react";
import { useVerticalNavbarViewModel } from "../../viewmodels/VerticalNavbar.viewmodel";
import { VerticalNavbarProps } from "../../model/VerticalNavbar.types";
import "./BottomNavbar.css";

const BottomNavbarComponent: React.FC<Partial<VerticalNavbarProps>> = ({ items, onItemClick }) => {
  const { navItems, handleItemClick } = useVerticalNavbarViewModel(items, onItemClick);

  const icons: Record<string, JSX.Element> = {
    "inicio": <Home className="bottom-navbar__icon" />,
    "calendario": <CalendarDays className="bottom-navbar__icon" />,
    "evolucao": <TrendingUp className="bottom-navbar__icon" />,
    "questoes": <FileText className="bottom-navbar__icon" />,
    "listas": <List className="bottom-navbar__icon" />,
    "atividades": <Calendar className="bottom-navbar__icon" />,
    "simulados": <ClipboardList className="bottom-navbar__icon" />,
    "disciplinas": <Book className="bottom-navbar__icon" />,
    "instituicao": <Building2 className="bottom-navbar__icon" />,
    "config": <Settings className="bottom-navbar__icon" />,
  };

  return (
    <nav className="bottom-navbar" aria-label="Navegação principal">
      <ul className="bottom-navbar__list">
        {navItems.map((item) => (
          <li key={item.id} className="bottom-navbar__item">
            <Link
              to={item.path || '#'}
              className={`bottom-navbar__link ${item.isActive ? 'bottom-navbar__link--active' : ''}`}
              data-tour={`nav-${item.id}`}
              onClick={() => handleItemClick(item)}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {icons[item.id] || <FileText className="bottom-navbar__icon" />}
              <span className="bottom-navbar__label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const BottomNavbar = React.memo(BottomNavbarComponent);

export default BottomNavbar;
