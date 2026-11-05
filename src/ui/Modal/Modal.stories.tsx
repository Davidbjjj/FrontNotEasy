import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof Modal>;

const Demo: React.FC<{ size?: 'sm' | 'md' | 'lg'; long?: boolean }> = ({ size, long }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <Button onClick={() => setOpen(true)}>Abrir modal</Button>
      <Modal
        open={open}
        size={size}
        title="Confirmar exclusão"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Excluir</Button>
          </>
        }
      >
        {long
          ? Array.from({ length: 30 }, (_, i) => <p key={i}>Parágrafo {i + 1} de conteúdo longo com rolagem interna.</p>)
          : <p style={{ margin: 0 }}>Esta ação não pode ser desfeita.</p>}
      </Modal>
    </div>
  );
};

export const Default: Story = { render: () => <Demo /> };
export const Small: Story = { render: () => <Demo size="sm" /> };
export const Large: Story = { render: () => <Demo size="lg" /> };
export const LongContent: Story = { render: () => <Demo long /> };
