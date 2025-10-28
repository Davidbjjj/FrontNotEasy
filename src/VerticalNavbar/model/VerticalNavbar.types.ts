export interface NavItem {
  id: string;
  label: string;
  isActive?: boolean;
}

export interface VerticalNavbarProps {
  items?: NavItem[];
  onItemClick?: (item: NavItem) => void;
  className?: string;
}

export interface VerticalNavbarViewModel {
  navItems: NavItem[];
  activeItem: string | null;
  handleItemClick: (item: NavItem) => void;
}