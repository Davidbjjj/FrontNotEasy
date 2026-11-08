import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, Column } from './DataTable';

interface Row { id: number; nome: string; nota: number | null }
const rows: Row[] = [
  { id: 1, nome: 'Carla', nota: 5 },
  { id: 2, nome: 'Ana', nota: 9 },
  { id: 3, nome: 'Bruno', nota: null },
];
const columns: Column<Row>[] = [
  { key: 'nome', header: 'Aluno', sortable: true },
  { key: 'nota', header: 'Nota', sortable: true },
];
const names = () =>
  screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);

test('ordena ao clicar no cabeçalho e expõe aria-sort', () => {
  render(<DataTable caption="Notas" columns={columns} rows={rows} rowKey={(r) => r.id} />);
  userEvent.click(screen.getByRole('button', { name: /Aluno/ }));
  expect(names()).toEqual(['Ana', 'Bruno', 'Carla']);
  expect(screen.getByRole('columnheader', { name: /Aluno/ })).toHaveAttribute('aria-sort', 'ascending');
  userEvent.click(screen.getByRole('button', { name: /Aluno/ }));
  expect(names()).toEqual(['Carla', 'Bruno', 'Ana']);
});

test('cada célula carrega data-label para o layout de cards no celular', () => {
  render(<DataTable caption="Notas" columns={columns} rows={rows} rowKey={(r) => r.id} />);
  expect(screen.getAllByRole('cell')[1]).toHaveAttribute('data-label', 'Nota');
});

test('sem linhas mostra o estado vazio com orientação', () => {
  render(
    <DataTable caption="Notas" columns={columns} rows={[]} rowKey={(r) => r.id}
      emptyTitle="Nenhum aluno" emptyDescription="Adicione alunos." />
  );
  expect(screen.getByText('Nenhum aluno')).toBeInTheDocument();
  expect(screen.getByText('Adicione alunos.')).toBeInTheDocument();
});

test('linha clicável responde a Enter', () => {
  const onRowClick = jest.fn();
  render(<DataTable caption="Notas" columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={onRowClick} />);
  const row = screen.getAllByRole('row')[1];
  row.focus();
  userEvent.keyboard('{Enter}');
  expect(onRowClick).toHaveBeenCalledWith(rows[0]);
});
