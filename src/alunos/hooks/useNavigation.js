import { useNavigate } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate('/home');
  const goToLogin = () => navigate('/login');
  const goToRegistration = () => navigate('/cadastro');

  return {
    goToHome,
    goToLogin,
    goToRegistration
  };
};