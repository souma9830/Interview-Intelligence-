# Contributing to Interview Intelligence

Thank you for your interest in contributing to Interview Intelligence! We want to build the most robust, secure, and beautiful open-source AI mock interview platform.

---

## 🚀 Getting Started as a Contributor

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/Interview-Intelligence-.git
cd Interview-Intelligence-
```

### 2. Set Upstream
```bash
git remote add upstream https://github.com/ELUSoC-2026/Interview-Intelligence-.git
```

### 3. Create a Branch
```bash
git checkout -b fix/your-fix-description
```

### 4. Make Changes & Commit
- Follow the project's coding style (ES5+ with JSDoc, inline styles, functional React components)
- Ensure backward compatibility with stateless/offline fallback modes
- Use semantic commit messages:
  - `fix: resolve [issue]`
  - `feat: add [feature]`
  - `refactor: extract [component]`
  - `docs: update [section]`
  - `security: patch [vulnerability]`
  - `perf: optimize [bottleneck]`

### 5. Push & Open PR
```bash
git push origin fix/your-fix-description
```
Then open a Pull Request against the `master` branch.

---

## 📋 Coding Guidelines

### General
- Prefer functional components with hooks over class components
- Use inline `style={}` objects consistent with existing patterns, or import from `utils/styleConstants.js`
- Handle loading, empty, error, and edge-case states in every component
- Add `aria-label` attributes to all interactive elements
- Ensure keyboard accessibility (focus-visible outlines, tab order)

### Backend
- Use `async/await` with try-catch error handling
- Return consistent JSON shape: `{ success: boolean, data/ message }`
- Use `ApiError` class for operational errors, pass to `next(error)`
- Always provide stateless fallbacks for MongoDB-dependent operations

### Testing
- Run `npm test` before pushing to verify no regressions
- Add test coverage for new controllers and middleware

---

## 🔍 Identified Improvement Areas

### Security
- Authentication bypass via short tokens
- Hardcoded JWT fallback secret
- Missing HTTP security headers (helmet)
- Permissive CORS configuration
- Rate limiter memory leak

### Code Quality
- Duplicate inline style definitions across auth pages
- Duplicate `@keyframes spin` in multiple components
- Duplicate `authHeaders.js` files in two locations
- Missing JSDoc on controllers and utilities
- Synchronous file I/O blocking event loop

### UX & Accessibility
- No loading skeletons (plain text during data fetches)
- Missing ARIA labels on interactive elements
- No skip-to-content link for keyboard users
- OTP input accepts non-numeric characters
- No focus-visible styles for keyboard navigation

### Infrastructure
- Missing `helmet` dependency for security headers
- MongoDB connection never established (`mongoose.connect()` missing)
- CI workflow files in wrong directory
- No ESLint configuration present

---

## ✅ Pull Request Checklist

Before submitting your PR:
- [ ] Branch is isolated to ONE focused change
- [ ] Code follows project style and conventions
- [ ] No unrelated files are modified
- [ ] Stateless/offline fallback modes still work
- [ ] `npm test` passes (if applicable)
- [ ] Responsive design is verified (for UI changes)
- [ ] Accessibility is considered (ARIA labels, keyboard nav)
- [ ] No secrets or credentials are committed

---

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.
