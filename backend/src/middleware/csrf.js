const { doubleCsrf } = require('csrf-csrf');

// Double-submit-cookie CSRF protection. The frontend fetches a token from
// GET /api/v1/csrf-token, echoes it back in the "x-csrf-token" header on
// every mutating request, and the cookie is httpOnly+sameSite=strict so it
// can't be read or forged cross-site.
//
// BUG FIX: `csrf-csrf`'s doubleCsrf() returns a function named
// `generateToken` (not `generateCsrfToken` — that name has never existed in
// this library, in any 3.x release). Destructuring the wrong name silently
// gave `undefined`, which only surfaced once something actually called it
// -> "TypeError: generateCsrfToken is not a function" on GET /csrf-token.
// In production the frontend (Vercel) and backend (Render) are on different
// domains, so this is a cross-site request from the browser's point of view.
// A cookie marked SameSite=Strict/Lax is silently dropped in that context
// (see the "Cookie ... has been rejected because it is in a cross-site
// context" console warning) -> the CSRF cookie never reaches the client ->
// every mutating request fails with "invalid csrf token". SameSite=None
// requires Secure, which is fine since both hosts are HTTPS in production.
// Locally, frontend/backend are same-site (just different ports), so
// Lax/Strict still works there and is the tighter choice for dev.
const isProd = process.env.NODE_ENV === 'production';
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.COOKIE_SECRET || 'dev-secret',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'strict',
    secure: isProd,
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Re-exported under its old name so callers (misc.routes.js) don't need to
// know about the underlying library's naming.
module.exports = { doubleCsrfProtection, generateCsrfToken: generateToken };