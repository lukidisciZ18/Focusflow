// FocusFlow - Main Application Logic

// Authentication Functions
function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function hideAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

// Enhanced Authentication System with Device Storage
function authenticateUser(email, password) {
    // Create a unique user ID based on email and device
    const deviceId = getDeviceId();
    const userId = 'user_' + btoa(email + deviceId).replace(/[^a-zA-Z0-9]/g, '');
    
    // Save user account to device storage
    const userAccount = {
        id: userId,
        email: email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        preferences: {},
        progress: {
            todayMinutes: 0,
            totalSessions: 0,
            streak: 0,
            lastSessionDate: null,
            totalFocusTime: 0,
            completedSessions: []
        }
    };
    
    // Save to localStorage with user-specific keys
    localStorage.setItem('focusflow_user_id', userId);
    localStorage.setItem('focusflow_user_email', email);
    localStorage.setItem(`focusflow_user_${userId}`, JSON.stringify(userAccount));
    
    console.log('User account created:', userAccount);
    return true;
}

function getDeviceId() {
    // Generate a device-specific ID
    let deviceId = localStorage.getItem('focusflow_device_id');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('focusflow_device_id', deviceId);
    }
    return deviceId;
}

function getUserAccount() {
    const userId = localStorage.getItem('focusflow_user_id');
    if (!userId) return null;
    
    const userData = localStorage.getItem(`focusflow_user_${userId}`);
    return userData ? JSON.parse(userData) : null;
}

function saveUserProgress(progress) {
    const userAccount = getUserAccount();
    if (!userAccount) return;
    
    userAccount.progress = { ...userAccount.progress, ...progress };
    userAccount.lastLogin = new Date().toISOString();
    
    localStorage.setItem(`focusflow_user_${userAccount.id}`, JSON.stringify(userAccount));
    console.log('User progress saved:', userAccount.progress);
}

function saveUserPreferences(preferences) {
    const userAccount = getUserAccount();
    if (!userAccount) return;
    
    userAccount.preferences = { ...userAccount.preferences, ...preferences };
    userAccount.lastLogin = new Date().toISOString();
    
    localStorage.setItem(`focusflow_user_${userAccount.id}`, JSON.stringify(userAccount));
    console.log('User preferences saved:', userAccount.preferences);
}

