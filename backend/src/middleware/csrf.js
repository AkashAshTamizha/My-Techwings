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
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.COOKIE_SECRET || 'dev-secret',
  cookieName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Re-exported under its old name so callers (misc.routes.js) don't need to
// know about the underlying library's naming.
module.exports = { doubleCsrfProtection, generateCsrfToken: generateToken };
