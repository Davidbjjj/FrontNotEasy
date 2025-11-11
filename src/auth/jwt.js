// Lightweight JWT decoder (no verification) — decodes payload only.
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1];
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // add padding
    const pad = base64.length % 4;
    const padded = base64 + (pad ? '='.repeat(4 - pad) : '');
    const json = atob(padded);
    return JSON.parse(json);
  } catch (err) {
    console.error('decodeJwt error', err);
    return null;
  }
}
