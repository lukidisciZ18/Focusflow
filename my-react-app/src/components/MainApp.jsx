import { useState, useRef, useEffect } from 'react';
import SettingsModal from './SettingsModal';

const TIMER_PRESETS = [
  { label: 'Quick Focus', minutes: 25, color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Deep Work', minutes: 90, color: 'bg-purple-500 hover:bg-purple-600' },
  { label: 'Marathon', minutes: 180, color: 'bg-orange-500 hover:bg-orange-600' },
  { label: 'Custom', minutes: 0, color: 'bg-gray-500 hover:bg-gray-600' },
];

const QUOTES = [
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" }
];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function saveTimerState({ timer, originalTime, isRunning, startTimestamp }) {
  localStorage.setItem('focusflow_timer_state', JSON.stringify({ timer, originalTime, isRunning, startTimestamp }));
}

function loadTimerState() {
  const state = localStorage.getItem('focusflow_timer_state');
  return state ? JSON.parse(state) : null;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.2;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 600);
  } catch (e) {
    // Ignore errors (e.g., autoplay restrictions)
  }
}

function showNotification() {
  if (window.Notification && Notification.permission === 'granted') {
    new Notification('FocusFlow Timer', {
      body: 'Your timer is complete! 🎉',
      icon: '/favicon.ico',
    });
  }
}

function getRandomQuoteIdx(excludeIdx) {
  let idx;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === excludeIdx && QUOTES.length > 1);
  return idx;
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

