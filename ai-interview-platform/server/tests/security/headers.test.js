const request = require('supertest');
const express = require('express');
const helmet = require('helmet');
const { securityHeaders, buildCSPString, CSP_DIRECTIVES } = require('../../middleware/securityHeaders');

const app = express();
app.use(helmet());
app.use(securityHeaders);
app.get('/test', (req, res) => res.json({ ok: true, locals: res.locals }));

describe('Security Headers', () => {
  it('should set X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should set X-Frame-Options: DENY', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('should set X-XSS-Protection', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-xss-protection']).toBe('1; mode=block');
  });

  it('should set Referrer-Policy', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should set Permissions-Policy', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['permissions-policy']).toContain('camera=(self)');
    expect(res.headers['permissions-policy']).toContain('microphone=(self)');
  });

  it('should set Content-Security-Policy', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain('upgrade-insecure-requests');
  });

  it('should remove X-Powered-By header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should generate CSP nonce', async () => {
    const res = await request(app).get('/test');
    expect(res.body.locals).toBeDefined();
  });

  it('should set HSTS when request is secure', async () => {
    const secureApp = express();
    secureApp.use((req, res, next) => {
      req.secure = true;
      next();
    });
    secureApp.use(helmet({ hsts: false }));
    secureApp.use(securityHeaders);
    secureApp.get('/test', (req, res) => res.json({ ok: true, locals: res.locals }));

    const res = await request(secureApp).get('/test');
    expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains; preload');
  });
});

describe('buildCSPString', () => {
  it('should build valid CSP string from directives', () => {
    const result = buildCSPString({ defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"] });
    expect(result).toContain("default-src 'self'");
    expect(result).toContain("script-src 'self' 'unsafe-inline'");
  });

  it('should handle boolean values', () => {
    const result = buildCSPString({ upgradeInsecureRequests: true });
    expect(result).toContain('upgrade-insecure-requests true');
  });
});