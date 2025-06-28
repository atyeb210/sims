# Contributing to Smart Inventory System

Thank you for your interest in contributing to the Smart Inventory System! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or cloud instance)
- Git
- A text editor or IDE (VS Code recommended)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-inventory-system.git
   cd smart-inventory-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- We use **Prettier** for code formatting
- We use **ESLint** for code linting
- Follow the existing code patterns and conventions
- Use TypeScript for all new code

### Formatting and Linting

Before submitting code, ensure it passes our quality checks:

```bash
# Format code with Prettier
npm run format

# Check linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests if applicable
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

4. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

- **Fill out the PR template** completely
- **Include a clear description** of what your PR does
- **Reference any related issues** using `Fixes #issue-number`
- **Ensure all tests pass** and the build succeeds
- **Keep PRs focused** - one feature or fix per PR
- **Add screenshots** for UI changes

### Code Review Process

1. All PRs require at least one review from a maintainer
2. Address feedback promptly and respectfully
3. Keep discussions constructive and professional
4. Be open to suggestions and alternative approaches

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── inventory/      # Inventory pages
├── components/         # React components
│   ├── auth/          # Authentication components
│   ├── inventory/     # Inventory components
│   └── ui/            # Reusable UI components
├── lib/               # Utility libraries
├── models/            # MongoDB models
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## Database Guidelines

### MongoDB Best Practices

- Use appropriate indexes for queries
- Follow consistent naming conventions
- Validate data at the model level
- Use proper error handling
- Consider performance implications

### Schema Changes

- Document any schema changes in your PR
- Provide migration scripts if needed
- Ensure backward compatibility when possible

## Security Guidelines

- **Never commit sensitive information** (API keys, passwords, etc.)
- Use environment variables for configuration
- Validate all user inputs
- Follow authentication and authorization patterns
- Report security vulnerabilities privately

## Documentation

- Update README.md for significant changes
- Document new API endpoints
- Add JSDoc comments for complex functions
- Update type definitions as needed

## Issue Reporting

### Bug Reports

Include the following information:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots or error messages

### Feature Requests

Include the following information:
- Clear description of the feature
- Use case and benefits
- Proposed implementation approach
- Any relevant examples or mockups

## Getting Help

- Check existing issues and documentation first
- Join our community discussions
- Ask questions in pull request comments
- Reach out to maintainers for guidance

## Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions
- Special mentions for outstanding contributions

Thank you for contributing to Smart Inventory System! 🚀 