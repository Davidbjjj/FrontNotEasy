import { getHomeForRole, notifySessionExpired, consumeReturnTo, SESSION_EXPIRED_EVENT } from './session';

afterEach(() => sessionStorage.clear());

test('getHomeForRole leva cada papel ao seu início', () => {
  expect(getHomeForRole('INSTITUICAO')).toBe('/instituicao');
  expect(getHomeForRole('PROFESSOR')).toBe('/disciplinas');
  expect(getHomeForRole('ALUNO')).toBe('/inicio');
  expect(getHomeForRole(undefined)).toBe('/');
});

test('sessão expirada guarda a página atual e dispara o evento', () => {
  const handler = jest.fn();
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
  notifySessionExpired('/listas/12/questoes?x=1');
  window.removeEventListener(SESSION_EXPIRED_EVENT, handler);

  expect(handler).toHaveBeenCalledTimes(1);
  expect(consumeReturnTo('/listas')).toBe('/listas/12/questoes?x=1');
  // consumido uma vez só
  expect(consumeReturnTo('/listas')).toBe('/listas');
});

test('consumeReturnTo ignora destinos externos', () => {
  sessionStorage.setItem('returnTo', '//evil.com');
  expect(consumeReturnTo('/listas')).toBe('/listas');
});
