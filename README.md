# FocusFlow - Personal Focus Coach

A modern, responsive web application that helps users build sustainable focus habits through personalized coaching, smart reminders, and culturally diverse wisdom.

## 🎯 Features

### Core Functionality
- **Multi-step Onboarding**: Personalized setup with focus challenge assessment
- **Adaptive Interface Modes**: Zen (Stoic), Achievement (Gamified), and Hybrid modes
- **Focus Timer System**: Multiple session types (Quick Focus, Deep Work, Marathon)
- **Cultural Wisdom**: Diverse quote database from philosophers, scientists, and historical figures
- **Progress Tracking**: Daily streaks, focus time, and session statistics
- **Lock Screen Widgets**: Customizable timer displays for device lock screens
- **Smart Scheduling**: Custom wake-up/bedtime settings with gentle reminders

### Interface Modes

#### Zen Mode (Stoic)
- Clean, minimal design with muted colors
- Daily focus goal display
- Random inspirational quotes from philosophers
- Simple progress indicators
- Calm, understated interface

#### Achievement Mode (Gamified)
- Vibrant colors and engaging animations
- Point system and achievement badges
- Streak counters with fire/lightning animations
- Progress charts and statistics
- Celebration animations for milestones

#### Hybrid Mode
- Combines elements from both modes
- Adaptive UI that changes based on time of day
- Balanced design with sophisticated animations

### Quote System
- **Categories**: Ancient Philosophers, Modern Thinkers, Scientists, Artists, Historical Leaders, Pioneering Women
- **Safe Sources**: All quotes are from public domain and historical figures
- **Cultural Diversity**: Quotes from various cultures and time periods
- **Random Generation**: New quotes daily with category filtering

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No Node.js or build tools required - runs directly in the browser

### Installation
1. Clone or download the repository
2. Open `index.html` in your web browser
3. Complete the onboarding process
4. Start your first focus session!

### Local Development
For development with a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if available)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📱 PWA Features

FocusFlow is a Progressive Web App (PWA) with:
- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen on mobile devices
- **Push Notifications**: Session reminders and daily motivation
- **Background Sync**: Data synchronization when online
- **App-like Experience**: Full-screen mode and native feel

## 🎨 Customization

### User Preferences
- Focus challenge type
- Energy pattern (Early Bird, Night Owl, Flexible)
- Primary goal (Career, Creative, Learning, Health, Entrepreneurship)
- Motivation style (Philosophical, Success Stories, Achievement, Gentle)
- Session length preferences
- Lock screen widget preferences

### Lock Screen Widgets
Three widget styles available:
- **Zen Minimal**: Clean, understated design
- **Achievement Vibrant**: Dynamic, engaging elements
- **Hybrid Adaptive**: Balanced sophistication

## 📊 Data Structure

### User Preferences
```javascript
{
  focusChallenge: "procrastination",
  energyPattern: "early_bird",
  primaryGoal: "career_growth",
  motivationStyle: "philosophical_wisdom",
  sessionLength: "90_min",
  wakeUpTime: "06:00",
  bedTime: "23:00",
  preferredMode: "zen",
  lockScreenWidget: true,
  widgetStyle: "zen_minimal"
}
```

### Progress Tracking
```javascript
{
  todayMinutes: 120,
  totalSessions: 5,
  streak: 7,
  lastSessionDate: "2025-01-15"
}
```

## 🔧 Technical Details

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: localStorage for offline functionality
- **PWA**: Service Worker for caching and offline support

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- Fast loading times (< 2 seconds)
- Smooth animations (60fps)
- Offline functionality
- Minimal bundle size

## 📈 Success Metrics

The app tracks:
- Session completion rate
- Daily active usage
- Focus time improvement over time
- Mode preference usage
- Quote engagement (favorites, shares)

## 🎯 Usage Guide

### First Time Setup
1. **Welcome Screen**: Read the app introduction
2. **Onboarding**: Answer 6 questions to personalize your experience
3. **Widget Preview**: Choose your lock screen widget style
4. **Dashboard**: Start your first focus session

### Daily Usage
1. **Check Dashboard**: Review today's progress and current quote
2. **Choose Session**: Select Quick Focus (25m), Deep Work (90m), or Marathon (3h)
3. **Start Timer**: Begin your focus session
4. **Track Progress**: Monitor your daily focus time and streaks
5. **Get Inspired**: Read daily wisdom quotes

### Settings & Customization
- **Mode Toggle**: Switch between Zen, Achievement, and Hybrid modes
- **Settings Panel**: Configure notifications, widget preferences, and more
- **Progress Review**: View detailed statistics and achievements

## 🤝 Contributing

### Development Guidelines
- Follow existing code style and structure
- Test on multiple browsers and devices
- Ensure accessibility compliance (WCAG guidelines)
- Add helpful comments for complex logic
- Update documentation for new features

### Feature Requests
- Submit detailed feature descriptions
- Include use cases and user stories
- Consider impact on existing functionality
- Propose implementation approach

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Quotes**: All quotes are from public domain sources and historical figures
- **Icons**: Lucide React icon library
- **Styling**: Tailwind CSS framework
- **PWA**: Service Worker API and Web App Manifest

## 📞 Support

For questions, issues, or feature requests:
- Check the documentation above
- Review browser console for errors
- Test in different browsers
- Clear browser cache if needed

---

**FocusFlow** - Building sustainable focus habits, one session at a time. 🎯 