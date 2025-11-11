// viewmodels/VerticalNavbar.viewmodel.ts
import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavItem, VerticalNavbarViewModel } from '../model/VerticalNavbar.types';

export const useVerticalNavbarViewModel = (
  initialItems?: NavItem[],
  onItemClick?: (item: NavItem) => void
): VerticalNavbarViewModel => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultItems: NavItem[] = [
    { id: 'questoes', label: 'Questões', isActive: false, path: '/questoes' },
    { id: 'listas', label: 'Listas', isActive: false, path: '/listas' },
    { id: 'atividades', label: 'Atividades', isActive: false, path: '/atividades' },
    { id: 'disciplinas', label: 'Disciplinas', isActive: false, path: '/disciplinas' },
    { id: 'config', label: 'Configuração', isActive: false, path: '/config' },
  ];

  const [navItems, setNavItems] = useState<NavItem[]>(initialItems || defaultItems);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Sincroniza o item ativo com a rota atual
  useEffect(() => {
    const currentPath = location.pathname;
    let matchedId: string | null = null;

    setNavItems(prevItems =>
      prevItems.map(item => {
        // Marca item como ativo quando a rota bater exatamente ou quando for prefixo (ex: /listas/:id)
        const isActive = !!item.path && (currentPath === item.path || currentPath.startsWith(item.path + '/'));
        if (isActive) matchedId = item.id;
        return { ...item, isActive };
      })
    );

    setActiveItem(matchedId);
  }, [location.pathname]);

  const handleItemClick = useCallback(
    (clickedItem: NavItem) => {
      // Atualiza o estado ativo
      setActiveItem(clickedItem.id);

      // Atualiza os items marcando o ativo (navegação controlada)
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