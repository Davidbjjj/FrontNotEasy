import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { NotificationsProvider } from './NotificationsProvider';

jest.mock('../services/apiClient', () => ({ __esModule: true, default: {} }));

// O módulo real escolhe mock/HTTP por env; aqui o mock embutido é suficiente.
const renderBell = () =>
  render(
    <MemoryRouter initialEntries={['/inicio']}>
      <NotificationsProvider>
        <NotificationBell />
        <Routes>
          <Route path="/inicio" element={<p>Início</p>} />
          <Route path="/listas" element={<p>Página de listas</p>} />
          <Route path="/atividades" element={<p>Página de atividades</p>} />
        </Routes>
      </NotificationsProvider>
    </MemoryRouter>
  );

beforeEach(() => localStorage.setItem('token', 'x'));
afterEach(() => localStorage.clear());

test('mostra o contador de não lidas no sino', async () => {
  renderBell();
  expect(await screen.findByRole('button', { name: /6 não lidas/ })).toBeInTheDocument();
});

test('painel lista da mais recente para a mais antiga, com paginação', async () => {
  renderBell();
  userEvent.click(await screen.findByRole('button', { name: /Notificações/ }));
  const panel = await screen.findByRole('region', { name: /Painel de notificações/ });
  await waitFor(() => expect(within(panel).getAllByRole('listitem')).toHaveLength(10));

  const times = within(panel)
    .getAllByRole('listitem')
    .map((li) => new Date(li.querySelector('time')!.getAttribute('datetime')!).getTime());
  expect([...times].sort((a, b) => b - a)).toEqual(times);

  userEvent.click(within(panel).getByRole('button', { name: 'Carregar mais' }));
  await waitFor(() => expect(within(panel).getAllByRole('listitem')).toHaveLength(20));
});

test('clicar numa notificação marca como lida e navega ao item relacionado', async () => {
  renderBell();
  userEvent.click(await screen.findByRole('button', { name: /6 não lidas/ }));
  const panel = await screen.findByRole('region', { name: /Painel de notificações/ });
  const first = (await within(panel).findAllByRole('listitem'))[0];
  userEvent.click(within(first).getByRole('button'));

  expect(await screen.findByText('Página de listas')).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: /5 não lidas/ })).toBeInTheDocument();
});

test('marcar todas como lidas zera o contador', async () => {
  renderBell();
  userEvent.click(await screen.findByRole('button', { name: /não lidas/ })); // o estado do mock persiste entre testes
  userEvent.click(await screen.findByRole('button', { name: 'Marcar todas como lidas' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Notificações' })).toBeInTheDocument());
});
