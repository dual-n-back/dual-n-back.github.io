# Development Setup

This guide will help you set up a local development environment for the Dual N-Back project.

## 🎯 Prerequisites

### Required Software

- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+

### Recommended Tools

- **VS Code**: With the following extensions:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer

## 🚀 Quick Start

### 1. Clone Repository

```bash
# Clone your fork or the main repository
git clone https://github.com/dual-n-back/dual-n-back.github.io.git
cd dual-n-back.github.io
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
dual-n-back.github.io/
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── game/          # Game-related components
│   │   ├── settings/      # Settings components
│   │   ├── stats/         # Statistics components
│   │   ├── tutorial/      # Tutorial components
│   │   └── layout/        # Layout components
│   ├── stores/            # Zustand state stores
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript definitions
│   ├── hooks/             # Custom React hooks
│   └── assets/            # Static assets
├── public/                # Public static files
├── docs/                  # Project documentation
├── tests/                 # Test files
├── .github/               # GitHub workflows
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # Project overview
```

## 🛠️ Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Start development server on specific port
npm run dev -- --port 3001

# Type check without building
npm run type-check
```

### Building

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Build and preview
npm run build && npm run preview
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file for local development:

```bash
# .env.local
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
```

### VS Code Settings

Recommended `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 🎨 Styling & Theming

### Material-UI Theme

The project uses Material-UI with a custom theme located in `src/theme/`:

```typescript
// src/theme/index.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})
```

### Component Styling

Use the `sx` prop for component-specific styling:

```tsx
<Box sx={{ 
  p: 2, 
  mt: 3,
  backgroundColor: 'primary.main',
  borderRadius: 1 
}}>
  Content
</Box>
```

## 🔊 Audio Development

### Testing Audio Features

The application includes sophisticated audio management:

```typescript
// Test audio in browser console
import { playAudioTone } from './src/utils/audioManager'

// Play different audio types
playAudioTone(0, 'tones', 500, 0.5)    // Musical tone
playAudioTone(0, 'letters', 500, 0.5)  // Spoken letter
playAudioTone(0, 'numbers', 500, 0.5)  // Spoken number
```

### Audio Debugging

Enable audio debugging in development:

```typescript
// In audioManager.ts
const DEBUG_AUDIO = process.env.NODE_ENV === 'development'
```

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Example test structure
describe('GameLogic', () => {
  describe('calculateAccuracy', () => {
    it('should calculate accuracy including missed opportunities', () => {
      const result = calculateAccuracy(9, 0, 6)
      expect(result).toBe(60)
    })
  })
})
```

### Component Tests

```tsx
// Example component test
import { render, screen } from '@testing-library/react'
import { GameBoard } from './GameBoard'

test('displays final score correctly', () => {
  render(<GameBoard />)
  expect(screen.getByText(/Final Score:/)).toBeInTheDocument()
})
```

### Integration Tests

```typescript
// Test store integration
import { useGameStore } from '../stores/gameStore'

test('game state updates correctly', () => {
  const { startGame, gamePhase } = useGameStore.getState()
  
  startGame()
  expect(gamePhase).toBe('stimulus')
})
```

## 🐛 Debugging

### Browser DevTools

1. **React DevTools**: Install browser extension for component inspection
2. **Console Logging**: Check browser console for adaptive AI insights
3. **Network Tab**: Monitor audio loading and performance
4. **Application Tab**: Inspect localStorage state persistence

### Common Issues

#### Audio Not Playing
- Check browser audio permissions
- Verify Audio Context initialization
- Test with different audio types

#### State Not Persisting
- Check localStorage quota
- Verify JSON serialization
- Clear browser data and restart

#### Performance Issues
- Use React Profiler
- Check for unnecessary re-renders
- Monitor memory usage

## 📱 Mobile Development

### Testing on Mobile

```bash
# Get local IP for mobile testing
ipconfig getifaddr en0  # macOS
ip route get 1.2.3.4 | awk '{print $7}'  # Linux

# Start dev server accessible on network
npm run dev -- --host
```

### Mobile-Specific Features

- Touch event handling
- Responsive grid layouts
- Viewport optimization
- PWA capabilities

## 🔄 Git Workflow

### Branch Naming

```bash
# Feature branches
git checkout -b feature/adaptive-difficulty-improvement
git checkout -b feature/new-audio-type

# Bug fix branches
git checkout -b fix/scoring-calculation-error
git checkout -b fix/mobile-layout-issue

# Documentation branches
git checkout -b docs/api-reference-update
```

### Commit Messages

```bash
# Good commit messages
git commit -m "feat: add bell curve distribution to sequence generation"
git commit -m "fix: include missed opportunities in accuracy calculation"
git commit -m "docs: update architecture documentation"
git commit -m "test: add unit tests for game logic utilities"
```

## 🚀 Deployment

### Local Production Build

```bash
# Build and test production version
npm run build
npm run preview

# Check build size
npm run build -- --analyze
```

### GitHub Pages Deployment

The project deploys automatically to GitHub Pages on main branch updates:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: actions/deploy-pages@v1
```

## 🔧 Troubleshooting

### Common Setup Issues

#### Node Version Issues
```bash
# Use Node Version Manager
nvm install 18
nvm use 18
```

#### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- --port 3001
```

### Performance Optimization

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for duplicate dependencies
npx duplicate-package-checker
```

#### Memory Profiling
```bash
# Monitor memory usage
npm run dev -- --profile
```

## 📚 Learning Resources

### Project-Specific
- [Architecture Overview](ARCHITECTURE.md)
- [Code Style Guide](CODE_STYLE.md)
- [Algorithm Documentation](../ALGORITHM.md)

### Technology Stack
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI](https://mui.com/getting-started/installation/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Vite](https://vitejs.dev/guide/)

### Cognitive Science
- [Working Memory Research](https://en.wikipedia.org/wiki/Working_memory)
- [Dual N-Back Studies](https://en.wikipedia.org/wiki/N-back)
- [Cognitive Load Theory](https://en.wikipedia.org/wiki/Cognitive_load)

---

You're now ready to start developing! If you encounter any issues, check the [troubleshooting section](#-troubleshooting) or open an issue on GitHub.
