import React from 'react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const menuItems = [
    { id: 'professores', label: 'Professores' },
    { id: 'disciplinas', label: 'Disciplinas' },
    { id: 'estudantes', label: 'Estudantes' },
    { id: 'associacoes', label: 'Associações' },
    { id: 'configuracoes', label: 'Configurações' },
  ];

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#f3f4f6',
      padding: '20px',
      borderRight: '1px solid #e5e7eb',
      height: '100%',
      minHeight: 'calc(100vh - 64px)' // Adjust based on top bar height
    }}>
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>Menu</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map((item) => (
          <li key={item.id} style={{ marginBottom: '10px' }}>
            <button
              onClick={() => onNavigate(item.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 15px',
                backgroundColor: activeView === item.id ? '#3b82f6' : 'transparent',
                color: activeView === item.id ? '#ffffff' : '#374151',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: activeView === item.id ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
