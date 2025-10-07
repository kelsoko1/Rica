# Contributing to Rica Platform

Thank you for your interest in contributing to the Rica Platform! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Docker version, etc.)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:
- A clear, descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Any relevant examples or mockups

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following the coding standards below
3. **Test your changes** thoroughly
4. **Update documentation** as needed
5. **Commit your changes** with clear, descriptive messages
6. **Push to your fork** and submit a pull request

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Git

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rica.git
   cd rica
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your configuration

4. Start the development environment:
   ```bash
   # Windows
   start-rica-complete.bat all
   
   # Linux
   ./start-rica-complete.sh all
   ```

## Coding Standards

### JavaScript/React

- Use ES6+ syntax
- Follow React best practices and hooks patterns
- Use functional components over class components
- Implement proper error handling
- Add PropTypes or TypeScript types
- Write meaningful variable and function names

### File Organization

- Keep components in `rica-ui/src/components/`
- Keep services in `rica-ui/src/services/`
- Keep styles with their components (ComponentName.css)
- Use index files for cleaner imports

### Documentation

- Add JSDoc comments for functions and components
- Update README.md for significant changes
- Add inline comments for complex logic
- Update CHANGELOG.md

### Git Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(ui): add health status indicator to topbar

Added a new component that displays the health status of all headless
servers in the topbar when viewing integrated services.

Closes #123
```

```
fix(docker): correct Ollama port mapping

Updated Ollama port from 11434 to 2024 to align with standardized
port mapping scheme (2020-2024).
```

## Testing

### Running Tests

```bash
# UI tests
cd rica-ui
npm test

# API tests
cd rica-api
npm test
```

### Writing Tests

- Write unit tests for new components and functions
- Write integration tests for API endpoints
- Ensure tests are meaningful and maintainable
- Aim for good code coverage

## Docker Guidelines

### Docker Compose Files

- Keep services modular
- Use environment variables for configuration
- Add health checks for all services
- Document port mappings
- Use named volumes for data persistence

### Dockerfile Best Practices

- Use multi-stage builds
- Minimize layer count
- Use specific base image versions
- Don't run as root
- Clean up in the same layer

## Documentation

### When to Update Documentation

- Adding new features
- Changing configuration
- Updating dependencies
- Modifying architecture
- Changing port mappings

### Documentation Files

- `README.md` - Project overview and quick start
- `QUICKSTART.md` - Detailed setup instructions
- `RICA_ARCHITECTURE.md` - System architecture
- `docs/` - Detailed documentation
- Inline code comments - Complex logic explanation

## Review Process

### Pull Request Review

All pull requests require:
1. Passing CI/CD checks
2. Code review from at least one maintainer
3. No merge conflicts
4. Updated documentation
5. Passing tests

### Review Timeline

- Initial review within 3-5 business days
- Follow-up reviews within 1-2 business days
- Merges typically within 1 week of approval

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] Release notes written

## Getting Help

- Check existing [documentation](docs/)
- Search [existing issues](https://github.com/yourusername/rica/issues)
- Ask questions in [discussions](https://github.com/yourusername/rica/discussions)
- Join our community chat (if available)

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Rica Platform! 🎉
