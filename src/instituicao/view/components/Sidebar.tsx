import React from 'react';
import { Menu } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  LinkOutlined,
  SettingOutlined,
} from '@ant-design/icons';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const items = [
    { key: 'professores', icon: <UserOutlined />, label: 'Professores' },
    { key: 'disciplinas', icon: <BookOutlined />, label: 'Disciplinas' },
    { key: 'estudantes', icon: <TeamOutlined />, label: 'Estudantes' },
    { key: 'associacoes', icon: <LinkOutlined />, label: 'Associações' },
    { key: 'configuracoes', icon: <SettingOutlined />, label: 'Configurações' },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[activeView]}
      style={{ height: '100%', borderRight: 0 }}
      items={items}
      onClick={(e) => onNavigate(e.key)}
    />
  );
};

export default Sidebar;
