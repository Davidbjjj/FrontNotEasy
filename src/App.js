import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  BookOutlined,
  SettingOutlined,
  BookFilled,
  LoginOutlined
} from '@ant-design/icons';
import { Button, Menu } from 'antd';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import RouterConfig from './RouterConfig';

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/home">Home</Link>,
    },
    {
      key: 'questoes',
      icon: <BookOutlined />,
      label: <Link to="/questoes">Questões</Link>,
    },
    {
      key: 'minhasQuestoes',
      icon: <BookFilled />,
      label: <Link to="/minhasQuestoes">Minhas questões</Link>,
    },
    {
      key: 'simulados',
      icon: <FilterOutlined />,
      label: <Link to="/simulados">Simulados</Link>,
    },
    {
      key: 'sobre',
      icon: <InfoCircleOutlined />,
      label: <Link to="/sobre">Sobre</Link>,
    },
    {
      key: 'cadastros',
      icon: <LoginOutlined />,
      label: <Link to="/cadastros">Cadastros</Link>,
    },
    {
      key: 'config',
      icon: <SettingOutlined />,
      label: <Link to="/config">Configurações</Link>,
    },
    {
      key: 'login',
      label: <Link to="/login">Login</Link>
    }
  ];

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div
          style={{
            width: collapsed ? 80 : 256,
            backgroundColor: '#001529',
            transition: 'width 0.2s',
          }}
        >
          <Button
            type="primary"
            onClick={toggleCollapsed}
            style={{
              margin: 16,
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <Menu
            defaultSelectedKeys={['home']}
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
            items={items}
          />
        </div>

        <div style={{ flex: 1, padding: '20px', backgroundColor: '#011C40' }}>
          {/* Aqui você usa o componente de rotas que criamos */}
          <RouterConfig />
        </div>
      </div>
    </Router>
  );
};

export default App;
