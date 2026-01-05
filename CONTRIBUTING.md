# Contributing to Attendance Tracking Application

Thank you for your interest in contributing to the Attendance Tracking Application! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Prioritize the project's goals and user needs

## Getting Started

1. **Fork the repository**

2. **Clone your fork**
```bash
git clone https://github.com/your-username/attendance-tracker.git
cd attendance-tracker
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/original-repo/attendance-tracker.git
```

4. **Set up your development environment**
```bash
# Follow the setup guide
cat SETUP.md
```

5. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Keep your fork updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Make your changes

- Write clean, readable code
- Follow existing patterns and conventions
- Add comments for complex logic
- Update documentation if needed

### 3. Test your changes

```bash
# Backend
cd backend
npm run lint
npm run type-check
npm run test

# Frontend
cd frontend
npm run lint
npm run type-check
npm run test
```

### 4. Commit your changes

Follow the [commit guidelines](#commit-guidelines) below.

### 5. Push to your fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Use a descriptive title
- Describe what changes you made and why
- Reference any related issues
- Include screenshots for UI changes

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define proper types/interfaces
- Avoid `any` type when possible
- Use descriptive variable names

**Good:**
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
}

const getUserById = async (userId: string): Promise<User> => {
  // Implementation
};
```

**Bad:**
```typescript
const getUser = async (id: any) => {
  // Implementation
};
```

### Backend (Express.js)

- Use controllers for route handlers
- Keep business logic in services
- Use middleware for cross-cutting concerns
- Always handle errors properly
- Use async/await instead of callbacks

**File structure:**
```typescript
// controllers/userController.ts
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getById(req.params.id);
    return sendSuccess(res, user);
  } catch (error) {
    return sendError(res, 'Failed to get user', 500);
  }
};
```

### Frontend (Next.js)

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props
- Follow Next.js App Router conventions
- Use shadcn/ui components when available

**Component structure:**
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button onClick={onClick} className={cn('btn', `btn-${variant}`)}>
      {label}
    </button>
  );
};
```

### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui design system
- Use CSS variables for theming
- Mobile-first responsive design

### Database

- Use parameterized queries (prevent SQL injection)
- Add indexes for foreign keys
- Include timestamps on all tables
- Use transactions for multi-step operations

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
feat(auth): add password reset functionality

Implement password reset flow with email verification.
Users can now request a password reset link via email.

Closes #123
```

```bash
fix(attendance): correct date filtering in reports

Fixed issue where attendance reports showed incorrect
data when filtering by date range.

Fixes #456
```

```bash
docs(readme): update setup instructions

Added Docker setup steps and troubleshooting section.
```

### Scope

Common scopes:
- `auth` - Authentication/authorization
- `attendance` - Attendance tracking
- `user` - User management
- `class` - Class management
- `api` - API changes
- `ui` - UI components
- `db` - Database changes
- `config` - Configuration

## Pull Request Process

### Before Creating a PR

1. ✅ Update your branch with latest main
2. ✅ Run all linters and fix issues
3. ✅ Run type checks
4. ✅ Test your changes thoroughly
5. ✅ Update documentation if needed
6. ✅ Add/update tests if applicable

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes
- Another change
- And another

## Testing
Describe how you tested your changes.

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
Related to #456
```

### PR Review Process

1. Automated checks must pass (linting, type checking)
2. At least one code review approval required
3. No merge conflicts with main
4. Documentation updated if needed

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Writing Tests

**Backend example:**
```typescript
describe('User Service', () => {
  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    
    const user = await userService.create(userData);
    
    expect(user.email).toBe(userData.email);
    expect(user.passwordHash).toBeDefined();
  });
});
```

**Frontend example:**
```typescript
describe('Button component', () => {
  it('renders with correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Project-Specific Guidelines

### Adding New API Endpoints

1. Define route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Implement service logic in `backend/src/services/`
4. Add validation middleware
5. Update API documentation
6. Write tests

### Adding New Pages

1. Create page in `frontend/app/`
2. Create necessary components
3. Add API integration
4. Update navigation if needed
5. Test on different screen sizes

### Database Migrations

1. Create migration file: `YYYYMMDDHHMMSS_description.sql`
2. Write migration SQL
3. Write rollback SQL (optional but recommended)
4. Test migration on local database
5. Document any breaking changes

## Questions?

- Check existing documentation
- Review closed issues and PRs
- Open a new issue for discussion
- Ask in pull request comments

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project changelog

Thank you for contributing! 🎉
