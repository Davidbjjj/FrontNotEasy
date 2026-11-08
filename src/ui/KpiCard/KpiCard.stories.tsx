import type { Meta, StoryObj } from '@storybook/react';
import { KpiCard } from './KpiCard';

const meta: Meta<typeof KpiCard> = {
  title: 'UI/KpiCard',
  component: KpiCard,
  args: { label: 'Média da turma', value: '7,8' },
};
export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Default: Story = {};
export const TrendUp: Story = { args: { delta: 4.2 } };
export const TrendDown: Story = { args: { delta: -1.5 } };
export const Flat: Story = { args: { delta: 0 } };
export const Loading: Story = { args: { loading: true, delta: 4.2 } };
