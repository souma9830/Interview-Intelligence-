# Security Configuration Guide

## Content Security Policy (CSP)

The server applies a strict CSP via Helmet middleware and a custom `securityHeaders` middleware. 

### Directives

| Directive | Allowed Sources |
|-----------|----------------|
| default-src | `'self'` |
| script-src | `'self'` `'unsafe-inline'` `'unsafe-eval'` `apis.google.com` `www.gstatic.com` + nonce |
| style-src | `'self'` `'unsafe-inline'` `fonts.googleapis.com` |
| img-src | `'self'` `data:` `blob:` |
| font-src | `'self'` `fonts.gstatic.com` `data:` |
| connect-src | `'self'` Firebase Auth / Identity Toolkit / SecureToken |
| frame-src | `accounts.google.com` |
| media-src | `'self'` `blob:` |
| object-src | `'none'` |
| upgrade-insecure-requests | enabled |

Set `CSP_REPORT_URI` in your `.env` to receive violation reports.

## CORS

Allowed origins are configured via the `ALLOWED_ORIGINS` environment variable as a comma-separated list.

Default: `http://localhost:5173,http://localhost:3000`

## HTTP Headers

Applied by `securityHeaders.js` middleware:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(self), microphone=(self)`
- `Strict-Transport-Security` (when served over HTTPS)

## Rate Limiting

| Layer | Limit | Scope |
|-------|-------|-------|
| General | 100 req/min/IP | All routes |
| Sensitive | 10 req/min/IP | Admin, auth routes |

Rate limiter uses an in-memory store with automatic stale entry cleanup every 5 minutes.

## Input Sanitization

- `express-mongo-sanitize` prevents NoSQL injection
- Custom `sanitizeMiddleware` strips dangerous keys from request bodies
- `express-validator` schemas enforce type constraints on all inputs

## Authentication

- Firebase ID tokens verified on every protected request
- Token sent via `Authorization: Bearer <token>` header
- Demo mode available via `ALLOW_DEMO_TOKEN=true` in development
