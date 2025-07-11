// FocusFlow - Main Application Logic

// Immediate test to verify script is loading
console.log('FocusFlow script starting...');

// Test DOM elements exist
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    
    // Test if key elements exist
    const loadingScreen = document.getElementById('loading-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const onboarding = document.getElementById('onboarding');
    const mainApp = document.getElementById('main-app');
    
    console.log('Elements found:', {
        loadingScreen: !!loadingScreen,
        welcomeScreen: !!welcomeScreen,
        onboarding: !!onboarding,
        mainApp: !!mainApp
    });
    
    // Show loading screen immediately
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        console.log('Loading screen should be visible');
    }
    
    // DEBUG: Force onboarding to show for troubleshooting
    localStorage.removeItem('focusflow_onboarding_completed');
    localStorage.removeItem('focusflow_user_preferences');
    console.log('FocusFlow script loaded, onboarding reset.');
    
    // Add a simple test message to the page
    const testDiv = document.createElement('div');
    testDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;';
    testDiv.textContent = 'Script loaded!';
    document.body.appendChild(testDiv);
    
    new FocusFlow();
});

class FocusFlow {
    constructor() {
        console.log('FocusFlow constructor called');
        this.currentStep = 0;
        this.userPreferences = {};
        this.timer = null;
        this.timerInterval = null;
        this.currentTime = 0;
        this.isRunning = false;
        this.currentMode = 'zen';
        this.quotes = this.initializeQuotes();
        this.progress = this.loadProgress();
        
        this.initializeApp();
    }

    initializeApp() {
        console.log('initializeApp called');
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Check if user has completed onboarding
        const hasCompletedOnboarding = localStorage.getItem('focusflow_onboarding_completed');
        console.log('hasCompletedOnboarding:', hasCompletedOnboarding);
        
        if (hasCompletedOnboarding) {
            this.showMainApp();
        } else {
            this.showWelcomeScreen();
        }

        this.bindEvents();
        this.loadUserPreferences();
        this.updateUI();
    }

