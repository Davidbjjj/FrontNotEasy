import type { Meta, StoryObj } from '@storybook/react';
import { FileText } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from '../Button/Button';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  args: {
    title: 'Nenhuma lista encontrada',
    description: 'Crie sua primeira lista para começar a organizar as avaliações.',
  },
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};
export const WithIconAndAction: Story = {
  args: { icon: <FileText size={48} />, action: <Button>Criar lista</Button> },
};
export const Compact: Story = { args: { compact: true } };
export const TitleOnly: Story = { args: { description: undefined } };