function signOut() {
    const userId = localStorage.getItem('focusflow_user_id');
    if (userId) {
        // Remove user-specific data
        localStorage.removeItem(`focusflow_user_${userId}`);
    }
    
    // Clear all focusflow data
    const keysToRemove = [
        'focusflow_user_id',
        'focusflow_user_email',
        'focusflow_onboarding_completed',
        'focusflow_user_preferences',
        'focusflow_progress',
        'focusflow_mode'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('User signed out, all data cleared');
    window.location.reload();
}

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
    
    // Reset onboarding state to ensure proper flow
    localStorage.removeItem('focusflow_onboarding_completed');
    localStorage.removeItem('focusflow_user_preferences');
    console.log('FocusFlow script loaded, onboarding reset.');
    
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

        // Always show welcome screen for new users
        // Reset onboarding state to ensure proper flow
        localStorage.removeItem('focusflow_onboarding_completed');
        localStorage.removeItem('focusflow_user_preferences');
        
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('focusflow_user_id');
        console.log('isAuthenticated:', isAuthenticated);
        
        if (isAuthenticated) {
            // User is logged in, check if they've completed onboarding
            const hasCompletedOnboarding = localStorage.getItem('focusflow_onboarding_completed');
            if (hasCompletedOnboarding) {
                this.showMainApp();
            } else {
                this.showWelcomeScreen();
            }
        } else {
            // User is not authenticated, show welcome screen
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

        // Sign in button
        const signInBtn = document.getElementById('sign-in-btn');
        signInBtn?.addEventListener('click', () => {
            console.log('Sign in clicked');
            showAuthModal();
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

        // Sign out button
        document.getElementById('sign-out-btn')?.addEventListener('click', () => {
            signOut();
        });

        // Only use the settings button to open the settings modal
        const modeToggleBtn = document.getElementById('mode-toggle');
        if (modeToggleBtn) {
            modeToggleBtn.onclick = null;
        }
        // Add dark mode toggle to the moon icon
        if (modeToggleBtn) {
            modeToggleBtn.onclick = () => {
                document.body.classList.toggle('dark-theme');
                this.renderLockScreenWidgetPreview();
                this.renderUserSummary();
                this.updateUI();
            };
        }

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

        // Authentication event listeners
        const closeAuth = document.getElementById('close-auth');
        if (closeAuth) closeAuth.onclick = hideAuthModal;

        const guestBtn = document.getElementById('guest-mode');
        if (guestBtn) guestBtn.onclick = () => {
            localStorage.setItem('focusflow_guest', 'true');
            hideAuthModal();
            this.showWelcomeScreen();
        };

        const emailForm = document.getElementById('email-auth-form');
        if (emailForm) emailForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            
            if (authenticateUser(email, password)) {
                hideAuthModal();
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
                successMessage.innerHTML = `
                    <div class="flex items-center">
                        <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
                        <span>Account created! Your progress will be saved to your device.</span>
                    </div>
                `;
                document.body.appendChild(successMessage);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => successMessage.remove(), 300);
                }, 3000);
                
                this.showWelcomeScreen();
            } else {
                alert('Authentication failed. Please try again.');
            }
        };

        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) googleBtn.onclick = () => {
            // Simulate Google sign-in
            const email = 'user@gmail.com';
            if (authenticateUser(email, 'google')) {
                hideAuthModal();
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
                successMessage.innerHTML = `
                    <div class="flex items-center">
                        <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
                        <span>Account created! Your progress will be saved to your device.</span>
                    </div>
                `;
                document.body.appendChild(successMessage);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => successMessage.remove(), 300);
                }, 3000);
                
                this.showWelcomeScreen();
            }
        };

        const appleBtn = document.getElementById('apple-signin');
        if (appleBtn) appleBtn.onclick = () => {
            // Simulate Apple sign-in
            const email = 'user@icloud.com';
            if (authenticateUser(email, 'apple')) {
                hideAuthModal();
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
                successMessage.innerHTML = `
                    <div class="flex items-center">
                        <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
                        <span>Account created! Your progress will be saved to your device.</span>
                    </div>
                `;
                document.body.appendChild(successMessage);
                
                // Remove message after 3 seconds
                setTimeout(() => {
                    successMessage.style.opacity = '0';
                    setTimeout(() => successMessage.remove(), 300);
                }, 3000);
                
                this.showWelcomeScreen();
            }
        };
    }

    showWelcomeScreen() {
        console.log('Showing welcome screen');
        const loadingScreen = document.getElementById('loading-screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        
        console.log('Elements for welcome screen:', {
            loadingScreen: !!loadingScreen,
            welcomeScreen: !!welcomeScreen
        });
        
        // Enhanced smooth transition for loading screen
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.6s ease-out';
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 600);
        }
        
        // Enhanced smooth transition for welcome screen
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'translateY(20px) scale(0.95)';
            welcomeScreen.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Trigger the animation
            setTimeout(() => {
                welcomeScreen.style.opacity = '1';
                welcomeScreen.style.transform = 'translateY(0) scale(1)';
            }, 100);
        }
        
        console.log('Welcome screen should be visible now with smooth animation');
    }

    startOnboarding() {
        console.log('Starting onboarding');
        const welcomeScreen = document.getElementById('welcome-screen');
        const onboarding = document.getElementById('onboarding');
        
        console.log('Elements for onboarding:', {
            welcomeScreen: !!welcomeScreen,
            onboarding: !!onboarding
        });
        
        // Smooth transition from welcome screen to onboarding
        if (welcomeScreen) {
            welcomeScreen.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'translateY(-20px) scale(0.95)';
            setTimeout(() => {
                welcomeScreen.classList.add('hidden');
            }, 400);
        }
        
        // Show onboarding with smooth entrance
        if (onboarding) {
            onboarding.classList.remove('hidden');
            onboarding.style.opacity = '0';
            onboarding.style.transform = 'translateX(50px)';
            onboarding.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                onboarding.style.opacity = '1';
                onboarding.style.transform = 'translateX(0)';
                this.showQuestion(0);
            }, 100);
        }
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
            },
            {
                title: "Which lock screen widget style do you prefer?",
                type: "widget_style",
                options: [
                    { value: "zen_minimal", label: "Zen Minimal" },
                    { value: "achievement_vibrant", label: "Achievement Vibrant" },
                    { value: "hybrid_adaptive", label: "Hybrid Adaptive" }
                ]
            }
        ];

        const question = questions[step];
        const container = document.getElementById('question-container');
        
        console.log('Question container found:', !!container);
        
        // Enhanced smooth transition with slide effect
        container.style.transform = 'translateX(20px)';
        container.style.opacity = '0';
        container.style.transition = 'all 0.4s ease-in-out';
        
        setTimeout(() => {
            let html = `
                <div class="text-center" aria-live="polite">
                    <h2 class="text-2xl font-bold text-gray-800 mb-6 transform transition-all duration-500" tabindex="0">${question.title}</h2>
            `;

            if (question.type === 'widget_preview') {
                html += this.generateWidgetPreview(step);
            } else if (question.type === 'widget_style') {
                html += this.generateWidgetStyleSelection(step);
            } else {
                html += '<div class="space-y-4" role="radiogroup" aria-label="' + question.title + '">';
                question.options.forEach((option, index) => {
                    html += `
                        <label class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-300 transform hover:scale-105" tabindex="0">
                            <input type="radio" name="question_${step}" value="${option.value}" class="mr-3" ${index === 0 ? 'checked' : ''} aria-checked="${index === 0 ? 'true' : 'false'}" aria-label="${option.label}">
                            <span class="text-gray-700">${option.label}</span>
                        </label>
                    `;
                });
                html += '</div>';
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Smooth fade in with slide effect
            setTimeout(() => { 
                container.style.transform = 'translateX(0)';
                container.style.opacity = '1'; 
            }, 50);
            
            // Focus management: focus first radio or question title
            const firstRadio = container.querySelector('input[type="radio"]');
            if (firstRadio) firstRadio.focus();
            else {
                const title = container.querySelector('h2');
                if (title) title.focus();
            }
            
            // Enhanced keyboard navigation for radio groups
            const radios = container.querySelectorAll('input[type="radio"]');
            radios.forEach((radio, idx) => {
                radio.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const next = radios[(idx + 1) % radios.length];
                        next.focus();
                        next.checked = true;
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prev = radios[(idx - 1 + radios.length) % radios.length];
                        prev.focus();
                        prev.checked = true;
                    }
                });
            });
            
            // Update progress with smooth animation
            const progress = ((step + 1) / questions.length) * 100;
            document.getElementById('current-step').textContent = step + 1;
            document.getElementById('progress-percentage').textContent = Math.round(progress);
            
            const progressBar = document.getElementById('progress-bar');
            progressBar.style.transition = 'width 0.5s ease-in-out';
            progressBar.style.width = `${progress}%`;
            
            // Update navigation buttons with smooth transitions
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            
            prevBtn.style.transition = 'all 0.3s ease-in-out';
            if (step === 0) {
                prevBtn.style.opacity = '0';
                prevBtn.style.visibility = 'hidden';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.visibility = 'visible';
            }
            
            nextBtn.textContent = step === questions.length - 1 ? 'Complete' : 'Next →';
            nextBtn.style.transition = 'all 0.3s ease-in-out';
            
            // Always re-attach navigation event listeners
            nextBtn.onclick = () => { 
                console.log('Next button clicked'); 
                this.nextStep(); 
            };
            prevBtn.onclick = () => { 
                console.log('Previous button clicked'); 
                this.previousStep(); 
            };
        }, 200);
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

    generateWidgetStyleSelection(step) {
        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <label class="widget-preview-card widget-zen p-4 rounded-lg border flex flex-col items-center cursor-pointer">
                        <input type="radio" name="question_${step}" value="zen_minimal" class="mb-2" checked>
                        <div class="text-2xl font-mono text-gray-700">25:00</div>
                        <div class="text-sm text-gray-600">Focus Session</div>
                        <div class="text-xs text-gray-500 mt-1">Zen Minimal</div>
                    </label>
                    <label class="widget-preview-card widget-achievement p-4 rounded-lg border flex flex-col items-center cursor-pointer">
                        <input type="radio" name="question_${step}" value="achievement_vibrant" class="mb-2">
                        <div class="text-2xl font-mono text-green-600">25:00</div>
                        <div class="text-sm text-green-700">Focus Session</div>
                        <div class="text-xs text-green-500 mt-1">Achievement Vibrant</div>
                    </label>
                    <label class="widget-preview-card widget-hybrid p-4 rounded-lg border flex flex-col items-center cursor-pointer">
                        <input type="radio" name="question_${step}" value="hybrid_adaptive" class="mb-2">
                        <div class="text-2xl font-mono text-purple-600">25:00</div>
                        <div class="text-sm text-purple-700">Focus Session</div>
                        <div class="text-xs text-purple-500 mt-1">Hybrid Adaptive</div>
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
            // Optionally, visually highlight the question or shake the container
            const container = document.getElementById('question-container');
            if (container) {
                container.classList.add('ring-2', 'ring-red-400');
                setTimeout(() => container.classList.remove('ring-2', 'ring-red-400'), 600);
            }
            return;
        }

        // Save answer
        const questionKeys = ['focusChallenge', 'energyPattern', 'primaryGoal', 'motivationStyle', 'sessionLength', 'lockScreenWidget', 'widgetStyle'];
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
        
        // Save user preferences to account if authenticated
        const userAccount = getUserAccount();
        if (userAccount) {
            saveUserPreferences(this.userPreferences);
            console.log('Preferences saved to user account');
        } else {
            // Fallback to localStorage
            localStorage.setItem('focusflow_user_preferences', JSON.stringify(this.userPreferences));
        }
        
        localStorage.setItem('focusflow_onboarding_completed', 'true');
        
        // Set default mode based on preferences
        const mode = this.userPreferences.motivationStyle === 'achievement_tracking' ? 'achievement' : 'zen';
        this.setMode(mode);
        
        // Check if user is authenticated
        const isAuthenticated = localStorage.getItem('focusflow_user_id');
        const isGuest = localStorage.getItem('focusflow_guest') === 'true';
        
        if (!isAuthenticated && !isGuest) {
            // Show auth modal to save progress
            showAuthModal();
        } else {
            // User is authenticated or guest, show main app
            document.getElementById('onboarding').classList.add('hidden');
            this.showMainApp();
        }
    }

    showMainApp() {
        console.log('Showing main app');
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        this.applyUserPreferences();
        this.updateUI();
    }

    applyUserPreferences() {
        // Set timer to preferred session length
        if (this.userPreferences.sessionLength) {
            let seconds = 1500; // default 25 min
            if (this.userPreferences.sessionLength === '25_min') seconds = 25 * 60;
            else if (this.userPreferences.sessionLength === '90_min') seconds = 90 * 60;
            else if (this.userPreferences.sessionLength === '3_plus_hour') seconds = 3 * 60 * 60;
            // Flexible: leave as default or allow user to choose
            this.setTimer(seconds);
        }
        // Render lock screen widget preview in selected style
        this.renderLockScreenWidgetPreview();
        // Personalize dashboard summary
        this.renderUserSummary();
    }

    renderLockScreenWidgetPreview() {
        const preview = document.getElementById('widget-preview');
        if (!preview) return;
        let style = this.userPreferences.widgetStyle || 'zen_minimal';
        let isDark = document.body.classList.contains('dark-theme');
        let html = '';
        if (style === 'zen_minimal') {
            html = `<div class="p-4 rounded-lg border ${isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-gray-50 text-gray-700 border-gray-200'} text-center">
                <div class="text-2xl font-mono ${isDark ? 'text-white' : 'text-gray-700'}">25:00</div>
                <div class="text-sm ${isDark ? 'text-gray-200' : 'text-gray-600'}">Focus Session</div>
                <div class="text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1">Zen Minimal</div>
            </div>`;
        } else if (style === 'achievement_vibrant') {
            html = `<div class="p-4 rounded-lg border bg-gradient-to-br ${isDark ? 'from-indigo-900 to-purple-900 text-white border-gray-700' : 'from-green-400 to-purple-500 text-white border-gray-200'} text-center">
                <div class="text-2xl font-mono">25:00</div>
                <div class="text-sm opacity-90">Focus Session</div>
                <div class="text-xs opacity-75 mt-1">Achievement Vibrant</div>
            </div>`;
        } else if (style === 'hybrid_adaptive') {
            html = `<div class="p-4 rounded-lg border ${isDark ? 'bg-gradient-to-br from-gray-800 to-purple-900 text-purple-200 border-gray-700' : 'bg-gradient-to-br from-gray-200 to-purple-200 text-purple-700 border-gray-200'} text-center">
                <div class="text-2xl font-mono">25:00</div>
                <div class="text-sm">Focus Session</div>
                <div class="text-xs mt-1">Hybrid Adaptive</div>
            </div>`;
        }
        preview.innerHTML = html;
        preview.classList.remove('hidden');
    }

    renderUserSummary() {
        // Optionally display user focus challenge, energy pattern, and primary goal on dashboard
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) return;
        let summary = document.getElementById('user-summary');
        if (!summary) {
            summary = document.createElement('div');
            summary.id = 'user-summary';
            summary.className = 'mb-8 p-4 rounded-xl bg-blue-50 text-blue-900';
            dashboard.prepend(summary);
        }
        
        const userAccount = getUserAccount();
        let accountInfo = '';
        if (userAccount) {
            const totalHours = Math.floor(userAccount.progress.totalFocusTime / 60);
            const totalMinutes = userAccount.progress.totalFocusTime % 60;
            accountInfo = `<div class="text-xs text-blue-600 mb-2">
                <i data-lucide="user" class="w-3 h-3 inline mr-1"></i>
                Account: ${userAccount.email} • Total Focus: ${totalHours}h ${totalMinutes}m
            </div>`;
        }
        
        summary.innerHTML = `
            ${accountInfo}
            <div class="flex flex-col md:flex-row md:space-x-8 text-sm">
                <div><span class="font-semibold">Focus Challenge:</span> ${this.userPreferences.focusChallenge?.replace(/_/g, ' ') || ''}</div>
                <div><span class="font-semibold">Energy Pattern:</span> ${this.userPreferences.energyPattern?.replace(/_/g, ' ') || ''}</div>
                <div><span class="font-semibold">Primary Goal:</span> ${this.userPreferences.primaryGoal?.replace(/_/g, ' ') || ''}</div>
            </div>
        `;
    }

    loadUserPreferences() {
        // Try to load from user account first
        const userAccount = getUserAccount();
        if (userAccount && userAccount.preferences) {
            this.userPreferences = userAccount.preferences;
        } else {
            // Fallback to old localStorage method
            const saved = localStorage.getItem('focusflow_user_preferences');
            if (saved) {
                this.userPreferences = JSON.parse(saved);
            }
        }
        
        const savedMode = localStorage.getItem('focusflow_mode');
        if (savedMode) {
            this.setMode(savedMode);
        }
    }

    setMode(mode) {
        console.log('Setting mode to:', mode);
        this.currentMode = mode;
        localStorage.setItem('focusflow_mode', mode);
        
        // Remove all mode classes from body
        document.body.classList.remove('zen-mode', 'achievement-mode', 'hybrid-mode');
        // Add the new mode class to body
        document.body.classList.add(`${mode}-mode`);
        
        console.log('Body classes after mode change:', document.body.className);
        
        // Zen mode specific enhancements
        if (mode === 'zen') {
            this.enhanceZenMode();
        } else if (mode === 'achievement') {
            this.enhanceAchievementMode();
        } else if (mode === 'hybrid') {
            this.enhanceHybridMode();
        }
        
        this.updateUI();
    }

    enhanceZenMode() {
        console.log('Enhancing Zen mode');
        // Remove vibrant/gamified UI
        document.querySelectorAll('.hidden-in-zen').forEach(el => el.classList.add('hidden'));
        // Minimal timer controls
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.fontFamily = "'JetBrains Mono', 'Fira Code', 'Monaco', monospace";
            timerDisplay.style.fontWeight = '300';
            timerDisplay.style.color = '#374151';
            timerDisplay.style.background = 'none';
            timerDisplay.style.textShadow = 'none';
        }
        // Muted progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.background = '#6B7280';
            progressBar.style.height = '4px';
            progressBar.style.borderRadius = '2px';
        }
        // Muted card backgrounds
        ['progress-card', 'quote-card', 'user-summary'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.background = '#F5F5F5';
                el.style.color = '#4B5563';
                el.style.border = '1px solid #E5E7EB';
                el.style.boxShadow = 'none';
            }
        });
        // Show daily focus goal
        this.renderDailyFocusGoal();
    }

    enhanceAchievementMode() {
        console.log('Enhancing Achievement mode');
        // Add vibrant animations and colors
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.style.background = 'linear-gradient(135deg, #10B981, #059669)';
            timerContainer.style.color = 'white';
        }

        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.color = 'white';
            timerDisplay.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        }

        // Add celebration animations
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                button.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            });
        });
    }

    enhanceHybridMode() {
        console.log('Enhancing Hybrid mode');
        // Combine elements from both modes
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.style.background = 'linear-gradient(135deg, #059669, #7C3AED)';
            timerContainer.style.color = 'white';
        }

        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.color = 'white';
            timerDisplay.style.textShadow = '0 2px 4px rgba(0,0,0,0.2)';
        }
    }

    toggleMode() {
        const modes = ['zen', 'achievement', 'hybrid'];
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        console.log('Toggling from', this.currentMode, 'to', modes[nextIndex]);
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
        this.progress.totalFocusTime += sessionMinutes;
        this.progress.streak = this.calculateStreak();
        this.progress.lastSessionDate = new Date().toDateString();
        
        // Add completed session to history
        this.progress.completedSessions.push({
            date: new Date().toISOString(),
            duration: sessionMinutes,
            mode: this.currentMode
        });
        
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
        // In Zen mode, only show quotes from ancient philosophers
        let filteredQuotes = this.quotes;
        if (this.currentMode === 'zen') {
            filteredQuotes = this.quotes.filter(q => q.category === 'ancient_philosopher' || q.category === 'philosopher');
            if (filteredQuotes.length === 0) filteredQuotes = this.quotes;
        } else if (this.userPreferences && this.userPreferences.motivationStyle) {
            const style = this.userPreferences.motivationStyle;
            if (style === 'philosophical_wisdom') {
                filteredQuotes = this.quotes.filter(q => q.category === 'ancient_philosopher' || q.category === 'philosopher');
            } else if (style === 'success_stories') {
                filteredQuotes = this.quotes.filter(q => q.category === 'modern_thinker' || q.category === 'historical_leader');
            } else if (style === 'achievement_tracking') {
                filteredQuotes = this.quotes.filter(q => q.category === 'scientist' || q.category === 'pioneering_women');
            }
            if (filteredQuotes.length === 0) filteredQuotes = this.quotes;
        }
        const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
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
        // Try to load from user account first
        const userAccount = getUserAccount();
        if (userAccount && userAccount.progress) {
            return userAccount.progress;
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('focusflow_progress');
        return saved ? JSON.parse(saved) : {
            todayMinutes: 0,
            totalSessions: 0,
            streak: 0,
            lastSessionDate: null,
            totalFocusTime: 0,
            completedSessions: []
        };
    }

    saveProgress() {
        // Save to user account if authenticated
        const userAccount = getUserAccount();
        if (userAccount) {
            saveUserProgress(this.progress);
        } else {
            // Fallback to localStorage
            localStorage.setItem('focusflow_progress', JSON.stringify(this.progress));
        }
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

    renderDailyFocusGoal() {
        // Show a muted card with today's focus goal at the top of the dashboard
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) return;
        let goal = document.getElementById('daily-focus-goal');
        if (!goal) {
            goal = document.createElement('div');
            goal.id = 'daily-focus-goal';
            goal.className = 'mb-8 p-4 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 text-center';
            dashboard.prepend(goal);
        }
        // Use user preference or default
        let minutes = 25;
        if (this.userPreferences.sessionLength === '90_min') minutes = 90;
        else if (this.userPreferences.sessionLength === '3_plus_hour') minutes = 180;
        goal.innerHTML = `<span class='font-semibold'>Today’s Focus Goal:</span> ${minutes} minutes`;
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