/**
 * Centralized auth header generation for client API calls.
 *
 * The backend expects: Authorization: Bearer <firebase_jwt>
 *
 * For local/offline dev sessions, the server accepts a hard-coded demo token
 * only when NODE_ENV is development.
 *
 * This helper avoids hardcoding demo tokens in individual pages.
 */

export function getAuthHeader() {
  const token = localStorage.getItem('camsense_token');

  // Prefer real Firebase token when available.
  if (token && token.trim()) {
    return { Authorization: `Bearer ${token}` };
  }

  // Keep dev-mode compatibility without spreading sentinel values across components.
  // If NODE_ENV is not development, the backend will reject this token.
  return { Authorization: 'Bearer demo_token_active' };
}

