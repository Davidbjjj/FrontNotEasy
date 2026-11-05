import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterBar, FilterField } from './FilterBar';
import { Button } from '../Button/Button';

const fields: FilterField[] = [
  { type: 'search', name: 'busca', label: 'Buscar', placeholder: 'Nome ou email' },
  {
    type: 'select',
    name: 'turma',
    label: 'Turma',
    options: [
      { value: '3a', label: '3º A' },
      { value: '3b', label: '3º B' },
    ],
  },
];

const meta: Meta<typeof FilterBar> = { title: 'UI/FilterBar', component: FilterBar };
export default meta;
type Story = StoryObj<typeof FilterBar>;

const Demo: React.FC<{ initial?: Record<string, string>; withActions?: boolean }> = ({
  initial = {},
  withActions,
}) => {
  const [values, setValues] = useState<Record<string, string>>(initial);
  return (
    <FilterBar
      fields={fields}
      values={values}
      onChange={(n, v) => setValues((prev) => ({ ...prev, [n]: v }))}
      onClear={() => setValues({})}
      actions={withActions ? <Button>Nova lista</Button> : undefined}
    />
  );
};

export const Default: Story = { render: () => <Demo /> };
export const WithActiveFilters: Story = { render: () => <Demo initial={{ busca: 'Ana', turma: '3a' }} /> };
export const WithActions: Story = { render: () => <Demo withActions /> };
