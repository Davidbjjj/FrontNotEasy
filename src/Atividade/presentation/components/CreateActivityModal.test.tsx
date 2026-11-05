import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateActivityModal from './CreateActivityModal';

describe('CreateActivityModal', () => {
  test('renders in document.body via portal and focuses first input', async () => {
    const onClose = jest.fn();
    const onCreate = jest.fn();

    render(<CreateActivityModal isOpen={true} onClose={onClose} onCreate={onCreate} />);

    // modal content should be present
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // body should have modal-open class
    expect(document.body.classList.contains('modal-open')).toBe(true);

    // first input should be focused (name input)
    const nameInput = screen.getByPlaceholderText('Ex.: Prova - Capítulo 1');
    expect(nameInput).toBeInTheDocument();
    // o foco inicial é aplicado em um setTimeout
    await waitFor(() => expect(nameInput).toHaveFocus());

    // (Tab não é testado aqui: o focus-trap usa offsetParent, que o jsdom não calcula)

    // Escape should call onClose
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('clicking overlay calls onClose, clicking content does not', () => {
    const onClose = jest.fn();
    render(<CreateActivityModal isOpen={true} onClose={onClose} />);
    // o modal é renderizado em portal no body, fora do container do render
    const container = document.body;

    const overlay = container.querySelector('.camodal-overlay');
    const content = container.querySelector('.camodal-content');
    expect(overlay).toBeTruthy();
    expect(content).toBeTruthy();

    // clicking overlay triggers close
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);

    // clicking inside content should NOT trigger close
    if (content) fireEvent.click(content);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
