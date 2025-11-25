// viewmodels/VerticalNavbar.viewmodel.ts
import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavItem, VerticalNavbarViewModel } from '../model/VerticalNavbar.types';

export const useVerticalNavbarViewModel = (
  initialItems?: NavItem[],
  onItemClick?: (item: NavItem) => void
): VerticalNavbarViewModel => {
  const location = useLocation();

  const defaultItems: NavItem[] = [
    { id: 'questoes', label: 'Questões', isActive: false, path: '/questoes' },
    { id: 'listas', label: 'Listas', isActive: false, path: '/listas' },
    { id: 'atividades', label: 'Atividades', isActive: false, path: '/atividades' },
    { id: 'disciplinas', label: 'Disciplinas', isActive: false, path: '/disciplinas' },
    { id: 'config', label: 'Configuração', isActive: false, path: '/config' },
  ];

  // If the current user is an institution, add an 'Instituição' area
  try {
    const roleRaw = (localStorage.getItem('role') || '').toString().toUpperCase();
    if (roleRaw === 'INSTITUICAO') {
      // put institution first so it's easy to find
      defaultItems.unshift({ id: 'instituicao', label: 'Instituição', isActive: false, path: '/instituicao' });
    }
  } catch (e) {
    // ignore localStorage errors
  }

  const [navItems, setNavItems] = useState<NavItem[]>(initialItems || defaultItems);
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Sincroniza o item ativo com a rota atual
  // Esta é a ÚNICA fonte da verdade para qual item está ativo
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
      // Chama o callback externo se fornecido
      // O componente will use Link para navegar (não usar navigate aqui)
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