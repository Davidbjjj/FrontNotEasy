import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import '../src/global.css';
import { ToastProvider } from '../src/ui/Toast/ToastProvider';

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <ToastProvider>
          <Story />
        </ToastProvider>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    // Falhas do axe aparecem na aba Accessibility; "error" faz o test-runner falhar o CI
    a11y: { config: {}, options: {}, test: 'error' },
    viewport: {
      viewports: {
        mobile: { name: 'Celular', styles: { width: '375px', height: '700px' }, type: 'mobile' },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '900px' }, type: 'tablet' },
      },
    },
  },
};

export default preview;
