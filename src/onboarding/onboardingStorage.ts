export type OnboardingStatus = 'completed' | 'skipped';

export const START_TOUR_EVENT = 'notEasy:start-tour';

const keyFor = (userId: string) => `onboarding:v1:${userId}`;

export function getOnboardingStatus(userId: string): OnboardingStatus | null {
  try {
    const v = localStorage.getItem(keyFor(userId));
    return v === 'completed' || v === 'skipped' ? v : null;
  } catch {
    return null;
  }
}

export function setOnboardingStatus(userId: string, status: OnboardingStatus): void {
  try {
    localStorage.setItem(keyFor(userId), status);
  } catch {
    // armazenamento indisponível: o tour pode reaparecer, sem quebrar o app
  }
}

/** Pedido do menu de ajuda para rever o tour */
export function requestTourRestart(): void {
  window.dispatchEvent(new Event(START_TOUR_EVENT));
}
