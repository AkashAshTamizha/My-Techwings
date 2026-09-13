const express = require('express');
const { generateCsrfToken } = require('../middleware/csrf');

const router = express.Router();

// Frontend calls this once on load to obtain a CSRF token + cookie, then
// sends the token back in the `x-csrf-token` header on every mutating request.
router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(req, res);
  res.status(200).json({ success: true, csrfToken: token });
});

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', uptime: process.uptime() });
});

module.exports = router;
