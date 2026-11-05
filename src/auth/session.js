// Helpers de navegação por papel e de sessão expirada (FE-002)

export const SESSION_EXPIRED_EVENT = 'session-expired';
const RETURN_TO_KEY = 'returnTo';

/** Página inicial de cada papel; visitante volta para a landing page. */
export function getHomeForRole(role) {
  switch (role) {
    case 'INSTITUICAO':
      return '/instituicao';
    case 'PROFESSOR':
    case 'ALUNO':
      return '/disciplinas';
    default:
      return '/';
  }
}

/** Avisa a aplicação que a sessão acabou, guardando a página atual para o retorno. */
export function notifySessionExpired(returnTo) {
  const target =
    returnTo || `${window.location.pathname}${window.location.search}${window.location.hash}`;
  try {
    // Não guarda telas públicas como destino de retorno
    if (target !== '/login' && target !== '/') sessionStorage.setItem(RETURN_TO_KEY, target);
  } catch (e) {
    // sessionStorage indisponível: segue sem retorno
  }
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { returnTo: target } }));
}

/** Lê (e apaga) a página de retorno guardada; usada logo após um login bem-sucedido. */
export function consumeReturnTo(fallback = '/listas') {
  try {
    const value = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    // Só aceita caminhos internos
    if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  } catch (e) {
    // ignore
  }
  return fallback;
}
