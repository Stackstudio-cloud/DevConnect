# Contributing to DevConnect

Thank you for your interest in contributing to DevConnect! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions
- **Bug Reports** - Help us identify and fix issues
- **Feature Requests** - Suggest new functionality
- **Code Contributions** - Submit bug fixes or new features
- **Documentation** - Improve our docs and guides
- **Testing** - Help us improve test coverage
- **Design** - Enhance user experience and interface

## 🚀 Getting Started

### 1. Fork and Clone
```bash
git fork https://github.com/your-username/devconnect.git
git clone https://github.com/your-username/devconnect.git
cd devconnect
```

### 2. Set Up Development Environment
```bash
npm install
npm run db:push
npm run dev
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

## 📝 Development Guidelines

### Code Style
- **TypeScript** for all new code
- **ESLint** configuration must pass
- **Prettier** for consistent formatting
- **Meaningful variable names** and function names
- **JSDoc comments** for public functions

### Commit Messages
Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
feat: add voice interface for hands-free navigation
fix: resolve authentication timeout issue
docs: update API documentation
test: add unit tests for matching algorithm
```

### Pull Request Process
1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md**
5. **Request review** from maintainers

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Writing Tests
- **Unit tests** for individual functions
- **Integration tests** for API endpoints
- **E2E tests** for user workflows
- **Minimum 80% coverage** for new code

## 🐛 Reporting Issues

### Bug Reports
Use the bug report template and include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, etc.)

### Feature Requests
Use the feature request template and include:
- **Problem statement** you're trying to solve
- **Proposed solution** with details
- **Alternative solutions** considered
- **Mockups or wireframes** if applicable

## 📚 Development Resources

### Project Structure
```
devconnect/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── docs/            # Documentation
├── tests/           # Test files
└── public/          # Static assets
```

### Key Technologies
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, PostgreSQL, Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Real-time**: WebSocket for messaging
- **AI**: Custom recommendation algorithms

### API Documentation
- **OpenAPI Spec**: `/docs/api.yaml`
- **Postman Collection**: `/docs/devconnect.postman_collection.json`
- **Database Schema**: `/docs/database-schema.md`

## 🔧 Local Development

### Environment Setup
1. **Database**: PostgreSQL (local or Neon)
2. **Authentication**: Replit Auth setup
3. **Environment Variables**: Copy `.env.example` to `.env`

### Common Commands
```bash
# Development server
npm run dev

# Database migrations
npm run db:push
npm run db:studio

# Code formatting
npm run format

# Linting
npm run lint
```

## 🌟 Recognition

Contributors will be:
- **Listed** in our README
- **Mentioned** in release notes
- **Invited** to contributor Discord
- **Eligible** for contributor swag

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/devconnect)
- **GitHub Discussions**: [Ask questions](https://github.com/your-username/devconnect/discussions)
- **Email**: contributors@devconnect.app

## 📄 License

By contributing to DevConnect, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making DevConnect better! 🚀**