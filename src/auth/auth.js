import { decodeJwt } from './jwt';

const STORAGE_TOKEN_KEY = 'token';
const STORAGE_ROLE_KEY = 'role';
const STORAGE_USERID_KEY = 'userId';

// Backend API base used for logout call
const API_BASE = 'https://backnoteasy-production.up.railway.app';
// Fill localStorage based only on token decoding
export function loginFromResponse(response) {
  if (!response) {
    throw new Error('Invalid response: empty');
  }

  const token = response.token;
  if (!token) {
    // If backend returned no token, but returned an id (legacy), surface a clearer error
    throw new Error('Invalid response: missing token');
  }

  const payload = decodeJwt(token);
  if (!payload) throw new Error('Invalid token');

  // Role: prefer token claim, fallback to top-level response.role
  const role = payload.role ?? response.role ?? null;

  // userId: try multiple possible claim names and fall back to response.id
  const userId =
    payload.userId ??
    payload.userID ??
    payload.user_id ??
    payload.sub ??
    payload.id ??
    payload.instituicaoId ??
    response.userId ??
    response.id ??
    null;

  if (!role || !userId) {
    throw new Error('Token missing required claims (role or userId)');
  }

  // store token and the two required values only
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_ROLE_KEY, role);
  localStorage.setItem(STORAGE_USERID_KEY, String(userId));

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
  const storedRole = localStorage.getItem(STORAGE_ROLE_KEY);
  const storedUserId = localStorage.getItem(STORAGE_USERID_KEY);

  if (!token) {
    // Fallback: if token missing, but role/userId are stored, treat as authenticated
    if (storedRole && storedUserId) return { role: storedRole, userId: storedUserId };
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    // If token cannot be decoded, fall back to stored values
    if (storedRole && storedUserId) return { role: storedRole, userId: storedUserId };
    return null;
  }

  // exp is in seconds since epoch
  const exp = payload.exp;
  if (typeof exp === 'number') {
    const now = Math.floor(Date.now() / 1000);
    if (exp <= now) {
      // expired
      return null;
    }
  }

  const role = payload.role ?? storedRole;
  const userId =
    payload.userId ??
    payload.userID ??
    payload.user_id ??
    payload.sub ??
    payload.id ??
    payload.instituicaoId ??
    storedUserId ??
    null;

  if (!role || !userId) return null;
  return { role, userId };
}

// get current user based on decoding token in localStorage
export function getCurrentUser() {
  const token = localStorage.getItem(STORAGE_TOKEN_KEY);
  const storedRole = localStorage.getItem(STORAGE_ROLE_KEY);
  const storedUserId = localStorage.getItem(STORAGE_USERID_KEY);

  if (!token) {
    if (storedRole && storedUserId) return { token: null, role: storedRole, userId: storedUserId };
    return null;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    if (storedRole && storedUserId) return { token, role: storedRole, userId: storedUserId };
    return null;
  }

  const role = payload.role ?? storedRole;
  const userId =
    payload.userId ??
    payload.userID ??
    payload.user_id ??
    payload.sub ??
    payload.id ??
    payload.instituicaoId ??
    storedUserId ??
    null;

  if (!role || !userId) return null;
  return { token, role, userId };
}

// helper: returns boolean
export function isAuthenticated() {
  return verifyAuth() !== null;
}
