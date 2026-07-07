# Contributing to Interview Intelligence

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear title describing the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing feature requests
2. Create an issue with:
   - Problem statement
   - Proposed solution
   - Alternatives considered

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Commit with descriptive message
7. Push to your fork
8. Create a Pull Request

## Development Setup

See [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for detailed instructions.

## Branch Naming

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `refactor/` | Code refactoring |
| `docs/` | Documentation |
| `test/` | Test additions |
| `chore/` | Maintenance tasks |

Example: `feature/add-dark-mode-toggle`

## Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding/updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(auth): implement OTP verification
fix(dashboard): resolve state update on unmounted component
docs(readme): add deployment instructions
refactor(hooks): extract useFetch from useApi
```

## Code Style

### JavaScript/JSX

- Use ES6+ features
- Prefer `const` and `let` over `var`
- Use arrow functions for callbacks
- Destructure when possible
- Use template literals for string interpolation

### React

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful prop and variable names

### CSS

- Use CSS custom properties for theming
- Prefer inline styles for component-specific styling
- Follow existing style patterns

## Testing Guidelines

### Client Tests

```bash
cd client
npm test
```

- Test component rendering
- Test user interactions
- Test hook behavior
- Mock API calls

### Server Tests

```bash
cd server
npm test
```

- Test API endpoints
- Test error handling
- Test authentication
- Mock external services

## Pull Request Process

1. **Create descriptive PR title**
   - Use conventional commit format
   - Reference related issues

2. **Fill out PR template**
   - Describe changes
   - List modifications
   - Add testing steps
   - Complete checklist

3. **Ensure CI passes**
   - All tests pass
   - No lint errors
   - Build succeeds

4. **Request review**
   - Tag relevant maintainers
   - Address feedback promptly

5. **Merge**
   - Squash commits if needed
   - Delete feature branch after merge

## Code Review Guidelines

### For Authors

- Respond to all comments
- Make requested changes promptly
- Mark resolved conversations

### For Reviewers

- Be constructive and respectful
- Focus on code quality and functionality
- Suggest improvements, not just problems
- Approve when satisfied

## Project Structure

```
Interview-Intelligence-/
├── ai-interview-platform/
│   ├── client/           # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   └── package.json
│   └── server/           # Node.js backend
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── package.json
└── docs/                 # Documentation
```

## Getting Help

- Check existing documentation
- Search existing issues
- Ask in discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
