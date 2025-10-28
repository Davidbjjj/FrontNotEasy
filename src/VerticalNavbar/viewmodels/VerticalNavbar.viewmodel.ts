import { useState, useCallback } from 'react';
import { NavItem, VerticalNavbarViewModel } from '../model/VerticalNavbar.types';

export const useVerticalNavbarViewModel = (
  initialItems?: NavItem[],
  onItemClick?: (item: NavItem) => void
): VerticalNavbarViewModel => {
  const [navItems, setNavItems] = useState<NavItem[]>(
    initialItems || [
      { id: 'questoes', label: 'Questões', isActive: false },
      { id: 'frame-110', label: 'Listas', isActive: true },
    ]
  );

  const [activeItem, setActiveItem] = useState<string | null>('frame-110');

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

      // Chama o callback externo se fornecido
      if (onItemClick) {
        onItemClick(clickedItem);
      }
    },
    [onItemClick]
  );

  return {
    navItems,
    activeItem,
    handleItemClick,
  };
};