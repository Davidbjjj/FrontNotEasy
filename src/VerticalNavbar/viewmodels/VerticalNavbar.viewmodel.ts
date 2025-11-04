// viewmodels/VerticalNavbar.viewmodel.ts
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavItem, VerticalNavbarViewModel } from '../model/VerticalNavbar.types';

export const useVerticalNavbarViewModel = (
  initialItems?: NavItem[],
  onItemClick?: (item: NavItem) => void
): VerticalNavbarViewModel => {
  const navigate = useNavigate();
  const [navItems, setNavItems] = useState<NavItem[]>(
    initialItems || [
      { id: 'questoes', label: 'Questões', isActive: false, path: '/questoes' },
      { id: 'listas', label: 'Listas', isActive: true, path: '/listas' },
      { id: 'atividades', label: 'Atividades', isActive: false, path: '/atividades' },

      { id: 'disciplinas', label: 'Disciplinas', isActive: false, path: '/disciplinas' },
      { id: 'config', label: 'Configuração', isActive: false, path: '/config' },
    ]
  );

  const [activeItem, setActiveItem] = useState<string | null>('listas');

  const handleItemClick = useCallback(
    (clickedItem: NavItem) => {
      // Atualiza o estado ativo
      setActiveItem(clickedItem.id);
      
      // Atualiza os items marcando o ativo
      setNavItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          isActive: item.id === clickedItem.id,
        }))
      );

      // Navega para a rota correspondente
      if (clickedItem.path) {
        navigate(clickedItem.path);
      }

      // Chama o callback externo se fornecido
      if (onItemClick) {
        onItemClick(clickedItem);
      }
    },
    [onItemClick, navigate]
  );

  return {
    navItems,
    activeItem,
    handleItemClick,
  };
};