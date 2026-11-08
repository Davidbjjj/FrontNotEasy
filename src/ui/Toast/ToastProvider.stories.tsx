import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useToast, ToastVariant } from './ToastProvider';
import { Button } from '../Button/Button';

// O ToastProvider já vem do decorator global (.storybook/preview.js)
const meta: Meta = { title: 'UI/Toast' };
export default meta;
type Story = StoryObj;

const Trigger: React.FC<{ variant: ToastVariant; withAction?: boolean; sticky?: boolean }> = ({
  variant,
  withAction,
  sticky,
}) => {
  const { show } = useToast();
  return (
    <Button
      onClick={() =>
        show({
          variant,
          title: withAction ? 'Lista removida' : undefined,
          message: withAction ? 'A lista foi excluída.' : `Aviso do tipo ${variant}`,
          duration: sticky ? 0 : 5000,
          actionLabel: withAction ? 'Desfazer' : undefined,
          onAction: withAction ? () => undefined : undefined,
        })
      }
    >
      Mostrar toast ({variant})
    </Button>
  );
};

export const Success: Story = { render: () => <Trigger variant="success" /> };
export const Error: Story = { render: () => <Trigger variant="error" /> };
export const Warning: Story = { render: () => <Trigger variant="warning" /> };
export const Info: Story = { render: () => <Trigger variant="info" /> };
export const WithAction: Story = { render: () => <Trigger variant="info" withAction /> };
export const Persistent: Story = { render: () => <Trigger variant="error" sticky /> };
