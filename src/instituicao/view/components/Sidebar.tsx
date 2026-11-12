import React from 'react';
import { Menu } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  LinkOutlined,
  SettingOutlined,
  DashboardOutlined,
  UploadOutlined,
  MailOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  SafetyOutlined,
  AuditOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';

export interface SidebarItem {
  chave: string;
  rotulo: string;
}

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  /** Só os itens que o usuário pode usar (FE-306): o que não tem permissão nem aparece. */
  items: SidebarItem[];
}

const ICONES: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  importacao: <UploadOutlined />,
  convites: <MailOutlined />,
  periodos: <CalendarOutlined />,
  comparativos: <BarChartOutlined />,
  boletins: <FilePdfOutlined />,
  papeis: <SafetyOutlined />,
  auditoria: <AuditOutlined />,
  personalizacao: <BgColorsOutlined />,
  professores: <UserOutlined />,
  disciplinas: <BookOutlined />,
  estudantes: <TeamOutlined />,
  associacoes: <LinkOutlined />,
  configuracoes: <SettingOutlined />,
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, items }) => {
  const menu = items.map((i) => ({ key: i.chave, icon: ICONES[i.chave], label: i.rotulo }));

  return (
    <div style={{ padding: '8px 0' }}>
      <Menu
        mode="inline"
        selectedKeys={[activeView]}
        style={{ borderRight: 0, backgroundColor: 'transparent' }}
        items={menu}
        onClick={(e) => onNavigate(e.key)}
      />
    </div>
  );
};

export default Sidebar;
