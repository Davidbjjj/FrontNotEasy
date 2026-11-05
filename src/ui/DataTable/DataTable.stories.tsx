import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, Column } from './DataTable';
import { Button } from '../Button/Button';

interface Aluno {
  id: number;
  nome: string;
  turma: string;
  nota: number | null;
}

const rows: Aluno[] = [
  { id: 1, nome: 'Ana Souza', turma: '3º A', nota: 9.1 },
  { id: 2, nome: 'Bruno Lima', turma: '3º A', nota: 6.4 },
  { id: 3, nome: 'Carla Dias', turma: '3º B', nota: null },
  { id: 4, nome: 'Diego Matos', turma: '3º B', nota: 7.8 },
];

const columns: Column<Aluno>[] = [
  { key: 'nome', header: 'Aluno', sortable: true },
  { key: 'turma', header: 'Turma', sortable: true },
  {
    key: 'nota',
    header: 'Nota',
    sortable: true,
    align: 'right',
    render: (r) => (r.nota == null ? 'Sem nota' : r.nota.toLocaleString('pt-BR')),
  },
];

const meta: Meta<typeof DataTable<Aluno>> = {
  title: 'UI/DataTable',
  component: DataTable,
  args: { columns, rows, rowKey: (r: Aluno) => r.id, caption: 'Notas dos alunos' },
};
export default meta;
type Story = StoryObj<typeof DataTable<Aluno>>;

export const Default: Story = {};
export const ClickableRows: Story = { args: { onRowClick: () => undefined } };
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = {
  args: {
    rows: [],
    emptyTitle: 'Nenhum aluno matriculado',
    emptyDescription: 'Adicione alunos à disciplina para ver as notas aqui.',
    emptyAction: <Button>Adicionar aluno</Button>,
  },
};
/** Use o viewport "Celular" da barra do Storybook: a tabela vira lista de cards. */
export const MobileCards: Story = {
  parameters: { viewport: { defaultViewport: 'mobile' } },
};
