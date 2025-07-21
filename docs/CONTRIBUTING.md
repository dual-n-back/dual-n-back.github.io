# Contributing Guide

Welcome to the Dual N-Back project! We're excited to have you contribute to this cognitive training application. This guide will help you get started with contributing effectively.

## 🎯 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Reports**: Help us identify and fix issues
- **💡 Feature Requests**: Suggest new functionality
- **🔧 Code Contributions**: Implement features or fix bugs
- **📚 Documentation**: Improve or expand documentation
- **🧪 Testing**: Add tests or improve test coverage
- **🎨 UI/UX**: Design improvements and accessibility enhancements
- **🧠 Algorithm**: Cognitive science and performance optimizations

### Before You Start

1. **Read the Documentation**: Familiarize yourself with the [Architecture](ARCHITECTURE.md) and [Development Setup](DEVELOPMENT.md)
2. **Check Existing Issues**: Look for existing issues or discussions
3. **Understand the Codebase**: Review the [Code Style Guide](CODE_STYLE.md)

## 🚀 Getting Started

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dual-n-back.github.io.git
   cd dual-n-back.github.io
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make Changes**: Implement your feature or fix
2. **Test Locally**: Ensure everything works correctly
3. **Commit Changes**: Use clear, descriptive commit messages
4. **Push Branch**: Push your feature branch to your fork
5. **Create Pull Request**: Submit a PR with detailed description

## 📝 Pull Request Guidelines

### PR Requirements

- **Clear Description**: Explain what your PR does and why
- **Issue Reference**: Link to related issues (e.g., "Fixes #123")
- **Testing**: Include tests for new functionality
- **Documentation**: Update docs if needed
- **Code Quality**: Follow the established code style

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing
- [ ] Manual testing completed
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

## 🎨 Code Style & Standards

### General Principles

- **Consistency**: Follow existing patterns and conventions
- **Clarity**: Write self-documenting code with clear names
- **Simplicity**: Prefer simple solutions over complex ones
- **Performance**: Consider performance implications
- **Accessibility**: Ensure UI changes are accessible

### TypeScript Guidelines

```typescript
// ✅ Good: Clear interfaces and type definitions
interface GameSequence {
  position: number
  audio: number
  timestamp: number
}

// ✅ Good: Descriptive function names and parameters
const calculateAccuracy = (
  correct: number, 
  incorrect: number, 
  missed: number = 0
): number => {
  const total = correct + incorrect + missed
  return total > 0 ? (correct / total) * 100 : 0
}
```

### React Component Guidelines

```tsx
// ✅ Good: Functional components with hooks
const GameBoard: React.FC = () => {
  const { gamePhase, score } = useGameStore()
  
  // Memoize expensive calculations
  const accuracy = useMemo(() => 
    calculateAccuracy(score.totalCorrect, score.totalIncorrect, score.totalMissed),
    [score]
  )
  
  return (
    <Paper elevation={2}>
      <Typography variant="h4">
        Score: {accuracy.toFixed(1)}%
      </Typography>
    </Paper>
  )
}
```

### State Management Guidelines

```typescript
// ✅ Good: Clear action names and immutable updates
export const useGameStore = create<GameStore>((set, get) => ({
  score: initialScore,
  
  updateScore: (newScore) => set((state) => ({
    score: { ...state.score, ...newScore }
  })),
  
  resetGame: () => set({ 
    score: initialScore,
    gamePhase: 'waiting' 
  })
}))
```

## 🧪 Testing Guidelines

### Testing Philosophy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **Manual Testing**: Verify user experience and accessibility

### Writing Tests

```typescript
// ✅ Good: Clear test descriptions and scenarios
describe('calculateAccuracy', () => {
  it('should return 100% for all correct responses', () => {
    expect(calculateAccuracy(10, 0, 0)).toBe(100)
  })
  
  it('should include missed opportunities as failures', () => {
    expect(calculateAccuracy(9, 0, 6)).toBe(60)
  })
  
  it('should handle edge case of no responses', () => {
    expect(calculateAccuracy(0, 0, 0)).toBe(0)
  })
})
```

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- Browser: [e.g., Chrome 91]
- Device: [e.g., Desktop, iPhone 12]
- Screen Resolution: [e.g., 1920x1080]

## Additional Context
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the proposed feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
How would you like it implemented?

## Alternatives Considered
Other solutions you've considered.

## Additional Context
Any other context or mockups.
```

## 🎯 Areas for Contribution

### High Priority

- **Performance Optimizations**: Improve rendering and state management
- **Accessibility**: Enhance WCAG compliance and screen reader support
- **Mobile Experience**: Optimize touch interactions and responsive design
- **Algorithm Improvements**: Enhance adaptive difficulty system

### Medium Priority

- **New Features**: Additional audio types, themes, achievements
- **Testing**: Increase test coverage and add integration tests
- **Documentation**: Expand guides and add more examples
- **Internationalization**: Add support for multiple languages

### Beginner Friendly

- **UI Polish**: Small styling improvements and animations
- **Bug Fixes**: Simple bug fixes and edge case handling  
- **Documentation**: Fix typos, add examples, improve clarity
- **Testing**: Add unit tests for utility functions

## 📋 Code Review Process

### What We Look For

- **Functionality**: Does the code work as intended?
- **Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Any security considerations?
- **Accessibility**: Does it maintain or improve accessibility?

### Review Timeline

- **Initial Response**: Within 2-3 days
- **Full Review**: Within 1 week
- **Feedback Incorporation**: Please respond within 2 weeks

## 🤝 Community Guidelines

### Code of Conduct

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Inclusive**: Welcome contributors of all backgrounds and skill levels
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that everyone is learning

### Communication

- **GitHub Issues**: For bug reports and feature requests
- **Pull Requests**: For code discussions and reviews
- **Discussions**: For general questions and community chat

## 🎉 Recognition

### Contributors

All contributors are recognized in:
- Project README
- Release notes
- GitHub contributors page

### Maintainer Path

Regular contributors may be invited to become maintainers with:
- Commit access
- PR review responsibilities
- Release management participation

## 📚 Resources

### Learning Resources

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Project Resources

- [Architecture Overview](ARCHITECTURE.md)
- [Development Setup](DEVELOPMENT.md)
- [Code Style Guide](CODE_STYLE.md)
- [API Reference](API_REFERENCE.md)

---

Thank you for contributing to Dual N-Back! Your contributions help improve cognitive training for users worldwide. 🧠✨
