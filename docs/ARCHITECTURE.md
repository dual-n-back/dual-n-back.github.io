# System Architecture

## 🏗️ High-Level Overview

The Dual N-Back application is built as a modern React single-page application (SPA) with a sophisticated state management system and advanced cognitive training algorithms.

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  React Components  │  Material-UI  │  Responsive Design         │
│  - Game Board      │  - Theming    │  - Mobile Support          │
│  - Controls        │  - Styling    │  - Accessibility           │
│  - Statistics      │  - Icons      │  - PWA Ready               │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                      State Management Layer                      │
├─────────────────────────────────────────────────────────────────┤
│  Zustand Stores    │  Local Storage │  Performance Tracking     │
│  - Game State      │  - Persistence │  - Adaptive History       │
│  - Statistics      │  - Settings    │  - Session Management     │
│  - Settings        │  - Achievements│  - Real-time Updates      │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                       Business Logic Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  Game Logic        │  Adaptive AI   │  Audio Management         │
│  - Sequence Gen    │  - Performance │  - Sound Synthesis        │
│  - Match Detection │  - Difficulty  │  - Volume Control         │
│  - Scoring         │  - Analytics   │  - Audio Types            │
└─────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                        Core Algorithms                           │
├─────────────────────────────────────────────────────────────────┤
│  Sequence Generation │ Pattern Analysis │ Cognitive Science     │
│  - Bell Curve Dist   │ - Engagement     │ - Research-Based      │
│  - Overlap Strategy  │ - Performance    │ - ADHD Benefits       │
│  - Adaptive Tuning   │ - Trend Analysis │ - Memory Training     │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Core Principles

### 1. **Component-Based Architecture**
- Modular React components with clear responsibilities
- Reusable UI components with consistent styling
- Separation of presentation and business logic

### 2. **Reactive State Management**
- Centralized state with Zustand stores
- Reactive updates across components
- Persistent state with localStorage integration

### 3. **Performance-First Design**
- Optimized rendering with React.memo and callbacks
- Efficient state updates and minimal re-renders
- Lazy loading and code splitting where beneficial

### 4. **Accessibility & UX**
- WCAG compliant design patterns
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for all devices

## 📁 Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── game/           # Core game components
│   ├── settings/       # Settings and configuration
│   ├── stats/          # Statistics and progress tracking
│   ├── tutorial/       # Help and tutorial system
│   └── layout/         # Layout and navigation components
├── stores/             # Zustand state management
│   ├── gameStore.ts    # Game state and logic
│   ├── statsStore.ts   # Statistics and achievements
│   └── settingsStore.ts # User preferences
├── utils/              # Utility functions and algorithms
│   ├── gameLogic.ts    # Core game algorithms
│   ├── audioManager.ts # Audio system management
│   └── engagementTester.ts # Testing and analytics
├── types/              # TypeScript type definitions
│   └── game.ts         # Core type definitions
├── hooks/              # Custom React hooks
└── assets/             # Static assets and resources
```

## 🔄 Data Flow Architecture

### Game Flow
1. **Initialization**: Settings loaded from localStorage
2. **Sequence Generation**: Adaptive algorithm creates stimuli
3. **Presentation**: Visual/audio stimuli displayed to user
4. **Response Collection**: User input captured and validated
5. **Performance Analysis**: Real-time difficulty adjustment
6. **Results**: Statistics updated and achievements checked

### State Flow
```
User Action → Component → Store → Business Logic → State Update → UI Re-render
```

## 🧠 Advanced Features

### Adaptive Difficulty System
- **Real-time Performance Tracking**: Monitors accuracy, response time, missed responses
- **Dynamic Adjustments**: Modifies difficulty every ~25% of sequence
- **N-Level Awareness**: Scales thresholds based on cognitive load
- **Research-Based**: Uses cognitive science principles

### Bell Curve Distribution
- **Natural Pattern Placement**: Prevents clustering at sequence edges
- **Gaussian Weighting**: Mathematical model for optimal engagement
- **Cognitive Load Balancing**: Maintains appropriate challenge level

### Performance Analytics
- **Snapshot System**: Captures performance every 5 responses
- **Trend Analysis**: Identifies improvement/decline patterns
- **Trigger Detection**: Recommends difficulty adjustments
- **Historical Tracking**: Maintains 20 most recent snapshots

## 🛠️ Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type safety and enhanced developer experience
- **Material-UI (MUI)**: Consistent design system and components

### State Management
- **Zustand**: Lightweight, flexible state management
- **Immer**: Immutable state updates
- **Persist Middleware**: localStorage integration

### Build Tools
- **Vite**: Fast development server and optimized builds
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

### Audio
- **Web Audio API**: High-performance audio synthesis
- **Speech Synthesis API**: Text-to-speech capabilities
- **Custom Audio Manager**: Optimized playback system

## 🔒 Security & Performance

### Client-Side Security
- **No External Dependencies**: Fully self-contained application
- **CSP Headers**: Content Security Policy implementation
- **XSS Prevention**: Sanitized user inputs and outputs

### Performance Optimizations
- **Code Splitting**: Lazy-loaded components and routes
- **Memoization**: React.memo and useMemo for expensive operations
- **Efficient Rendering**: Minimal re-renders through optimized state updates
- **Audio Preloading**: Reduced latency for stimulus presentation

## 📊 Monitoring & Analytics

### Built-in Analytics
- **Performance Metrics**: Response times, accuracy, engagement
- **Usage Patterns**: Training frequency, session duration
- **Cognitive Progress**: N-level advancement, skill development

### Development Tools
- **Console Logging**: Adaptive AI decisions and performance insights
- **Engagement Testing**: Sequence quality analysis tools
- **Performance Profiling**: React DevTools integration

## 🔄 Extensibility

### Plugin Architecture
- Modular audio types (tones, letters, numbers)
- Configurable difficulty algorithms
- Extensible achievement system
- Customizable UI themes

### API Design
- Clean utility function interfaces
- Composable game logic functions
- Testable, pure function design
- Well-documented public APIs

## 🚀 Deployment Architecture

### Static Site Generation
- **Build Output**: Optimized static files
- **CDN Ready**: Efficient global distribution
- **PWA Support**: Offline functionality
- **GitHub Pages**: Automated deployment pipeline

### Browser Compatibility
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Support**: iOS Safari 13+, Android Chrome 80+
- **Feature Detection**: Graceful degradation for unsupported features

---

This architecture enables a scalable, maintainable, and high-performance cognitive training application that adapts to user performance while maintaining excellent user experience across all devices.
