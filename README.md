# Dual N-Back Brain Training Game

[![Deploy to GitHub Pages](https://github.com/dual-n-back/dual-n-back.github.io/workflows/Deploy/badge.svg)](https://github.com/dual-n-back/dual-n-back.github.io/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)](https://mui.com/)

A modern, fully client-side Dual N-Back game built with React, TypeScript, and Material-UI. Train your working memory and cognitive abilities with this scientifically-backed brain training exercise.

## 🎯 Features

- **Modern Design**: Beautiful Material Design interface with smooth animations
- **Full Dual N-Back Implementation**: Visual and audio stimuli with customizable difficulty
- **Progressive Training**: Start with 2-back and advance to higher levels
- **Comprehensive Statistics**: Track your progress with detailed analytics
- **Achievement System**: Unlock achievements as you improve
- **Customizable Settings**: Adjust timing, audio, visual settings, and more
- **Data Export/Import**: Backup and restore your training data
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Offline Support**: Fully client-side, works without internet connection

## 🧠 What is Dual N-Back?

Dual N-Back is a cognitive training task that challenges your working memory. Players must identify when visual positions and audio stimuli match those presented N steps back in a sequence. Research suggests that regular practice may improve:

- Working memory capacity
- Fluid intelligence
- Attention and focus
- Problem-solving abilities

## 🚀 Quick Start

### Play Online

Visit [https://dual-n-back.github.io/dual-n-back.github.io/](https://dual-n-back.github.io/dual-n-back.github.io/) to start training immediately.

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/dual-n-back/dual-n-back.github.io.git
   cd dual-n-back.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Choose your N-level**: Start with 2-back for beginners
2. **Watch and listen**: Pay attention to visual positions and audio stimuli
3. **Make decisions**: Identify when stimuli match those from N steps back
4. **Respond quickly**: Use the match/no-match buttons for each modality
5. **Track progress**: Monitor your improvement over time

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **Build Tool**: Vite
- **State Management**: React Context API
- **Audio**: Web Audio API + Speech Synthesis API
- **Styling**: Emotion (CSS-in-JS)
- **Deployment**: GitHub Pages
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── game/           # Game-related components
│   ├── layout/         # Layout components
│   ├── settings/       # Settings components
│   ├── stats/          # Statistics components
│   └── tutorial/       # Tutorial components
├── contexts/           # React context providers
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── gameLogic.ts    # Game logic and calculations
│   └── audioManager.ts # Audio handling
└── main.tsx           # Application entry point
```

## 🎨 Features in Detail

### Game Modes
- **Visual Only**: Focus on position memory
- **Audio Only**: Focus on sound memory  
- **Dual Mode**: Train both simultaneously (recommended)

### Customization Options
- **N-Back Level**: 1-10 (difficulty adjustment)
- **Round Count**: 10-100 rounds per session
- **Grid Size**: 3x3, 4x4, or 5x5 position grid
- **Audio Types**: Musical tones, spoken letters, or numbers
- **Timing**: Adjustable stimulus duration and intervals
- **Volume Control**: Fine-tune audio levels

### Statistics & Progress
- **Session History**: Detailed logs of all training sessions
- **Performance Metrics**: Accuracy, reaction time, streak tracking
- **N-Level Progress**: Performance breakdown by difficulty level
- **Visual Charts**: Graphs showing improvement over time
- **Achievement System**: Motivational goals and milestones

## 🔧 Configuration

The game includes comprehensive settings for customization:

- **Game Settings**: N-level, rounds, grid size, modalities
- **Audio Settings**: Type, volume, test functionality  
- **Timing Settings**: Stimulus duration, interstimulus interval
- **Data Management**: Export/import statistics, clear data

## 📊 Performance Tracking

Track your cognitive training with detailed analytics:

- **Accuracy Percentage**: Overall and per-modality performance
- **Training Streaks**: Daily practice consistency
- **Best Scores**: Personal records and achievements
- **Time Investment**: Total training time tracking
- **Progress Visualization**: Charts and graphs of improvement

## 🏆 Achievement System

Unlock achievements to stay motivated:

- 🎯 **First Steps**: Complete your first session
- 🏆 **Perfect Mind**: Achieve 100% accuracy
- 💪 **Dedicated Trainer**: Complete 10 sessions
- 🧠 **Memory Master**: Successfully complete 5-back
- 🔥 **Week Warrior**: Maintain 7-day streak
- ⏰ **Time Invested**: Train for over 1 hour total

## 🌐 Browser Compatibility

- Chrome 80+ (recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

**Audio Features Require**:
- Web Audio API support
- Speech Synthesis API support (for spoken stimuli)

## 📱 Mobile Support

Fully responsive design optimized for:
- iOS Safari 13+
- Android Chrome 80+
- Touch-friendly controls
- Adaptive layouts

## 🔒 Privacy & Data

- **Fully Client-Side**: No data sent to servers
- **Local Storage**: All data stored in your browser
- **Export/Import**: Full control over your data
- **No Tracking**: No analytics or tracking scripts

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow TypeScript strict mode
2. Use Material-UI components when possible
3. Maintain responsive design principles
4. Write comprehensive unit tests
5. Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔬 Scientific Background

Dual N-Back training is based on research in cognitive psychology and neuroscience:

- **Jaeggi et al. (2008)**: "Improving fluid intelligence with training on working memory"
- **Klingberg (2010)**: "Training and plasticity of working memory"
- **Au et al. (2015)**: "Improving fluid intelligence with training on working memory: a meta-analysis"

## 🎓 Educational Use

This game is suitable for:
- Cognitive research studies
- Educational psychology courses
- Brain training programs
- Personal cognitive enhancement
- Rehabilitation settings (consult professionals)

## 💡 Tips for Success

1. **Start Low**: Begin with 2-back, master it before advancing
2. **Practice Regularly**: 15-20 minutes daily is more effective than longer sessions
3. **Stay Focused**: Minimize distractions during training
4. **Be Patient**: Cognitive improvements take time and consistent practice
5. **Track Progress**: Use the statistics to identify patterns and improvements

## 🆘 Support

Having issues? Check out:
- [GitHub Issues](https://github.com/dual-n-back/dual-n-back.github.io/issues)
- [Tutorial](https://dual-n-back.github.io/dual-n-back.github.io/#tutorial) in the app
- [N-Back Wikipedia](https://en.wikipedia.org/wiki/N-back) for background information

---

Built with ❤️ for cognitive enhancement and brain training.
