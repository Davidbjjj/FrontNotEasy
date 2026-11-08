import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import OnboardingTour from './OnboardingTour';
import { TOURS, getTourForRole } from './tours';
import { getOnboardingStatus, requestTourRestart } from './onboardingStorage';

const mockUser = { role: 'ALUNO', userId: '42', token: null as string | null };
jest.mock('../auth/auth', () => ({ getCurrentUser: () => mockUser }));

const Page = () => (
  <>
    <a href="#a" data-tour="nav-disciplinas">Disciplinas</a>
    <OnboardingTour />
  </>
);

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
  mockUser.role = 'ALUNO';
});
afterEach(() => jest.useRealTimers());

const open = () => act(() => { jest.advanceTimersByTime(600); });

describe('tours', () => {
  it('cada papel tem de 4 a 6 passos', () => {
    Object.values(TOURS).forEach((steps) => {
      expect(steps.length).toBeGreaterThanOrEqual(4);
      expect(steps.length).toBeLessThanOrEqual(6);
    });
    expect(getTourForRole('gestor')).toBeNull();
  });
});

describe('OnboardingTour', () => {
  it('abre no primeiro acesso e conclui até o fim', () => {
    render(<Page />);
    open();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const total = TOURS.ALUNO.length;
    for (let i = 0; i < total - 1; i++) fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Concluir' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(getOnboardingStatus('42')).toBe('completed');
  });

  it('pular registra e não reaparece', () => {
    const { unmount } = render(<Page />);
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Pular tour' }));
    expect(getOnboardingStatus('42')).toBe('skipped');
    unmount();
    render(<Page />);
    open();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Esc pula o tour', () => {
    render(<Page />);
    open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getOnboardingStatus('42')).toBe('skipped');
  });

  it('o menu de ajuda reabre o tour mesmo depois de concluído', () => {
    localStorage.setItem('onboarding:v1:42', 'completed');
    render(<Page />);
    open();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    act(() => requestTourRestart());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('usa o roteiro do papel do usuário', () => {
    mockUser.role = 'PROFESSOR';
    render(<Page />);
    open();
    expect(screen.getByText(/1 de 6/)).toBeInTheDocument();
  });
});
