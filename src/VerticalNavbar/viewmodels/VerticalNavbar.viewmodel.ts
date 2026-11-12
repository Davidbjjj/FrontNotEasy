// viewmodels/VerticalNavbar.viewmodel.ts
import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavItem, VerticalNavbarViewModel } from '../model/VerticalNavbar.types';
import { usePermissoes } from '../../instituicao/gestao/permissoesStore';
import { PERMISSAO_NAV } from '../../instituicao/gestao/gestaoLogic';

export const useVerticalNavbarViewModel = (
  initialItems?: NavItem[],
  onItemClick?: (item: NavItem) => void
): VerticalNavbarViewModel => {
  const location = useLocation();
  const { dados: permissoes, tem } = usePermissoes();

  let defaultItems: NavItem[] = [
    { id: 'questoes', label: 'Questões', isActive: false, path: '/questoes' },
    { id: 'listas', label: 'Listas', isActive: false, path: '/listas' },
    { id: 'atividades', label: 'Atividades', isActive: false, path: '/atividades' },
    { id: 'disciplinas', label: 'Disciplinas', isActive: false, path: '/disciplinas' },
    { id: 'config', label: 'Configuração', isActive: false, path: '/config' },
  ];

  // If the current user is an institution, customize navigation items
  try {
    const roleRaw = (localStorage.getItem('role') || '').toString().toUpperCase();
    if (roleRaw === 'ALUNO') {
      defaultItems.unshift({ id: 'inicio', label: 'Início', isActive: false, path: '/inicio' });
      defaultItems.splice(1, 0, { id: 'evolucao', label: 'Evolução', isActive: false, path: '/evolucao' });
      defaultItems.splice(2, 0, { id: 'calendario', label: 'Calendário', isActive: false, path: '/calendario' });
    }
    if (roleRaw === 'PROFESSOR') {
      // Professor não usa a página "Questões": o acervo dele é o Banco
      defaultItems = defaultItems.filter(item => item.id !== 'questoes');
      // FE-201, FE-202, FE-204: ferramentas do professor logo depois de Questões/Listas
      defaultItems.splice(1, 0,
        { id: 'correcao', label: 'Correção', isActive: false, path: '/correcao' },
        { id: 'banco', label: 'Banco', isActive: false, path: '/banco-questoes' },
        { id: 'risco', label: 'Em risco', isActive: false, path: '/alunos-em-risco' },
      );
    }
    if (roleRaw === 'INSTITUICAO') {
      // Remove 'questões' for institution users
      defaultItems = defaultItems.filter(item => item.id !== 'questoes');
      // Add institution area first
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

  // FE-306: itens sem permissão ficam ocultos (não só bloqueados). Antes de a matriz carregar, mostra o padrão.
  const GESTAO = ['VER_DASHBOARD', 'VER_RELATORIOS', 'IMPORTAR_USUARIOS', 'GERIR_CONVITES', 'GERIR_PERIODOS',
    'EMITIR_BOLETINS', 'EDITAR_CONFIGURACOES', 'GERIR_PAPEIS', 'VER_AUDITORIA'];
  const visiveis = navItems.filter((i) => !PERMISSAO_NAV[i.id] || tem(PERMISSAO_NAV[i.id]));
  const coordenador = !initialItems && permissoes?.papel === 'COORDENADOR'
    && GESTAO.some((p) => permissoes.permissoes.includes(p)) && !visiveis.some((i) => i.id === 'instituicao');
  const comGestao: NavItem[] = coordenador
    ? [{ id: 'instituicao', label: 'Instituição', isActive: location.pathname.startsWith('/instituicao'), path: '/instituicao' }, ...visiveis]
    : visiveis;

  return {
    navItems: comGestao,
    activeItem,
    handleItemClick,
  };
};