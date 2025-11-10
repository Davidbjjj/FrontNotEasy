import { decodeJwt } from './jwt';

const STORAGE_TOKEN_KEY = 'token';
const STORAGE_ROLE_KEY = 'role';
const STORAGE_USERID_KEY = 'userId';

// Fill localStorage based only on token decoding
export function loginFromResponse(response) {
  if (!response || !response.token) {
    throw new Error('Invalid response: missing token');
  }
  const token = response.token;
  const payload = decodeJwt(token);
  if (!payload) throw new Error('Invalid token');

  const role = payload.role;
  const userId = payload.userId;

  if (!role || !userId) {
    throw new Error('Token missing required claims (role or userId)');
  }

  // store token and the two required values only
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_ROLE_KEY, role);
  localStorage.setItem(STORAGE_USERID_KEY, userId);

  return { token, role, userId };
}

export function logout() {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_ROLE_KEY);
  localStorage.removeItem(STORAGE_USERID_KEY);
}

// verify authentication: checks token presence and not expired; returns { role, userId } or null
export function verifyAuth() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;

  // exp is in seconds since epoch
  const exp = payload.exp;
  if (typeof exp === 'number') {
    const now = Math.floor(Date.now() / 1000);
    if (exp <= now) {
      // expired
      return null;
    }
  }

  const role = payload.role;
  const userId = payload.userId;
  if (!role || !userId) return null;
  return { role, userId };
}

// get current user based on decoding token in localStorage
export function getCurrentUser() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  const role = payload.role;
  const userId = payload.userId;
  if (!role || !userId) return null;
  return { token, role, userId };
}

// helper: returns boolean
export function isAuthenticated() {
  return verifyAuth() !== null;
}
