import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';

jest.mock('../services/apiClient', () => ({ __esModule: true, default: {} }));

const Where = () => {
  const l = useLocation();
  return <p data-testid="where">{l.pathname + l.search}</p>;
};

const renderSearch = (role: string) => {
  localStorage.setItem('role', role);
  localStorage.setItem('userId', '1');
  return render(
    <MemoryRouter initialEntries={['/inicio']}>
      <GlobalSearch />
      <Routes>
        <Route path="*" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
};

afterEach(() => localStorage.clear());

test('agrupa por tipo, limita a 5 itens e oferece "ver todos"', async () => {
  renderSearch('PROFESSOR');
  userEvent.type(screen.getByRole('combobox', { name: 'Busca global' }), 'lista');
  const listas = await screen.findByRole('group', { name: 'Listas' });
  expect(within(listas).getAllByRole('option')).toHaveLength(6); // 5 itens + ver todos
  expect(within(listas).getByRole('option', { name: /Ver todos em Listas \(7\)/ })).toBeInTheDocument();
});

test('setas navegam pelos resultados e Enter abre o selecionado', async () => {
  renderSearch('PROFESSOR');
  const input = screen.getByRole('combobox', { name: 'Busca global' });
  userEvent.type(input, 'fisica');
  await screen.findAllByRole('option');
  userEvent.keyboard('{arrowdown}{arrowdown}');
  const opts = screen.getAllByRole('option');
  expect(opts[1]).toHaveAttribute('aria-selected', 'true');
  expect(input).toHaveAttribute('aria-activedescendant', opts[1].id);
  userEvent.keyboard('{enter}');
  expect(screen.getByTestId('where')).toHaveTextContent('/listas');
});

test('mostra mensagem clara quando não há resultados', async () => {
  renderSearch('PROFESSOR');
  userEvent.type(screen.getByRole('combobox', { name: 'Busca global' }), 'zzzxyz');
  expect(await screen.findByText(/Nenhum resultado para “zzzxyz”/)).toBeInTheDocument();
});

test('aluno não vê alunos nem questões', async () => {
  renderSearch('ALUNO');
  userEvent.type(screen.getByRole('combobox', { name: 'Busca global' }), 'an');
  await screen.findByRole('group', { name: 'Listas' });
  expect(screen.queryByRole('group', { name: 'Alunos' })).not.toBeInTheDocument();
  expect(screen.queryByRole('group', { name: 'Questões' })).not.toBeInTheDocument();
});

test('Ctrl+K foca o campo', () => {
  renderSearch('PROFESSOR');
  userEvent.keyboard('{ctrl}k{/ctrl}');
  expect(screen.getByRole('combobox', { name: 'Busca global' })).toHaveFocus();
});
