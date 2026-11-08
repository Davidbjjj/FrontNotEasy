import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// axios é ESM e o Jest do CRA não o transforma; a rede não importa neste teste
jest.mock('./services/apiClient', () => ({
  __esModule: true,
  default: {},
  plainApi: {},
  API_BASE: 'http://localhost:8080',
  NETWORK_ERROR_EVENT: 'api-network-error',
}));
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
}));
jest.mock('./listMain/presentation/components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

// rotas públicas carregam telas pesadas; o smoke test usa uma rota inexistente (404)
test('rota desconhecida mostra a página 404 com link de volta', () => {
  render(
    <MemoryRouter initialEntries={['/rota-que-nao-existe']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Página não encontrada/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Voltar ao início/i })).toHaveAttribute('href', '/');
});
