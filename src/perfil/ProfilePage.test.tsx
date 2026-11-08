import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from './ProfilePage';
import { ToastProvider } from '../ui/Toast/ToastProvider';

jest.mock('../services/apiClient', () => ({ __esModule: true, default: {} }));

const renderPage = async () => {
  render(
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>
  );
  await screen.findByRole('heading', { name: 'Dados pessoais' });
};

test('edita o nome e confirma com aviso', async () => {
  await renderPage();
  const input = screen.getByLabelText('Nome');
  userEvent.clear(input);
  userEvent.type(input, 'Maria Souza');
  userEvent.click(screen.getByRole('button', { name: 'Salvar nome' }));
  expect(await screen.findByText('Nome atualizado.')).toBeInTheDocument();
});

test('recusa nome curto', async () => {
  await renderPage();
  const input = screen.getByLabelText('Nome');
  userEvent.clear(input);
  userEvent.type(input, 'Al');
  userEvent.click(screen.getByRole('button', { name: 'Salvar nome' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/pelo menos 3/);
});

test('troca de senha exige a senha atual correta', async () => {
  await renderPage();
  userEvent.type(screen.getByLabelText('Senha atual'), 'errada123');
  userEvent.type(screen.getByLabelText('Nova senha'), 'Outra12345');
  userEvent.type(screen.getByLabelText('Confirmar nova senha'), 'Outra12345');
  userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));
  expect(await screen.findByText('A senha atual está incorreta.')).toBeInTheDocument();

  userEvent.clear(screen.getByLabelText('Senha atual'));
  userEvent.type(screen.getByLabelText('Senha atual'), 'Senha1234');
  userEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));
  expect(await screen.findByText('Senha alterada com sucesso.')).toBeInTheDocument();
});

test('preferências de notificação são salvas por tipo', async () => {
  await renderPage();
  const box = await screen.findByRole('checkbox', { name: /Prazos se aproximando/ });
  const save = screen.getByRole('button', { name: 'Salvar preferências' });
  expect(save).toBeDisabled();
  userEvent.click(box);
  expect(box).not.toBeChecked();
  userEvent.click(save);
  expect(await screen.findByText('Preferências salvas.')).toBeInTheDocument();
});

test('exclusão de conta exige duas etapas e a senha', async () => {
  await renderPage();
  userEvent.click(screen.getByRole('button', { name: 'Excluir minha conta' }));

  const step1 = await screen.findByRole('dialog', { name: /etapa 1 de 2/ });
  const next = within(step1).getByRole('button', { name: 'Continuar' });
  expect(next).toBeDisabled();
  userEvent.click(within(step1).getByRole('checkbox'));
  userEvent.click(next);

  const step2 = await screen.findByRole('dialog', { name: /etapa 2 de 2/ });
  const confirm = within(step2).getByRole('button', { name: 'Confirmar exclusão' });
  expect(confirm).toBeDisabled();
  userEvent.type(within(step2).getByLabelText(/Digite EXCLUIR/), 'EXCLUIR');
  userEvent.type(within(step2).getByLabelText('Sua senha'), 'Senha1234');
  userEvent.click(confirm);

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('button', { name: 'Cancelar exclusão' })).toBeInTheDocument();
});
