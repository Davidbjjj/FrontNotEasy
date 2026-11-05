import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentUser } from '../auth/auth';
import { getTourForRole, TourStep } from './tours';
import { getOnboardingStatus, setOnboardingStatus, START_TOUR_EVENT } from './onboardingStorage';
import styles from './OnboardingTour.module.css';

const PADDING = 6;
const GAP = 14;
const MARGIN = 12;

/** O mesmo alvo existe na navbar lateral e na inferior; usa o que está visível */
function findTarget(target?: string): HTMLElement | null {
  if (!target) return null;
  const nodes = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);
  for (const el of Array.from(nodes)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

interface Layout {
  spot: { top: number; left: number; width: number; height: number } | null;
  pop: { top: number; left: number };
}

function computeLayout(el: HTMLElement | null, pop: HTMLElement | null): Layout {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pw = pop?.offsetWidth ?? 320;
  const ph = pop?.offsetHeight ?? 160;
  const clampLeft = (x: number) => Math.max(MARGIN, Math.min(x, vw - pw - MARGIN));
  const clampTop = (y: number) => Math.max(MARGIN, Math.min(y, vh - ph - MARGIN));

  if (!el) {
    return { spot: null, pop: { top: clampTop((vh - ph) / 2), left: clampLeft((vw - pw) / 2) } };
  }
  const r = el.getBoundingClientRect();
  const spot = {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
  // Navbar lateral: abre o balão à direita do item
  if (spot.left + spot.width + GAP + pw + MARGIN <= vw && r.left < vw / 3 && r.height < vh / 3 && r.top < vh - 100) {
    return { spot, pop: { top: clampTop(r.top + r.height / 2 - ph / 2), left: spot.left + spot.width + GAP } };
  }
  const below = r.top + r.height / 2 < vh / 2;
  const top = below ? spot.top + spot.height + GAP : spot.top - GAP - ph;
  return { spot, pop: { top: clampTop(top), left: clampLeft(r.left + r.width / 2 - pw / 2) } };
}

interface TourProps {
  steps: TourStep[];
  onFinish: (status: 'completed' | 'skipped') => void;
}

export const TourOverlay: React.FC<TourProps> = ({ steps, onFinish }) => {
  const [index, setIndex] = useState(0);
  const [layout, setLayout] = useState<Layout | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const step = steps[index];
  const last = index === steps.length - 1;

  const reposition = useCallback(() => {
    setLayout(computeLayout(findTarget(step.target), popRef.current));
  }, [step]);

  // Rola o alvo para a tela e posiciona; mede de novo depois do balão renderizar
  useLayoutEffect(() => {
    findTarget(step.target)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    reposition();
  }, [step, reposition]);

  useEffect(() => {
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [reposition]);

  // Leva o foco para o balão a cada passo (leitores de tela leem o título e o texto)
  useEffect(() => {
    popRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFinish('skipped');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onFinish]);

  const next = () => (last ? onFinish('completed') : setIndex((i) => i + 1));

  return createPortal(
    <div className={styles.root} data-testid="onboarding-tour">
      <div className={styles.blocker} />
      {layout?.spot ? (
        <div
          className={styles.spotlight}
          style={{ top: layout.spot.top, left: layout.spot.left, width: layout.spot.width, height: layout.spot.height }}
        />
      ) : (
        <div className={styles.dim} />
      )}
      <div
        ref={popRef}
        className={styles.popover}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-body"
        tabIndex={-1}
        style={layout ? { top: layout.pop.top, left: layout.pop.left } : { visibility: 'hidden' }}
      >
        <h2 id="onboarding-title" className={styles.title}>{step.title}</h2>
        <p id="onboarding-body" className={styles.body}>{step.body}</p>
        <div className={styles.footer}>
          <span className={styles.counter}>{index + 1} de {steps.length}</span>
          <div className={styles.buttons}>
            <button type="button" className={`${styles.btn} ${styles.btnLink}`} onClick={() => onFinish('skipped')}>
              Pular tour
            </button>
            {index > 0 && (
              <button type="button" className={styles.btn} onClick={() => setIndex((i) => i - 1)}>
                Voltar
              </button>
            )}
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={next}>
              {last ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/** Inicia sozinho no primeiro acesso e quando o menu de ajuda pede para rever */
const OnboardingTour: React.FC = () => {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const userRef = useRef<string | null>(null);

  const start = useCallback(() => {
    const user = getCurrentUser();
    const tour = getTourForRole(user?.role);
    if (!user || !tour) return;
    userRef.current = String(user.userId);
    setSteps(tour);
  }, []);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || !getTourForRole(user.role) || getOnboardingStatus(String(user.userId))) return undefined;
    // espera o layout (navbar, topbar) montar para os alvos existirem
    const t = window.setTimeout(start, 500);
    return () => window.clearTimeout(t);
  }, [start]);

  useEffect(() => {
    window.addEventListener(START_TOUR_EVENT, start);
    return () => window.removeEventListener(START_TOUR_EVENT, start);
  }, [start]);

  const finish = useCallback((status: 'completed' | 'skipped') => {
    if (userRef.current) setOnboardingStatus(userRef.current, status);
    setSteps(null);
  }, []);

  return steps ? <TourOverlay steps={steps} onFinish={finish} /> : null;
};

export default OnboardingTour;
