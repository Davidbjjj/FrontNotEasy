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
    <div style={{ padding: '8px 0' }}>
      <Menu
        mode="inline"
        selectedKeys={[activeView]}
        style={{ borderRight: 0, backgroundColor: 'transparent' }}
        items={items}
        onClick={(e) => onNavigate(e.key)}
      />
    </div>
  );
};

export default Sidebar;
