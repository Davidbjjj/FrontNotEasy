import type { Meta, StoryObj } from '@storybook/react';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartWrapper } from './ChartWrapper';

const data = [
  { turma: '3º A', media: 7.8 },
  { turma: '3º B', media: 6.9 },
  { turma: '3º C', media: 8.2 },
];

const chart = (
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="turma" />
    <YAxis domain={[0, 10]} />
    <Tooltip />
    <Bar dataKey="media" name="Média" fill="var(--chart-1)" isAnimationActive={false} />
  </BarChart>
);

const meta: Meta<typeof ChartWrapper> = {
  title: 'UI/ChartWrapper',
  component: ChartWrapper,
  args: {
    title: 'Média por turma',
    description: 'Turma 3º C tem a maior média (8,2); 3º B a menor (6,9).',
    children: chart,
  },
};
export default meta;
type Story = StoryObj<typeof ChartWrapper>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { empty: true } };
export const ErrorState: Story = {
  args: { error: 'Não foi possível carregar o gráfico.', onRetry: () => undefined },
};
