import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  BookOutlined,
  SettingOutlined,
  BookFilled,
  LoginOutlined,
} from "@ant-design/icons";
import { Button, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import RouterConfig from "./RouterConfig";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "questoes",
      icon: <BookOutlined />,
      label: <Link to="/questoes">Questões</Link>,
    },
    {
      key: "minhasQuestoes",
      icon: <BookFilled />,
      label: <Link to="/minhas-questoes">Minhas questões</Link>,
    },
    {
      key: "simulados",
      icon: <FilterOutlined />,
      label: <Link to="/simulados">Simulados</Link>,
    },
    {
      key: "sobre",
      icon: <InfoCircleOutlined />,
      label: <Link to="/sobre">Sobre</Link>,
    },
    {
      key: "cadastros",
      icon: <LoginOutlined />,
      label: <Link to="/cadastros">Cadastros</Link>,
    },
    {
      key: "config",
      icon: <SettingOutlined />,
      label: <Link to="/config">Configurações</Link>,
    },
  ];

  const esconderSidebar = location.pathname === "/login";

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {!esconderSidebar && (
        <div
          style={{
            width: collapsed ? 80 : 256,
            backgroundColor: "#001529",
            transition: "width 0.2s",
          }}
        >
          <Button
            type="primary"
            onClick={toggleCollapsed}
            style={{ margin: 16 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <Menu
            defaultSelectedKeys={["home"]}
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
            items={items}
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          backgroundColor: esconderSidebar ? "#fff" : "#011C40",
        }}
      >
        <RouterConfig />
      </div>
    </div>
  );
}

export default AppLayout;
