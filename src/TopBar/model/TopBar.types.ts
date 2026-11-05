export interface UserInfo {
  name: string;
  avatar?: string;
}

export interface TopBarProps {
  userInfo?: UserInfo;
  onSupportClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
}

export interface TopBarViewModel {
  userInfo: UserInfo;
  handleSupportClick: () => void;
  handleLogoutClick: () => void;
}