export default function MainApp({ onboardingAnswers }) {
  const [timer, setTimer] = useState(25 * 60);
  const [originalTime, setOriginalTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [startTimestamp, setStartTimestamp] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState({ hours: 0, minutes: 25 });
  const [quoteIdx, setQuoteIdx] = useState(() => getRandomQuoteIdx(-1));
  const [progress, setProgress] = useState(() => {
    // Load from localStorage or initialize
    const saved = localStorage.getItem('focusflow_progress');
    if (saved) return JSON.parse(saved);
    return {
      todayMinutes: 0,
      totalSessions: 0,
      streak: 0,
      lastSessionDate: null,
      totalFocusTime: 0,
      completedSessions: [],
      lastSync: null
    };
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('focusflow_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const intervalRef = useRef(null);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('focusflow_progress', JSON.stringify(progress));
  }, [progress]);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const state = loadTimerState();
    if (state) {
      let { timer, originalTime, isRunning, startTimestamp } = state;
      if (isRunning && startTimestamp) {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const remaining = timer - elapsed;
        if (remaining > 0) {
          setTimer(remaining);
          setOriginalTime(originalTime);
          setIsRunning(true);
          setStartTimestamp(Date.now() - elapsed * 1000);
          startTimer(remaining, originalTime, true);
        } else {
          setTimer(originalTime);
          setIsRunning(false);
          setStartTimestamp(null);
        }
      } else {
        setTimer(timer);
        setOriginalTime(originalTime);
        setIsRunning(false);
        setStartTimestamp(null);
      }
    }
    // Listen for tab focus to sync timer
    const onFocus = () => {
      const state = loadTimerState();
      if (state && state.isRunning && state.startTimestamp) {
        const elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000);
        const remaining = state.timer - elapsed;
        if (remaining > 0) {
          setTimer(remaining);
          setOriginalTime(state.originalTime);
          setIsRunning(true);
          setStartTimestamp(Date.now() - elapsed * 1000);
          startTimer(remaining, state.originalTime, true);
        } else {
          setTimer(state.originalTime);
          setIsRunning(false);
          setStartTimestamp(null);
        }
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    saveTimerState({ timer, originalTime, isRunning, startTimestamp });
  }, [timer, originalTime, isRunning, startTimestamp]);

  // Timer logic
  const startTimer = (forceTimer, forceOriginal, resume) => {
    if ((!isRunning && timer > 0) || resume) {
      // Request notification permission if needed
      if (window.Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      setIsRunning(true);
      const t = forceTimer !== undefined ? forceTimer : timer;
      const o = forceOriginal !== undefined ? forceOriginal : originalTime;
      const start = resume && startTimestamp ? startTimestamp : Date.now();
      setStartTimestamp(start);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setStartTimestamp(null);
            playBeep();
            showNotification();
            // Update progress summary
            const sessionMinutes = Math.round(originalTime / 60);
            setProgress(prevProgress => {
              const today = getTodayString();
              let streak = prevProgress.streak;
              if (prevProgress.lastSessionDate === today) {
                streak = prevProgress.streak;
              } else if (prevProgress.lastSessionDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
                streak = prevProgress.streak + 1;
              } else {
                streak = 1;
              }
              return {
                ...prevProgress,
                todayMinutes: prevProgress.lastSessionDate === today ? prevProgress.todayMinutes + sessionMinutes : sessionMinutes,
                totalSessions: prevProgress.totalSessions + 1,
                streak,
                lastSessionDate: today,
                totalFocusTime: prevProgress.totalFocusTime + sessionMinutes,
                completedSessions: [
                  ...prevProgress.completedSessions,
                  { date: new Date().toISOString(), duration: sessionMinutes }
                ]
              };
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setStartTimestamp(null);
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimer(originalTime);
    setStartTimestamp(null);
  };

  const setPreset = (minutes, isCustom) => {
    if (isCustom) {
      setShowCustomModal(true);
      return;
    }
    setTimer(minutes * 60);
    setOriginalTime(minutes * 60);
    setCustomMinutes(minutes);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setStartTimestamp(null);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const totalSeconds = customInput.hours * 3600 + customInput.minutes * 60;
    if (totalSeconds < 60 || totalSeconds > 12 * 3600) {
      alert('Please enter a duration between 1 minute and 12 hours.');
      return;
    }
    setTimer(totalSeconds);
    setOriginalTime(totalSeconds);
    setCustomMinutes(customInput.hours * 60 + customInput.minutes);
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setStartTimestamp(null);
    setShowCustomModal(false);
  };

  const handleNewQuote = () => {
    setQuoteIdx(idx => getRandomQuoteIdx(idx));
  };

  // Progress ring
  const progressRing = originalTime > 0 ? (1 - timer / originalTime) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progressRing * circumference;

  // Progress summary values
  const todayHours = Math.floor(progress.todayMinutes / 60);
  const todayMinutes = progress.todayMinutes % 60;

  return (
    <div className={
      `${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} min-h-screen transition-colors duration-300`
    }>
      {/* Custom Timer Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8" onSubmit={handleCustomSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Custom Timer Settings</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={customInput.hours}
                  onChange={e => setCustomInput({ ...customInput, hours: Math.max(0, Math.min(12, Number(e.target.value))) })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="59"
                  value={customInput.minutes}
                  onChange={e => setCustomInput({ ...customInput, minutes: Math.max(1, Math.min(59, Number(e.target.value))) })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setShowCustomModal(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl">Cancel</button>
              <button type="submit" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl">Set Timer</button>
            </div>
          </form>
        </div>
      )}
      {/* Settings Modal */}
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">FocusFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" onClick={() => setDarkMode(dm => !dm)}>
                <span role="img" aria-label="moon">🌙</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" onClick={() => setShowSettingsModal(true)}>
                <span role="img" aria-label="settings">⚙️</span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <span role="img" aria-label="sign out">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 transition-colors duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Focus Timer</h2>
                <div className="relative inline-block">
                  <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" stroke="#E5E7EB" strokeWidth="4" fill="transparent" />
                    <circle
                      className="progress-ring-circle"
                      cx="60" cy="60" r="54"
                      stroke="#10B981"
                      strokeWidth="4"
                      fill="transparent"
                      strokeLinecap="round"
                      style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-5xl font-mono text-gray-800 dark:text-gray-100 drop-shadow-lg select-none" id="timer-display">{formatTime(timer)}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 mt-6">
                  {TIMER_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      className={`px-4 py-3 ${preset.color} text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md focus:ring-2 focus:ring-green-400 focus:outline-none`}
                      onClick={() => setPreset(preset.minutes, preset.label === 'Custom')}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow focus:ring-2 focus:ring-green-400 focus:outline-none"
                    onClick={() => startTimer()}
                    disabled={isRunning || timer === 0}
                  >
                    Start
                  </button>
                  <button
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    onClick={pauseTimer}
                    disabled={!isRunning}
                  >
                    Pause
                  </button>
                  <button
                    className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors duration-200 shadow focus:ring-2 focus:ring-red-400 focus:outline-none"
                    onClick={stopTimer}
                    disabled={timer === originalTime && !isRunning}
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Quote */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-300 quote-card" id="quote-card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Today's Wisdom</h3>
              <div className="text-gray-700 dark:text-gray-300 italic mb-4" id="quote-text">"{QUOTES[quoteIdx].text}"</div>
              <div className="text-sm text-gray-600 dark:text-gray-400" id="quote-author">— {QUOTES[quoteIdx].author}</div>
              <button onClick={handleNewQuote} className="mt-4 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200">New Quote</button>
            </div>
            {/* Progress Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-300" id="progress-card">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Today's Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Focus Time</span>
                  <span className="font-semibold">{todayHours}h {todayMinutes}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Sessions</span>
                  <span className="font-semibold">{progress.totalSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Streak</span>
                  <span className="font-semibold">{progress.streak} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 