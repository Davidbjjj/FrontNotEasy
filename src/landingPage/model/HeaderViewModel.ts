import { useNavigate } from "react-router-dom";

export const useHeaderViewModel = () => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Como funciona", link: "/como-funciona" },
    { label: "Conheça o notEasy", link: "/conheca" },
    { label: "Planos", link: "/planos" },
    { label: "FAQ", link: "/faq" },
  ];

  const onLoginClick = () => navigate("/login");
  const onCreateAccountClick = () => navigate("/cadastro-aluno");

  return { menuItems, onLoginClick, onCreateAccountClick };
};
