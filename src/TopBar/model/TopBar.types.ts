export interface UserInfo {
  name: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export interface TopBarProps {
  userInfo?: UserInfo;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onSupportClick?: () => void;
  onLogoutClick?: () => void;
  className?: string;
}

export interface TopBarViewModel {
  userInfo: UserInfo;
  notifications: Notification[];
  unreadCount: number;
  isNotificationsOpen: boolean;
  handleNotificationClick: (notification: Notification) => void;
  handleSupportClick: () => void;
  handleLogoutClick: () => void;
  toggleNotifications: () => void;
  markAllAsRead: () => void;
}