import React from "react";
import { BookOpen, FileText } from "lucide-react";
import { useVerticalNavbarViewModel } from "../../viewmodels/VerticalNavbar.viewmodel";
import { VerticalNavbarProps } from "../../model/VerticalNavbar.types";
import "./VerticalNavbar.css";

export const VerticalNavbar: React.FC<VerticalNavbarProps> = ({
  items,
  onItemClick,
  className = "",
}) => {
  const { navItems, handleItemClick } = useVerticalNavbarViewModel(items, onItemClick);

  const icons: Record<string, JSX.Element> = {
    "questoes": <FileText className="vertical-navbar__icon" />,
  };

  return (
    <nav className={`vertical-navbar ${className}`}>
      <ul className="vertical-navbar__list">
        {navItems.map((item) => (
          <li key={item.id} className="vertical-navbar__item">
            <button
              className={`vertical-navbar__button ${
                item.isActive ? "vertical-navbar__button--active" : ""
              }`}
              onClick={() => handleItemClick(item)}
              type="button"
            >
              {icons[item.id] || <BookOpen className="vertical-navbar__icon" />}
              <span className="vertical-navbar__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default VerticalNavbar;