    bindEvents() {
        console.log('bindEvents called');
        // Welcome screen
        const startOnboardingBtn = document.getElementById('start-onboarding');
        console.log('start-onboarding button found:', !!startOnboardingBtn);
        
        startOnboardingBtn?.addEventListener('click', () => {
            console.log('Start onboarding clicked');
            this.startOnboarding();
        });

        // Onboarding navigation
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        console.log('Navigation buttons found:', { nextBtn: !!nextBtn, prevBtn: !!prevBtn });
        
        nextBtn?.addEventListener('click', () => {
            console.log('Next button clicked');
            this.nextStep();
        });
        prevBtn?.addEventListener('click', () => {
            console.log('Previous button clicked');
            this.previousStep();
        });

        // Timer controls
        document.getElementById('start-timer')?.addEventListener('click', () => {
            this.startTimer();
        });

        document.getElementById('pause-timer')?.addEventListener('click', () => {
            this.pauseTimer();
        });

        document.getElementById('stop-timer')?.addEventListener('click', () => {
            this.stopTimer();
        });

        // Timer presets
        document.getElementById('quick-focus')?.addEventListener('click', () => {
            this.setTimer(25 * 60);
        });

        document.getElementById('deep-work')?.addEventListener('click', () => {
            this.setTimer(90 * 60);
        });

        document.getElementById('marathon')?.addEventListener('click', () => {
            this.setTimer(3 * 60 * 60);
        });

        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.hideSettings();
        });

        // Mode toggle
        document.getElementById('mode-toggle')?.addEventListener('click', () => {
            this.toggleMode();
        });

        // New quote
        document.getElementById('new-quote')?.addEventListener('click', () => {
            this.showRandomQuote();
        });

        // Settings form
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setMode(e.target.value);
            });
        });

        document.getElementById('lock-screen-widget')?.addEventListener('change', (e) => {
            this.toggleLockScreenWidget(e.target.checked);
        });
    }

    showWelcomeScreen() {
        console.log('Showing welcome screen');
        const loadingScreen = document.getElementById('loading-screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        
        console.log('Elements for welcome screen:', {
            loadingScreen: !!loadingScreen,
            welcomeScreen: !!welcomeScreen
        });
        
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        
        console.log('Welcome screen should be visible now');
    }

    startOnboarding() {
        console.log('Starting onboarding');
        const welcomeScreen = document.getElementById('welcome-screen');
        const onboarding = document.getElementById('onboarding');
        
        console.log('Elements for onboarding:', {
            welcomeScreen: !!welcomeScreen,
            onboarding: !!onboarding
        });
        
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (onboarding) onboarding.classList.remove('hidden');
        this.showQuestion(0);
    }

    showQuestion(step) {
        console.log('Showing question step', step);
        const questions = [
            {
                title: "What's your biggest focus challenge?",
                type: "radio",
                options: [
                    { value: "overwhelmed", label: "I get easily overwhelmed and need gentle guidance" },
                    { value: "motivation", label: "I struggle with motivation and need extra encouragement" },
                    { value: "flexibility", label: "I have good days and bad days - I need flexibility" },
                    { value: "sensitivity", label: "I'm highly sensitive to pressure and criticism" },
                    { value: "structure", label: "I need structure but also understanding when I fall short" },
                    { value: "procrastination", label: "I procrastinate and need help staying on track" },
                    { value: "distraction", label: "I get distracted easily and lose focus" },
                    { value: "optimization", label: "I'm generally focused but want to optimize my productivity" }
                ]
            },
            {
                title: "What's your natural energy pattern?",
                type: "radio",
                options: [
                    { value: "early_bird", label: "Early Bird" },
                    { value: "night_owl", label: "Night Owl" },
                    { value: "flexible", label: "Flexible" }
                ]
            },
            {
                title: "What's your primary goal?",
                type: "radio",
                options: [
                    { value: "career_growth", label: "Career Growth" },
                    { value: "creative_projects", label: "Creative Projects" },
                    { value: "learning", label: "Learning" },
                    { value: "health", label: "Health" },
                    { value: "entrepreneurship", label: "Entrepreneurship" }
                ]
            },
            {
                title: "Preferred motivation style?",
                type: "radio",
                options: [
                    { value: "philosophical_wisdom", label: "Philosophical Wisdom" },
                    { value: "success_stories", label: "Success Stories" },
                    { value: "achievement_tracking", label: "Achievement Tracking" },
                    { value: "gentle_reminders", label: "Gentle Reminders" }
                ]
            },
            {
                title: "Ideal focus session length?",
                type: "radio",
                options: [
                    { value: "25_min", label: "25 min Pomodoro" },
                    { value: "90_min", label: "90 min Deep Work" },
                    { value: "3_plus_hour", label: "3+ hour Marathon" },
                    { value: "flexible", label: "Flexible" }
                ]
            },
            {
                title: "Would you like to display your focus timer on your device's lock screen?",
                type: "widget_preview",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ]
            }
        ];

        const question = questions[step];
        const container = document.getElementById('question-container');
        
        console.log('Question container found:', !!container);
        
        let html = `
            <div class="text-center fade-in">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">${question.title}</h2>
        `;

        if (question.type === 'widget_preview') {
            html += this.generateWidgetPreview(step);
        } else {
            html += '<div class="space-y-4">';
            question.options.forEach((option, index) => {
                html += `
                    <label class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                        <input type="radio" name="question_${step}" value="${option.value}" class="mr-3" ${index === 0 ? 'checked' : ''}>
                        <span class="text-gray-700">${option.label}</span>
                    </label>
                `;
            });
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;

        // Update progress
        const progress = ((step + 1) / questions.length) * 100;
        document.getElementById('current-step').textContent = step + 1;
        document.getElementById('progress-percentage').textContent = Math.round(progress);
        document.getElementById('progress-bar').style.width = `${progress}%`;

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.style.display = step === 0 ? 'none' : 'block';
        nextBtn.textContent = step === questions.length - 1 ? 'Complete' : 'Next →';

        // Always re-attach navigation event listeners
        nextBtn.onclick = () => { console.log('Next button clicked'); this.nextStep(); };
        prevBtn.onclick = () => { console.log('Previous button clicked'); this.previousStep(); };
    }

    generateWidgetPreview(step = 5) {
        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="widget-preview-card widget-zen p-4 rounded-lg border">
                        <div class="text-center">
                            <div class="text-2xl font-mono text-gray-700">25:00</div>
                            <div class="text-sm text-gray-600">Focus Session</div>
                            <div class="text-xs text-gray-500 mt-1">Zen Mode</div>
                        </div>
                    </div>
                    <div class="widget-preview-card widget-achievement p-4 rounded-lg border">
                        <div class="text-center">
                            <div class="text-2xl font-mono text-white">25:00</div>
                            <div class="text-sm text-white opacity-90">Focus Session</div>
                            <div class="text-xs text-white opacity-75 mt-1">Achievement Mode</div>
                        </div>
                    </div>
                    <div class="widget-preview-card widget-hybrid p-4 rounded-lg border">
                        <div class="text-center">
                            <div class="text-2xl font-mono text-white">25:00</div>
                            <div class="text-sm text-white opacity-90">Focus Session</div>
                            <div class="text-xs text-white opacity-75 mt-1">Hybrid Mode</div>
                        </div>
                    </div>
                </div>
                <div class="space-y-3">
                    <label class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                        <input type="radio" name="question_${step}" value="yes" class="mr-3" checked>
                        <span class="text-gray-700">Yes, show timer on lock screen</span>
                    </label>
                    <label class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200">
                        <input type="radio" name="question_${step}" value="no" class="mr-3">
                        <span class="text-gray-700">No, keep it simple</span>
                    </label>
                </div>
            </div>
        `;
    }

    nextStep() {
        console.log('Next step clicked, currentStep:', this.currentStep);
        const radios = document.querySelectorAll(`input[name="question_${this.currentStep}"]`);
        console.log('Radio inputs for this step:', radios);
        const currentQuestion = document.querySelector(`input[name="question_${this.currentStep}"]:checked`);
        console.log('Current question found:', !!currentQuestion);
        
        if (!currentQuestion) {
            alert('Please select an option to continue.');
            return;
        }

        // Save answer
        const questionKeys = ['focusChallenge', 'energyPattern', 'primaryGoal', 'motivationStyle', 'sessionLength', 'lockScreenWidget'];
        this.userPreferences[questionKeys[this.currentStep]] = currentQuestion.value;

        if (this.currentStep < 5) {
            this.currentStep++;
            this.showQuestion(this.currentStep);
        } else {
            this.completeOnboarding();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showQuestion(this.currentStep);
        }
    }

    completeOnboarding() {
        console.log('Completing onboarding');
        // Save user preferences
        localStorage.setItem('focusflow_user_preferences', JSON.stringify(this.userPreferences));
        localStorage.setItem('focusflow_onboarding_completed', 'true');
        
        // Set default mode based on preferences
        const mode = this.userPreferences.motivationStyle === 'achievement_tracking' ? 'achievement' : 'zen';
        this.setMode(mode);
        
        // Show main app
        document.getElementById('onboarding').classList.add('hidden');
        this.showMainApp();
    }

    showMainApp() {
        console.log('Showing main app');
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        this.updateUI();
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('focusflow_user_preferences');
        if (saved) {
            this.userPreferences = JSON.parse(saved);
        }
        
        const savedMode = localStorage.getItem('focusflow_mode');
        if (savedMode) {
            this.setMode(savedMode);
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        localStorage.setItem('focusflow_mode', mode);
        
        // Remove all mode classes
        document.body.classList.remove('zen-mode', 'achievement-mode', 'hybrid-mode');
        document.body.classList.add(`${mode}-mode`);
        
        // Zen mode specific enhancements
        if (mode === 'zen') {
            this.enhanceZenMode();
        }
        
        this.updateUI();
    }

    enhanceZenMode() {
        // Add smooth transitions to all elements
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            if (!el.style.transition) {
                el.style.transition = 'all 0.3s ease';
            }
        });

        // Enhance timer display for Zen mode
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.fontFamily = "'JetBrains Mono', 'Fira Code', 'Monaco', monospace";
            timerDisplay.style.fontWeight = '300';
        }

        // Add subtle breathing animation to quote card
        const quoteCard = document.getElementById('quote-card');
        if (quoteCard) {
            quoteCard.style.animation = 'zenPulse 4s ease-in-out infinite';
        }

        // Enhance progress display
        const progressItems = document.querySelectorAll('#progress-card .space-y-4 > div');
        progressItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(4px)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
            });
        });
    }

    toggleMode() {
        const modes = ['zen', 'achievement', 'hybrid'];
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setMode(modes[nextIndex]);
    }

    setTimer(seconds) {
        this.currentTime = seconds;
        this.updateTimerDisplay();
        this.showTimerControls();
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.timerInterval = setInterval(() => {
                this.currentTime--;
                this.updateTimerDisplay();
                
                if (this.currentTime <= 0) {
                    this.completeSession();
                }
            }, 1000);
            
            this.showTimerControls();
            this.updateTimerContainer();
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timerInterval);
            this.showTimerControls();
        }
    }

    stopTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.currentTime = 0;
        this.updateTimerDisplay();
        this.showTimerControls();
        this.updateTimerContainer();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-display').textContent = display;
    }

    showTimerControls() {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const stopBtn = document.getElementById('stop-timer');
        
        if (this.isRunning) {
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
        } else if (this.currentTime > 0) {
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
        } else {
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
            stopBtn.classList.add('hidden');
        }
    }

    updateTimerContainer() {
        const container = document.getElementById('timer-container');
        if (this.isRunning) {
            container.classList.add('timer-active');
            
            // Zen mode specific timer enhancements
            if (this.currentMode === 'zen') {
                container.style.animation = 'zenPulse 2s ease-in-out infinite';
            }
        } else {
            container.classList.remove('timer-active');
            
            // Remove animation when timer stops
            if (this.currentMode === 'zen') {
                container.style.animation = 'none';
            }
        }
    }

    completeSession() {
        this.stopTimer();
        
        // Update progress
        const sessionMinutes = Math.floor((this.timer || 0) / 60);
        this.progress.todayMinutes += sessionMinutes;
        this.progress.totalSessions++;
        this.progress.streak = this.calculateStreak();
        this.saveProgress();
        
        // Show completion message
        this.showCompletionMessage();
        
        // Update UI
        this.updateProgressDisplay();
    }

    showCompletionMessage() {
        const messages = [
            "Great job! You've completed your focus session.",
            "Excellent work! Your focus is building momentum.",
            "Outstanding! You're developing strong focus habits.",
            "Fantastic! Every session makes you stronger.",
            "Brilliant! You're mastering the art of focus."
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Create notification with Zen mode styling
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 fade-in';
        
        // Apply Zen mode styling if in Zen mode
        if (this.currentMode === 'zen') {
            notification.style.background = 'linear-gradient(135deg, #F8FAFC, #F1F5F9)';
            notification.style.color = '#374151';
            notification.style.border = '1px solid #E5E7EB';
            notification.style.fontWeight = '500';
        } else {
            notification.className += ' bg-green-500 text-white';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    initializeQuotes() {
        return [
            {
                text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
                author: "Marcus Aurelius",
                category: "ancient_philosopher",
                culture: "roman"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt",
                category: "pioneering_women",
                culture: "american"
            },
            {
                text: "Nothing in life is to be feared, it is only to be understood.",
                author: "Marie Curie",
                category: "scientist",
                culture: "polish-french"
            },
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                category: "modern_thinker",
                culture: "american"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill",
                category: "historical_leader",
                culture: "british"
            },
            {
                text: "The journey of a thousand miles begins with one step.",
                author: "Lao Tzu",
                category: "ancient_philosopher",
                culture: "chinese"
            },
            {
                text: "I have not failed. I've just found 10,000 ways that won't work.",
                author: "Thomas Edison",
                category: "scientist",
                culture: "american"
            },
            {
                text: "The only limit to our realization of tomorrow is our doubts of today.",
                author: "Franklin D. Roosevelt",
                category: "historical_leader",
                culture: "american"
            },
            {
                text: "What you get by achieving your goals is not as important as what you become by achieving your goals.",
                author: "Zig Ziglar",
                category: "modern_thinker",
                culture: "american"
            },
            {
                text: "The mind is everything. What you think you become.",
                author: "Buddha",
                category: "ancient_philosopher",
                culture: "indian"
            }
        ];
    }

    showRandomQuote() {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const quoteText = document.getElementById('quote-text');
        const quoteAuthor = document.getElementById('quote-author');
        
        // Smooth transition for quote change
        if (quoteText && quoteAuthor) {
            quoteText.style.opacity = '0';
            quoteText.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                quoteText.textContent = `"${quote.text}"`;
                quoteAuthor.textContent = `— ${quote.author}`;
                
                quoteText.style.opacity = '1';
                quoteText.style.transform = 'translateY(0)';
                quoteAuthor.style.opacity = '1';
                quoteAuthor.style.transform = 'translateY(0)';
            }, 200);
        }
        
        // Add animation
        const quoteCard = document.getElementById('quote-card');
        if (quoteCard) {
            quoteCard.classList.add('fade-in');
            setTimeout(() => quoteCard.classList.remove('fade-in'), 600);
        }
    }

    loadProgress() {
        const saved = localStorage.getItem('focusflow_progress');
        return saved ? JSON.parse(saved) : {
            todayMinutes: 0,
            totalSessions: 0,
            streak: 0,
            lastSessionDate: null
        };
    }

    saveProgress() {
        localStorage.setItem('focusflow_progress', JSON.stringify(this.progress));
    }

    calculateStreak() {
        const today = new Date().toDateString();
        const lastSession = this.progress.lastSessionDate;
        
        if (lastSession === today) {
            return this.progress.streak;
        } else if (lastSession === new Date(Date.now() - 86400000).toDateString()) {
            return this.progress.streak + 1;
        } else {
            return 1;
        }
    }

    updateProgressDisplay() {
        const hours = Math.floor(this.progress.todayMinutes / 60);
        const minutes = this.progress.todayMinutes % 60;
        
        document.getElementById('today-focus-time').textContent = `${hours}h ${minutes}m`;
        document.getElementById('today-sessions').textContent = this.progress.totalSessions;
        document.getElementById('current-streak').textContent = `${this.progress.streak} days`;
    }

    showSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    hideSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    toggleLockScreenWidget(enabled) {
        const preview = document.getElementById('widget-preview');
        if (enabled) {
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    }

    updateUI() {
        this.updateProgressDisplay();
        this.showRandomQuote();
        
        // Update mode-specific styling
        const app = document.getElementById('app');
        app.className = `min-h-screen ${this.currentMode}-mode`;
    }
}

// Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 