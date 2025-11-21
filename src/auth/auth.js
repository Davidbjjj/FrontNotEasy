import { decodeJwt } from './jwt';

const STORAGE_TOKEN_KEY = 'token';
const STORAGE_ROLE_KEY = 'role';
const STORAGE_USERID_KEY = 'userId';

// Backend API base used for logout call
const API_BASE = 'https://backnoteasy-production.up.railway.app';
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

/**
 * logoutServer - Calls backend to revoke token and then clears local storage.
 * Behavior:
 *  - Makes POST /auth/logout with Authorization: Bearer <token>
 *  - Treats 200 OK as successful logout
 *  - Treats 401 as already logged out (still clears local storage)
 *  - Returns an object { status, ok }
 */
export async function logoutServer() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const url = API_BASE + '/auth/logout';

  // If no token, behave as already logged out
  if (!token) {
    logout();
    return { status: 401, ok: false };
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: null,
    });

    // If backend says OK, or 401 (already invalid), clear storage
    if (res.status === 200) {
      logout();
      return { status: 200, ok: true };
    }

    if (res.status === 401) {
      // Token invalid/expired/revoked - treat as already logged out
      logout();
      return { status: 401, ok: false };
    }

    // For 400 or other errors, do not assume success; still clear storage to avoid stale token
    if (res.status === 400) {
      logout();
      return { status: 400, ok: false };
    }

    // Other statuses: clear storage as a safe fallback
    logout();
    return { status: res.status || 0, ok: false };
  } catch (err) {
    // Network error: clear storage and propagate minimal info
    try { logout(); } catch (e) {}
    return { status: 0, ok: false };
  }
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
