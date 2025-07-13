// FocusFlow - Main Application Logic

// Authentication Functions
function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function hideAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

// Simple Authentication System with Local Storage
class FocusFlowAuth {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.loadUserDataLocally();
    }

    async signUp(email, password, name = null) {
        try {
            // Check if user already exists
            const existingUser = this.getUserByEmail(email);
            if (existingUser) {
                return { success: false, error: 'User already exists. Please sign in instead.' };
            }

            // Create new user
            const user = {
                id: this.generateUserId(),
                email: email,
                name: name || email.split('@')[0],
                createdAt: new Date().toISOString(),
                preferences: {
                    mode: 'zen',
                    lockScreenWidget: true,
                    widgetStyle: 'zen_minimal'
                },
                progress: {
                    todayMinutes: 0,
                    totalSessions: 0,
                    streak: 0,
                    lastSessionDate: null
                }
            };

            // Save user data
            this.saveUserDataLocally(user);
            this.currentUser = user;
            this.isAuthenticated = true;

            console.log('User signed up successfully:', user);
            return { success: true, user: user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            // For demo purposes, accept any email/password combination
            // In a real app, you'd verify the password
            const user = this.getUserByEmail(email);
            
            if (!user) {
                // Create user if they don't exist (demo behavior)
                return await this.signUp(email, password);
            }

            this.currentUser = user;
            this.isAuthenticated = true;
            this.saveUserDataLocally(user);

            console.log('User signed in successfully:', user);
            return { success: true, user: user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle(email, name) {
        try {
            // Check if user exists
            let user = this.getUserByEmail(email);
            
            if (!user) {
                // Create new user
                user = {
                    id: this.generateUserId(),
                    email: email,
                    name: name || email.split('@')[0],
                    provider: 'google',
                    createdAt: new Date().toISOString(),
                    preferences: {
                        mode: 'zen',
                        lockScreenWidget: true,
                        widgetStyle: 'zen_minimal'
                    },
                    progress: {
                        todayMinutes: 0,
                        totalSessions: 0,
                        streak: 0,
                        lastSessionDate: null
                    }
                };
            }

            this.currentUser = user;
            this.isAuthenticated = true;
            this.saveUserDataLocally(user);

            console.log('Google sign in successful:', user);
            return { success: true, user: user };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInWithApple(email, name) {
        try {
            // Check if user exists
            let user = this.getUserByEmail(email);
            
            if (!user) {
                // Create new user
                user = {
                    id: this.generateUserId(),
                    email: email,
                    name: name || email.split('@')[0],
                    provider: 'apple',
                    createdAt: new Date().toISOString(),
                    preferences: {
                        mode: 'zen',
                        lockScreenWidget: true,
                        widgetStyle: 'zen_minimal'
                    },
                    progress: {
                        todayMinutes: 0,
                        totalSessions: 0,
                        streak: 0,
                        lastSessionDate: null
                    }
                };
            }

            this.currentUser = user;
            this.isAuthenticated = true;
            this.saveUserDataLocally(user);

            console.log('Apple sign in successful:', user);
            return { success: true, user: user };
        } catch (error) {
            console.error('Apple sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProfile(name, preferences) {
        if (!this.isAuthenticated) return { success: false, error: 'Not authenticated' };
        
        try {
            this.currentUser.name = name || this.currentUser.name;
            this.currentUser.preferences = { ...this.currentUser.preferences, ...preferences };
            this.saveUserDataLocally(this.currentUser);
            
            console.log('Profile updated successfully:', this.currentUser);
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, error: error.message };
        }
    }

    async syncProgress(progress) {
        if (!this.isAuthenticated) return { success: false, error: 'Not authenticated' };
        
        try {
            this.currentUser.progress = { ...this.currentUser.progress, ...progress };
            this.saveUserDataLocally(this.currentUser);
            
            console.log('Progress synced successfully:', this.currentUser.progress);
            return { success: true, progress: this.currentUser.progress };
        } catch (error) {
            console.error('Progress sync error:', error);
            return { success: false, error: error.message };
        }
    }

    async loadProgress() {
        if (!this.isAuthenticated) return null;
        
        try {
            return this.currentUser.progress || {
                todayMinutes: 0,
                totalSessions: 0,
                streak: 0,
                lastSessionDate: null
            };
        } catch (error) {
            console.error('Load progress error:', error);
            return null;
        }
    }

    setAuthToken(token) {
        localStorage.setItem('focusflow_auth_token', token);
    }

    getAuthToken() {
        return localStorage.getItem('focusflow_auth_token');
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenSize: `${screen.width}x${screen.height}`,
            deviceId: this.getDeviceId()
        };
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('focusflow_device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('focusflow_device_id', deviceId);
        }
        return deviceId;
    }

    saveUserDataLocally(user) {
        localStorage.setItem('focusflow_user_id', user.id);
        localStorage.setItem('focusflow_user_email', user.email);
        localStorage.setItem('focusflow_user_data', JSON.stringify(user));
        localStorage.setItem('focusflow_auth_token', 'demo_token_' + user.id);
    }

    loadUserDataLocally() {
        const userData = localStorage.getItem('focusflow_user_data');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            return this.currentUser;
        }
        return null;
    }

    signOut() {
        this.isAuthenticated = false;
        this.currentUser = null;
        localStorage.removeItem('focusflow_user_id');
        localStorage.removeItem('focusflow_user_email');
        localStorage.removeItem('focusflow_user_data');
        localStorage.removeItem('focusflow_auth_token');
        console.log('User signed out');
    }

    isUserAuthenticated() {
        return this.isAuthenticated && this.getAuthToken();
    }

    async updateLockScreenWidgetPreference(enabled) {
        if (!this.isAuthenticated) return false;
        
        try {
            const preferences = {
                lockScreenWidget: enabled
            };
            
            const result = await this.updateProfile(null, preferences);
            return result.success;
        } catch (error) {
            console.error('Failed to update lock screen widget preference:', error);
            return false;
        }
    }

    getLockScreenWidgetPreference() {
        if (!this.isAuthenticated) return false;
        return this.currentUser?.preferences?.lockScreenWidget || false;
    }

    // Helper methods
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserByEmail(email) {
        const userData = localStorage.getItem('focusflow_user_data');
        if (userData) {
            const user = JSON.parse(userData);
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }
}

// Initialize authentication
const focusFlowAuth = new FocusFlowAuth();



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
        this.progress = {
            todayMinutes: 0,
            totalSessions: 0,
            streak: 0,
            lastSessionDate: null,
            totalFocusTime: 0,
            completedSessions: []
        };
        this.schedule = {
            wakeUpTime: '06:00',
            bedtime: '23:00',
            focusWindowStart: '09:00',
            focusWindowEnd: '17:00',
            notifications: {
                sessionReminders: true,
                breakReminders: true,
                dailyMotivation: true,
                wakeUpReminders: true,
                windDownReminders: true,
                focusWindowReminders: true
            }
        };
        this.notificationPermission = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        console.log('initializeApp called');
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Initialize dark mode
        this.initializeDarkMode();

        // Load progress asynchronously
        this.progress = await this.loadProgress();

        // Check if user is authenticated
        const isAuthenticated = focusFlowAuth.isUserAuthenticated();
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
        this.loadTimerState(); // Load any running timer
        this.updateUI();
        this.initializeScheduling();
    }

    initializeDarkMode() {
        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem('focusflow_dark_mode');
        
        // Check for system preference if no saved preference
        if (savedDarkMode === null) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('focusflow_dark_mode', 'true');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('focusflow_dark_mode', 'false');
            }
        } else if (savedDarkMode === 'true') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // Debug: Log current theme
        console.log('Current theme:', document.documentElement.getAttribute('data-theme'));
        console.log('Dark mode preference:', savedDarkMode);
        
        // Set initial dark mode icon
        const darkModeToggleBtn = document.getElementById('dark-mode-toggle');
        if (darkModeToggleBtn) {
            const icon = darkModeToggleBtn.querySelector('i');
            if (icon) {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            }
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem('focusflow_dark_mode') === null) {
                if (e.matches) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('focusflow_dark_mode', 'true');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('focusflow_dark_mode', 'false');
                }
            }
        });
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
            this.currentSessionType = 'quick-focus';
            this.setTimer(25 * 60);
        });

        document.getElementById('deep-work')?.addEventListener('click', () => {
            this.currentSessionType = 'deep-work';
            this.setTimer(90 * 60);
        });

        document.getElementById('marathon')?.addEventListener('click', () => {
            this.currentSessionType = 'marathon';
            this.setTimer(3 * 60 * 60);
        });

        // Custom timer modal
        const closeCustomTimerBtn = document.getElementById('close-custom-timer');
        if (closeCustomTimerBtn) {
            closeCustomTimerBtn.addEventListener('click', () => {
                this.hideCustomTimerModal();
            });
        }

        const cancelCustomTimerBtn = document.getElementById('cancel-custom-timer');
        if (cancelCustomTimerBtn) {
            cancelCustomTimerBtn.addEventListener('click', () => {
                this.hideCustomTimerModal();
            });
        }

        const startCustomTimerBtn = document.getElementById('start-custom-timer');
        if (startCustomTimerBtn) {
            startCustomTimerBtn.addEventListener('click', () => {
                console.log('Start custom timer clicked');
                this.startCustomTimer();
            });
        }



        // Settings
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('close-settings')?.addEventListener('click', () => {
            this.hideSettings();
        });

        // Sign out button
        document.getElementById('sign-out-btn')?.addEventListener('click', () => {
            focusFlowAuth.signOut();
            this.showWelcomeScreen();
        });

        // Dark mode toggle button
        const darkModeToggleBtn = document.getElementById('dark-mode-toggle');
        if (darkModeToggleBtn) {
            darkModeToggleBtn.onclick = () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const isDark = currentTheme === 'dark';
                
                if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('focusflow_dark_mode', 'false');
                    // Update icon to moon
                    const icon = darkModeToggleBtn.querySelector('i');
                    if (icon) {
                        icon.setAttribute('data-lucide', 'moon');
                    }
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('focusflow_dark_mode', 'true');
                    // Update icon to sun
                    const icon = darkModeToggleBtn.querySelector('i');
                    if (icon) {
                        icon.setAttribute('data-lucide', 'sun');
                    }
                }
                this.renderLockScreenWidgetPreview();
                this.renderUserSummary();
                this.updateUI();
            };
        }

        // Mode toggle button - cycles through Zen, Achievement, and Hybrid modes
        const modeToggleBtn = document.getElementById('mode-toggle');
        if (modeToggleBtn) {
            modeToggleBtn.onclick = () => {
                this.toggleMode();
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
        if (emailForm) emailForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const password = document.getElementById('auth-password').value;
            
            // Show loading state
            const submitBtn = emailForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            try {
                const result = await focusFlowAuth.signUp(email, password);
                
                if (result.success) {
                    hideAuthModal();
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
                    successMessage.innerHTML = `
                        <div class="flex items-center">
                            <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
                            <span>Account created! Your progress will sync across all devices.</span>
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
                    alert(`Sign up failed: ${result.error}`);
                }
            } catch (error) {
                alert('Network error. Please check your connection and try again.');
            } finally {
                // Reset button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        };

        const googleBtn = document.getElementById('google-signin');
        if (googleBtn) googleBtn.onclick = async () => {
            // Simulate Google sign-in
            const email = 'user@gmail.com';
            const name = 'Google User';
            
            try {
                const result = await focusFlowAuth.signInWithGoogle(email, name);
                
                if (result.success) {
                    hideAuthModal();
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
                    successMessage.innerHTML = `
                        <div class="flex items-center">
                            <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
                            <span>Signed in with Google! Your progress will be saved to your device.</span>
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
                    alert(`Google sign-in failed: ${result.error}`);
                }
            } catch (error) {
                alert('Network error. Please check your connection and try again.');
            }
        };

        const appleBtn = document.getElementById('apple-signin');
        if (appleBtn) appleBtn.onclick = async () => {
            // Simulate Apple sign-in
            const email = 'user@icloud.com';
            const name = 'Apple User';
            
            try {
                const result = await focusFlowAuth.signInWithApple(email, name);
                
                if (result.success) {
                    hideAuthModal();
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
                    successMessage.innerHTML = `
                        <div class="flex items-center">
                            <i data-lucide="check-circle" class="w-5 h-5 mr-2"></i>
                            <span>Signed in with Apple! Your progress will be saved to your device.</span>
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
                    alert(`Apple sign-in failed: ${result.error}`);
                }
            } catch (error) {
                alert('Network error. Please check your connection and try again.');
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
        
        // Calming transition from welcome screen to onboarding
        if (welcomeScreen) {
            welcomeScreen.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'translateY(-30px) scale(0.98)';
            setTimeout(() => {
                welcomeScreen.classList.add('hidden');
            }, 1000);
        }
        
        // Show onboarding with calming entrance
        if (onboarding) {
            onboarding.classList.remove('hidden');
            onboarding.style.opacity = '0';
            onboarding.style.transform = 'translateY(30px) scale(0.98)';
            onboarding.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            setTimeout(() => {
                onboarding.style.opacity = '1';
                onboarding.style.transform = 'translateY(0) scale(1)';
                // Show first question with a gentle delay
                setTimeout(() => {
                    this.showQuestion(0);
                }, 400);
            }, 200);
        }
    }

    showQuestion(step) {
        console.log('Showing question step', step);
        const questions = [
            {
                title: "What's your biggest focus challenge?",
                subtitle: "This helps us personalize your experience",
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
        
        // Ultra smooth single flow transition
        container.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        container.style.opacity = '0';
        container.style.transform = 'translateY(3px)';
        
        setTimeout(() => {
            let html = `
                <div class="space-y-10" aria-live="polite">
                    <div class="text-center space-y-6">
                        <h2 class="text-3xl font-light text-slate-800 leading-tight" tabindex="0">${question.title}</h2>
                        ${question.subtitle ? `<p class="text-lg text-slate-600 leading-relaxed max-w-md mx-auto">${question.subtitle}</p>` : ''}
                    </div>
            `;

            if (question.type === 'widget_preview') {
                html += this.generateWidgetPreview(step);
            } else if (question.type === 'widget_style') {
                html += this.generateWidgetStyleSelection(step);
            } else {
                html += '<div class="space-y-4 max-w-2xl mx-auto pb-8" role="radiogroup" aria-label="' + question.title + '">';
                question.options.forEach((option, index) => {
                    html += `
                        <label class="flex items-center p-6 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl hover:bg-white hover:border-blue-300 cursor-pointer transition-all duration-300 radio-option shadow-lg hover:shadow-xl" tabindex="0">
                            <input type="radio" name="question_${step}" value="${option.value}" class="mr-4 w-5 h-5 text-blue-600" ${index === 0 ? 'checked' : ''} aria-checked="${index === 0 ? 'true' : 'false'}" aria-label="${option.label}">
                            <span class="text-gray-800 text-left leading-relaxed text-lg font-medium">${option.label}</span>
                        </label>
                    `;
                });
                html += '</div>';
            }
            html += '</div>';
            container.innerHTML = html;
            
            // Ultra smooth single flow fade in
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
            
            // Clean up transition after completion
            setTimeout(() => {
                container.style.transition = '';
            }, 400);
            
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
        }, 100);
    }

    generateWidgetPreview(step = 5) {
        console.log('Generating widget preview for step:', step);
        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="widget-preview-card widget-zen p-4 rounded-lg border" style="background: var(--bg-secondary); border-color: var(--border-color);">
                        <div class="text-center">
                            <div class="text-2xl font-mono" style="color: var(--text-primary);">25:00</div>
                            <div class="text-sm" style="color: var(--text-secondary);">Focus Session</div>
                            <div class="text-xs mt-1" style="color: var(--text-muted);">Zen Mode</div>
                        </div>
                    </div>
                    <div class="widget-preview-card widget-achievement p-4 rounded-lg border" style="background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981;">
                        <div class="text-center">
                            <div class="text-2xl font-mono text-white">25:00</div>
                            <div class="text-sm text-white opacity-90">Focus Session</div>
                            <div class="text-xs text-white opacity-75 mt-1">Achievement Mode</div>
                        </div>
                    </div>
                    <div class="widget-preview-card widget-hybrid p-4 rounded-lg border" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-color: #8b5cf6;">
                        <div class="text-center">
                            <div class="text-2xl font-mono text-white">25:00</div>
                            <div class="text-sm text-white opacity-90">Focus Session</div>
                            <div class="text-xs text-white opacity-75 mt-1">Hybrid Mode</div>
                        </div>
                    </div>
                </div>
                <div class="space-y-3">
                    <label class="flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <input type="radio" name="question_${step}" value="yes" class="mr-3" checked>
                        <span style="color: var(--text-primary);">Yes, show timer on lock screen</span>
                    </label>
                    <label class="flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                        <input type="radio" name="question_${step}" value="no" class="mr-3">
                        <span style="color: var(--text-primary);">No, keep it simple</span>
                    </label>
                </div>
            </div>
        `;
    }

    generateWidgetStyleSelection(step) {
        return `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <label class="widget-preview-card p-4 rounded-lg border flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-200 relative" style="background: var(--bg-secondary); border-color: var(--border-color);">
                        <input type="radio" name="question_${step}" value="zen_minimal" class="absolute top-2 right-2" checked>
                        <div class="text-2xl font-mono" style="color: var(--text-primary);">25:00</div>
                        <div class="text-sm" style="color: var(--text-secondary);">Focus Session</div>
                        <div class="text-xs mt-1" style="color: var(--text-muted);">Zen Minimal</div>
                    </label>
                    <label class="widget-preview-card p-4 rounded-lg border flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-200 relative" style="background: linear-gradient(135deg, #10b981, #059669); border-color: #10b981;">
                        <input type="radio" name="question_${step}" value="achievement_vibrant" class="absolute top-2 right-2">
                        <div class="text-2xl font-mono text-white">25:00</div>
                        <div class="text-sm text-white opacity-90">Focus Session</div>
                        <div class="text-xs text-white opacity-75 mt-1">Achievement Vibrant</div>
                    </label>
                    <label class="widget-preview-card p-4 rounded-lg border flex flex-col items-center cursor-pointer hover:shadow-lg transition-all duration-200 relative" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); border-color: #8b5cf6;">
                        <input type="radio" name="question_${step}" value="hybrid_adaptive" class="absolute top-2 right-2">
                        <div class="text-2xl font-mono text-white">25:00</div>
                        <div class="text-sm text-white opacity-90">Focus Session</div>
                        <div class="text-xs text-white opacity-75 mt-1">Hybrid Adaptive</div>
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
            // Gentle visual feedback without shaking
            const container = document.getElementById('question-container');
            if (container) {
                // Subtle opacity pulse instead of shake
                container.style.transition = 'opacity 0.3s ease-in-out';
                container.style.opacity = '0.7';
                setTimeout(() => {
                    container.style.opacity = '1';
                }, 300);
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
        
        // Save user preferences
        if (focusFlowAuth.isUserAuthenticated()) {
            // User is authenticated, save to their account
            focusFlowAuth.updateProfile(null, this.userPreferences);
            console.log('Preferences saved to authenticated user account');
            
            // Save lock screen widget preference
            const lockScreenEnabled = this.userPreferences.lockScreenWidget === 'yes';
            focusFlowAuth.updateLockScreenWidgetPreference(lockScreenEnabled);
            console.log('Lock screen widget preference saved');
        } else {
            // User is not authenticated, save to localStorage
            localStorage.setItem('focusflow_user_preferences', JSON.stringify(this.userPreferences));
            console.log('Preferences saved to localStorage');
        }
        
        localStorage.setItem('focusflow_onboarding_completed', 'true');
        
        // Set default mode based on preferences
        const mode = this.userPreferences.motivationStyle === 'achievement_tracking' ? 'achievement' : 'zen';
        this.setMode(mode);
        
        // Hide onboarding and show main app
        document.getElementById('onboarding').classList.add('hidden');
        this.showMainApp();
    }

    showMainApp() {
        console.log('Showing main app');
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Bind custom timer button event listener after main app is shown
        const customTimerBtn = document.getElementById('custom-timer');
        console.log('Custom timer button found in showMainApp:', !!customTimerBtn);
        if (customTimerBtn) {
            customTimerBtn.addEventListener('click', () => {
                console.log('Custom timer button clicked');
                this.showCustomTimerModal();
            });
            
            // Test the button is clickable
            console.log('Custom timer button text:', customTimerBtn.textContent);
            console.log('Custom timer button classes:', customTimerBtn.className);
        } else {
            console.error('Custom timer button not found in showMainApp!');
        }
        
        // Bind preset button event listeners
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hours = parseInt(btn.dataset.hours) || 0;
                const minutes = parseInt(btn.dataset.minutes) || 25;
                
                document.getElementById('custom-hours').value = hours;
                document.getElementById('custom-minutes').value = minutes;
                
                // Highlight the selected preset
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('ring-2', 'ring-green-500'));
                btn.classList.add('ring-2', 'ring-green-500');
            });
        });
        
        this.applyUserPreferences();
        this.initializeAnalytics();
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
        
        // Check if user wants to show the lock screen widget
        const lockScreenEnabled = this.userPreferences.lockScreenWidget === 'yes';
        
        if (!lockScreenEnabled) {
            // Hide the widget if user selected "no"
            preview.classList.add('hidden');
            return;
        }
        
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
        
        let accountInfo = '';
        if (focusFlowAuth.isUserAuthenticated()) {
            const user = focusFlowAuth.currentUser;
            if (user && user.progress) {
                const totalHours = Math.floor(user.progress.totalFocusTime / 60) || 0;
                const totalMinutes = (user.progress.totalFocusTime % 60) || 0;
                accountInfo = `<div class="text-xs text-blue-600 mb-2">
                    <i data-lucide="user" class="w-3 h-3 inline mr-1"></i>
                    Account: ${user.email} • Total Focus: ${totalHours}h ${totalMinutes}m
                </div>`;
            }
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
        // Try to load from authenticated user first
        if (focusFlowAuth.isUserAuthenticated() && focusFlowAuth.currentUser?.preferences) {
            this.userPreferences = focusFlowAuth.currentUser.preferences;
        } else {
            // Fallback to localStorage method
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
        
        // Always reset styles first to ensure clean transitions
        this.resetAllModeStyles();
        
        // Apply mode-specific enhancements
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
        console.log('Enhancing Zen mode - Creating pure, calming experience');
        
        // Reset all inline styles that might have been applied by other modes
        this.resetAllModeStyles();
        
        // Apply Zen-specific styling for a truly calming experience
        const timerContainer = document.getElementById('timer-container');
        if (timerContainer) {
            timerContainer.style.background = 'rgba(255, 255, 255, 0.95)';
            timerContainer.style.backdropFilter = 'blur(20px)';
            timerContainer.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            timerContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
            timerContainer.style.borderRadius = '16px';
            timerContainer.style.transition = 'all 0.3s ease';
        }

        // Zen timer display - clean, minimal, calming
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.style.fontFamily = "'Inter', sans-serif";
            timerDisplay.style.fontWeight = '300';
            timerDisplay.style.fontSize = '3rem';
            timerDisplay.style.color = '#1e293b';
            timerDisplay.style.textShadow = 'none';
            timerDisplay.style.background = 'none';
            timerDisplay.style.letterSpacing = '0.05em';
            timerDisplay.style.transition = 'all 0.3s ease';
        }

        // Zen progress ring - subtle, calming
        const progressRing = document.getElementById('progress-ring');
        if (progressRing) {
            const circle = progressRing.querySelector('.progress-ring-circle');
            if (circle) {
                circle.style.stroke = '#10b981';
                circle.style.strokeWidth = '3';
                circle.style.strokeLinecap = 'round';
                circle.style.transition = 'all 0.3s ease';
            }
        }

        // Zen buttons - minimal, calming
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.background = 'rgba(255, 255, 255, 0.9)';
            button.style.color = '#1e293b';
            button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            button.style.backdropFilter = 'blur(10px)';
            button.style.borderRadius = '8px';
            button.style.transition = 'all 0.3s ease';
            button.style.fontWeight = '400';
            button.style.textShadow = 'none';
            button.style.boxShadow = 'none';
        });

        // Zen primary buttons - subtle green
        const primaryButtons = document.querySelectorAll('#start-timer, #pause-timer, #stop-timer');
        primaryButtons.forEach(button => {
            button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.fontWeight = '500';
        });

        // Zen session type buttons - muted colors
        const sessionButtons = document.querySelectorAll('#quick-focus, #deep-work, #marathon, #custom-timer');
        const sessionColors = {
            'quick-focus': '#6b7280',
            'deep-work': '#8b5cf6',
            'marathon': '#f59e0b',
            'custom-timer': '#64748b'
        };
        
        sessionButtons.forEach(button => {
            const buttonId = button.id;
            const color = sessionColors[buttonId] || '#6b7280';
            button.style.background = color;
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.fontWeight = '500';
        });

        // Zen cards - clean, minimal
        const cards = document.querySelectorAll('#quote-card, #schedule-card, #progress-card');
        cards.forEach(card => {
            card.style.background = 'rgba(255, 255, 255, 0.9)';
            card.style.backdropFilter = 'blur(20px)';
            card.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.05)';
            card.style.borderRadius = '16px';
            card.style.transition = 'all 0.3s ease';
        });

        // Zen header - minimal
        const header = document.querySelector('header');
        if (header) {
            header.style.background = 'rgba(255, 255, 255, 0.9)';
            header.style.backdropFilter = 'blur(20px)';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
            header.style.boxShadow = 'none';
        }

        // Zen mode toggle buttons
        const modeButtons = document.querySelectorAll('#mode-toggle, #settings-btn, #sign-out-btn');
        modeButtons.forEach(button => {
            button.style.background = 'rgba(255, 255, 255, 0.8)';
            button.style.color = '#1e293b';
            button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            button.style.borderRadius = '8px';
            button.style.transition = 'all 0.3s ease';
        });

        // Zen quote styling
        const quoteText = document.getElementById('quote-text');
        if (quoteText) {
            quoteText.style.color = '#1e293b';
            quoteText.style.fontStyle = 'italic';
            quoteText.style.lineHeight = '1.6';
            quoteText.style.fontSize = '1rem';
        }

        const quoteAuthor = document.getElementById('quote-author');
        if (quoteAuthor) {
            quoteAuthor.style.color = '#64748b';
            quoteAuthor.style.fontWeight = '500';
            quoteAuthor.style.fontSize = '0.875rem';
        }

        // Zen progress styling
        const progressElements = document.querySelectorAll('#progress-card .space-y-4 > div');
        progressElements.forEach(element => {
            element.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
            element.style.padding = '0.5rem 0';
            element.style.transition = 'all 0.3s ease';
        });

        // Zen body background
        document.body.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
        document.body.style.color = '#1e293b';
        document.body.style.transition = 'all 0.3s ease';

        // Show daily focus goal with Zen styling
        this.renderDailyFocusGoal();
        
        console.log('Zen mode enhanced - Pure, calming experience created');
    }

    resetAllModeStyles() {
        // Reset all inline styles that might have been applied by other modes
        const elementsToReset = [
            '#timer-container',
            '#timer-display',
            '#progress-ring .progress-ring-circle',
            'button',
            '#quote-card',
            '#schedule-card', 
            '#progress-card',
            'header',
            '#mode-toggle',
            '#settings-btn',
            '#sign-out-btn',
            '#quote-text',
            '#quote-author',
            '#progress-card .space-y-4 > div'
        ];

        elementsToReset.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.removeAttribute('style');
            });
        });

        // Reset body styles
        document.body.removeAttribute('style');
        
        console.log('All mode styles reset');
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
        const nextMode = modes[nextIndex];
        
        console.log('Toggling from', this.currentMode, 'to', nextMode);
        
        // Update the mode toggle button icon to reflect the next mode
        const modeToggleBtn = document.getElementById('mode-toggle');
        if (modeToggleBtn) {
            const icon = modeToggleBtn.querySelector('i');
            if (icon) {
                const icons = {
                    'zen': 'moon',
                    'achievement': 'zap',
                    'hybrid': 'sun'
                };
                icon.setAttribute('data-lucide', icons[nextMode]);
                lucide.createIcons(); // Recreate icons
            }
        }
        
        this.setMode(nextMode);
    }

    setTimer(seconds) {
        this.currentTime = seconds;
        this.originalTime = seconds; // Store original time for progress calculation
        this.updateTimerDisplay();
        this.updateProgressRing();
        this.showTimerControls();
        
        // Save timer state to localStorage for background persistence
        this.saveTimerState();
    }

    startTimer() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startTime = Date.now();
            
            // Save start time for background persistence
            this.saveTimerState();
            
            this.timerInterval = setInterval(() => {
                this.currentTime--;
                this.updateTimerDisplay();
                this.updateProgressRing();
                
                if (this.currentTime <= 0) {
                    this.completeSession();
                }
            }, 1000);
            
            this.showTimerControls();
            this.updateTimerContainer();
            
            // Start background timer check
            this.startBackgroundTimer();
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
        this.originalTime = 0;
        this.updateTimerDisplay();
        this.updateProgressRing();
        this.showTimerControls();
        this.updateTimerContainer();
        
        // Clear timer state
        this.clearTimerState();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-display').textContent = display;
    }

    updateProgressRing() {
        if (!this.originalTime) return;
        
        const progress = ((this.originalTime - this.currentTime) / this.originalTime) * 100;
        const progressRing = document.getElementById('progress-ring');
        if (progressRing) {
            const circle = progressRing.querySelector('.progress-ring-circle');
            if (circle) {
                const radius = circle.r.baseVal.value;
                const circumference = radius * 2 * Math.PI;
                const offset = circumference - (progress / 100) * circumference;
                circle.style.strokeDasharray = `${circumference} ${circumference}`;
                circle.style.strokeDashoffset = offset;
            }
        }
    }

    saveTimerState() {
        const timerState = {
            isRunning: this.isRunning,
            currentTime: this.currentTime,
            originalTime: this.originalTime,
            startTime: this.startTime,
            sessionType: this.currentSessionType
        };
        localStorage.setItem('focusflow_timer_state', JSON.stringify(timerState));
    }

    loadTimerState() {
        const savedState = localStorage.getItem('focusflow_timer_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            
            if (state.isRunning && state.startTime) {
                // Calculate elapsed time since timer was started
                const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
                const remaining = state.originalTime - elapsed;
                
                if (remaining > 0) {
                    this.currentTime = remaining;
                    this.originalTime = state.originalTime;
                    this.currentSessionType = state.sessionType;
                    this.startTimer(); // Resume timer
                } else {
                    // Timer has finished while app was closed
                    this.completeSession();
                }
            }
        }
    }

    clearTimerState() {
        localStorage.removeItem('focusflow_timer_state');
    }

    startBackgroundTimer() {
        // Check timer every second even when tab is not active
        this.backgroundInterval = setInterval(() => {
            if (this.isRunning) {
                this.saveTimerState();
            }
        }, 1000);
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
        
        this.saveProgress(); // This is now async but we don't need to await it
        
        // Show completion message
        this.showCompletionMessage();
        
        // Update UI
        this.updateProgressDisplay();
    }

    showCompletionMessage() {
        const sessionMessages = {
            'quick-focus': [
                "Quick focus session completed! Great momentum building.",
                "Excellent quick session! You're building focus stamina.",
                "Perfect! Short sessions lead to big results."
            ],
            'deep-work': [
                "Deep work session completed! You've done serious work.",
                "Outstanding deep work! You're building expertise.",
                "Fantastic! Deep work is where mastery happens."
            ],
            'marathon': [
                "Marathon session completed! You're unstoppable!",
                "Incredible endurance! You've done exceptional work.",
                "Legendary focus! You've completed a marathon session."
            ],
            'custom': [
                "Custom session completed! You've achieved your goal.",
                "Excellent work! Your custom session is complete.",
                "Perfect! You've mastered your own focus rhythm."
            ]
        };
        
        const sessionType = this.currentSessionType || 'custom';
        const messages = sessionMessages[sessionType] || sessionMessages['custom'];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        // Create celebration notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 p-6 rounded-2xl shadow-2xl z-50 fade-in';
        
        // Apply session-specific styling
        if (sessionType === 'quick-focus') {
            notification.style.background = 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
        } else if (sessionType === 'deep-work') {
            notification.style.background = 'linear-gradient(135deg, #8B5CF6, #6D28D9)';
        } else if (sessionType === 'marathon') {
            notification.style.background = 'linear-gradient(135deg, #F59E0B, #D97706)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #10B981, #059669)';
        }
        
        notification.style.color = 'white';
        notification.style.fontWeight = '600';
        notification.style.borderRadius = '16px';
        notification.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="text-3xl mr-3">🎉</div>
                <div>
                    <div class="font-bold text-lg">Session Complete!</div>
                    <div class="text-sm opacity-90">${message}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add celebration animation
        notification.style.animation = 'bounce 0.6s ease-out';
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px) scale(0.95)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    showCustomTimerModal() {
        console.log('showCustomTimerModal called');
        const modal = document.getElementById('custom-timer-modal');
        console.log('Custom timer modal found:', !!modal);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('custom-timer-modal-enter');
            console.log('Custom timer modal should now be visible');
        } else {
            console.error('Custom timer modal not found!');
        }
    }

    hideCustomTimerModal() {
        console.log('hideCustomTimerModal called');
        const modal = document.getElementById('custom-timer-modal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('Custom timer modal hidden');
        } else {
            console.error('Custom timer modal not found for hiding!');
        }
    }

    startCustomTimer() {
        const hours = parseInt(document.getElementById('custom-hours').value) || 0;
        const minutes = parseInt(document.getElementById('custom-minutes').value) || 25;
        const sessionType = document.getElementById('custom-session-type').value;
        
        const totalSeconds = (hours * 60 + minutes) * 60;
        
        console.log('Custom timer values:', { hours, minutes, sessionType, totalSeconds });
        
        if (totalSeconds > 0 && totalSeconds <= 12 * 60 * 60) { // Max 12 hours
            this.currentSessionType = sessionType;
            this.setTimer(totalSeconds);
            this.hideCustomTimerModal();
            
            // Show confirmation message
            const hoursDisplay = hours > 0 ? `${hours}h ` : '';
            const minutesDisplay = minutes > 0 ? `${minutes}m` : '';
            const durationText = `${hoursDisplay}${minutesDisplay}`.trim();
            
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg z-50 fade-in';
            notification.innerHTML = `
                <div class="flex items-center">
                    <i data-lucide="clock" class="w-5 h-5 mr-2"></i>
                    <span>Custom timer set: ${durationText}</span>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
            
        } else if (totalSeconds > 12 * 60 * 60) {
            alert('Maximum duration is 12 hours. Please enter a shorter time.');
        } else {
            alert('Please enter a valid duration (at least 1 minute).');
        }
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

    async loadProgress() {
        // Try to load from cloud if authenticated
        if (focusFlowAuth.isUserAuthenticated()) {
            try {
                const cloudProgress = await focusFlowAuth.loadProgress();
                if (cloudProgress) {
                    console.log('Progress loaded from cloud');
                    return cloudProgress;
                }
            } catch (error) {
                console.error('Failed to load from cloud:', error);
            }
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

    async saveProgress() {
        // Save locally first for immediate access
        localStorage.setItem('focusflow_progress', JSON.stringify(this.progress));
        
        // Save daily progress for analytics
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const dailyProgress = {
            totalMinutes: this.progress.todayMinutes || 0,
            sessions: this.progress.totalSessions || 0,
            completedSessions: this.progress.completedSessions || 0,
            longestSession: this.progress.longestSession || 0,
            date: todayStr
        };
        localStorage.setItem(`focusflow_${todayStr}`, JSON.stringify(dailyProgress));
        
        // Sync to cloud if authenticated
        if (focusFlowAuth.isUserAuthenticated()) {
            try {
                await focusFlowAuth.syncProgress(this.progress);
                console.log('Progress synced to cloud');
            } catch (error) {
                console.error('Failed to sync progress:', error);
                // Progress is still saved locally
            }
        }
        
        // Update analytics
        this.updateStatistics();
        this.updateGoalProgress();
        this.generateStreaksCalendar();
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
        
        // Update dark mode icon
        const modeToggleBtn = document.getElementById('mode-toggle');
        if (modeToggleBtn) {
            const isDark = document.body.classList.contains('dark-theme');
            const icon = modeToggleBtn.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
                if (window.lucide) {
                    lucide.createIcons();
                }
            }
        }
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
        goal.innerHTML = `<span class='font-semibold'>Today's Focus Goal:</span> ${minutes} minutes`;
    }

    // Smart Scheduling Methods
    initializeScheduling() {
        this.loadSchedule();
        this.requestNotificationPermission();
        this.setupScheduleDisplay();
        this.bindScheduleEvents();
        this.startScheduleMonitoring();
    }

    loadSchedule() {
        const savedSchedule = localStorage.getItem('focusflow_schedule');
        if (savedSchedule) {
            this.schedule = { ...this.schedule, ...JSON.parse(savedSchedule) };
        }
        this.updateScheduleDisplay();
    }

    saveSchedule() {
        localStorage.setItem('focusflow_schedule', JSON.stringify(this.schedule));
    }

    setupScheduleDisplay() {
        this.updateScheduleDisplay();
    }

    updateScheduleDisplay() {
        const wakeUpDisplay = document.getElementById('wake-up-display');
        const focusWindowDisplay = document.getElementById('focus-window-display');
        const bedtimeDisplay = document.getElementById('bedtime-display');

        if (wakeUpDisplay) wakeUpDisplay.textContent = this.schedule.wakeUpTime;
        if (focusWindowDisplay) focusWindowDisplay.textContent = `${this.schedule.focusWindowStart}-${this.schedule.focusWindowEnd}`;
        if (bedtimeDisplay) bedtimeDisplay.textContent = this.schedule.bedtime;
    }

    bindScheduleEvents() {
        // Edit schedule button
        document.getElementById('edit-schedule-btn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // Schedule settings in settings modal
        document.getElementById('wake-up-time')?.addEventListener('change', (e) => {
            this.schedule.wakeUpTime = e.target.value;
            this.saveSchedule();
            this.updateScheduleDisplay();
        });

        document.getElementById('bedtime')?.addEventListener('change', (e) => {
            this.schedule.bedtime = e.target.value;
            this.saveSchedule();
            this.updateScheduleDisplay();
        });

        document.getElementById('focus-window-start')?.addEventListener('change', (e) => {
            this.schedule.focusWindowStart = e.target.value;
            this.saveSchedule();
            this.updateScheduleDisplay();
        });

        document.getElementById('focus-window-end')?.addEventListener('change', (e) => {
            this.schedule.focusWindowEnd = e.target.value;
            this.saveSchedule();
            this.updateScheduleDisplay();
        });

        // Notification settings
        document.getElementById('session-reminders')?.addEventListener('change', (e) => {
            this.schedule.notifications.sessionReminders = e.target.checked;
            this.saveSchedule();
        });

        document.getElementById('break-reminders')?.addEventListener('change', (e) => {
            this.schedule.notifications.breakReminders = e.target.checked;
            this.saveSchedule();
        });

        document.getElementById('daily-motivation')?.addEventListener('change', (e) => {
            this.schedule.notifications.dailyMotivation = e.target.checked;
            this.saveSchedule();
        });

        document.getElementById('wake-up-reminders')?.addEventListener('change', (e) => {
            this.schedule.notifications.wakeUpReminders = e.target.checked;
            this.saveSchedule();
        });

        document.getElementById('wind-down-reminders')?.addEventListener('change', (e) => {
            this.schedule.notifications.windDownReminders = e.target.checked;
            this.saveSchedule();
        });

        document.getElementById('focus-window-reminders')?.addEventListener('change', (e) => {
            this.schedule.notifications.focusWindowReminders = e.target.checked;
            this.saveSchedule();
        });
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
            console.log('Notification permission:', permission);
        }
    }

    startScheduleMonitoring() {
        // Check schedule every minute
        setInterval(() => {
            this.checkSchedule();
        }, 60000);

        // Initial check
        this.checkSchedule();
    }

    checkSchedule() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        const currentHour = now.getHours();

        // Wake-up reminder
        if (this.schedule.notifications.wakeUpReminders && 
            currentTime === this.schedule.wakeUpTime) {
            this.showNotification('Good Morning! 🌅', 'Time to start your day with focus and purpose.');
        }

        // Focus window reminder
        if (this.schedule.notifications.focusWindowReminders && 
            currentTime === this.schedule.focusWindowStart) {
            this.showNotification('Focus Window Open 🎯', 'Your optimal focus time has begun. Ready to dive deep?');
        }

        // Wind-down reminder
        if (this.schedule.notifications.windDownReminders && 
            currentTime === this.schedule.bedtime) {
            this.showNotification('Time to Wind Down 🌙', 'Great work today! Time to relax and prepare for tomorrow.');
        }

        // Daily motivation (once per day at 9 AM)
        if (this.schedule.notifications.dailyMotivation && 
            currentTime === '09:00' && 
            !localStorage.getItem('focusflow_daily_motivation_' + now.toDateString())) {
            this.showDailyMotivation();
            localStorage.setItem('focusflow_daily_motivation_' + now.toDateString(), 'true');
        }
    }

    showNotification(title, message) {
        if (this.notificationPermission) {
            new Notification(title, {
                body: message,
                icon: '/manifest.json',
                badge: '/manifest.json',
                tag: 'focusflow-notification'
            });
        } else {
            // Fallback to browser alert
            this.showBrowserNotification(title, message);
        }
    }

    showBrowserNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 p-4 bg-white rounded-lg shadow-lg border-l-4 border-green-500 z-50 max-w-sm fade-in';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <i data-lucide="bell" class="w-5 h-5 text-green-500"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900">${title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${message}</p>
                </div>
                <button class="flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Update icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    showDailyMotivation() {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        this.showNotification('Daily Motivation 💪', `"${quote.text}" - ${quote.author}`);
    }

    isInFocusWindow() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        return currentTime >= this.schedule.focusWindowStart && currentTime <= this.schedule.focusWindowEnd;
    }

    getNextFocusSession() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        
        if (currentTime < this.schedule.focusWindowStart) {
            return `Next focus session starts at ${this.schedule.focusWindowStart}`;
        } else if (currentTime > this.schedule.focusWindowEnd) {
            return 'Focus window closed for today';
        } else {
            return 'You\'re in your focus window!';
        }
    }

    // Analytics and Progress Tracking
    initializeAnalytics() {
        this.bindAnalyticsEvents();
        this.generateStreaksCalendar();
        this.renderFocusChart('week');
        this.updateStatistics();
        this.updateGoalProgress();
    }

    bindAnalyticsEvents() {
        // Analytics tabs
        document.getElementById('tab-streaks')?.addEventListener('click', () => {
            this.switchAnalyticsTab('streaks');
        });
        
        document.getElementById('tab-charts')?.addEventListener('click', () => {
            this.switchAnalyticsTab('charts');
        });
        
        document.getElementById('tab-stats')?.addEventListener('click', () => {
            this.switchAnalyticsTab('stats');
        });

        // Chart period buttons
        document.getElementById('chart-week')?.addEventListener('click', () => {
            this.switchChartPeriod('week');
        });
        
        document.getElementById('chart-month')?.addEventListener('click', () => {
            this.switchChartPeriod('month');
        });

        // Export data button
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportProgressData();
        });
    }

    switchAnalyticsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        // Update content
        document.querySelectorAll('.analytics-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-view`).classList.remove('hidden');
        document.getElementById(`${tabName}-view`).classList.add('active');
    }

    switchChartPeriod(period) {
        // Update period buttons
        document.querySelectorAll('.chart-period').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`chart-${period}`).classList.add('active');

        // Re-render chart
        this.renderFocusChart(period);
    }

    generateStreaksCalendar() {
        const calendar = document.getElementById('streaks-calendar');
        if (!calendar) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        calendar.innerHTML = '';

        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();

            // Check if it's today
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            // Check if it's in the current month
            else if (date.getMonth() !== currentMonth) {
                dayElement.classList.add('empty');
            }
            // Check if there was focus activity on this day
            else {
                const focusData = this.getFocusDataForDate(date);
                if (focusData && focusData.totalMinutes > 0) {
                    if (focusData.totalMinutes >= 240) { // 4 hours
                        dayElement.classList.add('completed');
                    } else {
                        dayElement.classList.add('partial');
                    }
                } else {
                    dayElement.classList.add('missed');
                }
            }

            // Add click event for details
            dayElement.addEventListener('click', () => {
                this.showDayDetails(date);
            });

            calendar.appendChild(dayElement);
        }

        this.updateStreakCounts();
    }

    getFocusDataForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        const savedData = localStorage.getItem(`focusflow_${dateStr}`);
        return savedData ? JSON.parse(savedData) : null;
    }

    showDayDetails(date) {
        const focusData = this.getFocusDataForDate(date);
        const dateStr = date.toLocaleDateString();
        
        let message = `Focus activity for ${dateStr}\n\n`;
        if (focusData) {
            const hours = Math.floor(focusData.totalMinutes / 60);
            const minutes = focusData.totalMinutes % 60;
            message += `Total focus time: ${hours}h ${minutes}m\n`;
            message += `Sessions completed: ${focusData.sessions || 0}\n`;
            message += `Average session length: ${Math.round(focusData.totalMinutes / (focusData.sessions || 1))}m`;
        } else {
            message += 'No focus activity recorded for this day.';
        }
        
        alert(message);
    }

    updateStreakCounts() {
        const currentStreak = this.calculateCurrentStreak();
        const bestStreak = this.calculateBestStreak();
        
        document.getElementById('current-streak-days').textContent = currentStreak;
        document.getElementById('best-streak-days').textContent = bestStreak;
    }

    calculateCurrentStreak() {
        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);
        
        while (true) {
            const focusData = this.getFocusDataForDate(currentDate);
            if (focusData && focusData.totalMinutes >= 240) { // 4 hours minimum
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    calculateBestStreak() {
        // This would need more sophisticated logic to track best streak
        // For now, return a placeholder
        return Math.max(this.calculateCurrentStreak(), 7);
    }

    renderFocusChart(period) {
        const chartContainer = document.getElementById('focus-chart');
        if (!chartContainer) return;

        chartContainer.innerHTML = '';
        
        const data = this.getChartData(period);
        const maxValue = Math.max(...data.map(d => d.value), 1);
        
        data.forEach((item, index) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${(item.value / maxValue) * 100}%`;
            bar.style.flex = '1';
            
            // Add value label
            const valueLabel = document.createElement('div');
            valueLabel.className = 'chart-bar-value';
            valueLabel.textContent = `${item.value}h`;
            bar.appendChild(valueLabel);
            
            // Add day label
            const dayLabel = document.createElement('div');
            dayLabel.className = 'chart-bar-label';
            dayLabel.textContent = item.label;
            bar.appendChild(dayLabel);
            
            chartContainer.appendChild(bar);
        });

        this.updateChartStats(data);
    }

    getChartData(period) {
        const data = [];
        const today = new Date();
        
        if (period === 'week') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const focusData = this.getFocusDataForDate(date);
                const hours = focusData ? Math.round(focusData.totalMinutes / 60) : 0;
                
                data.push({
                    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    value: hours
                });
            }
        } else { // month
            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const focusData = this.getFocusDataForDate(date);
                const hours = focusData ? Math.round(focusData.totalMinutes / 60) : 0;
                
                data.push({
                    label: date.getDate().toString(),
                    value: hours
                });
            }
        }
        
        return data;
    }

    updateChartStats(data) {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const average = Math.round(total / data.length);
        
        document.getElementById('chart-total-hours').textContent = `${total}h`;
        document.getElementById('chart-avg-hours').textContent = `${average}h`;
    }

    updateStatistics() {
        const stats = this.calculateStatistics();
        
        document.getElementById('total-focus-hours').textContent = stats.totalHours;
        document.getElementById('total-sessions').textContent = stats.totalSessions;
        document.getElementById('avg-session-length').textContent = `${stats.avgSessionLength}m`;
        document.getElementById('completion-rate').textContent = `${stats.completionRate}%`;
        
        // Personal bests
        document.getElementById('longest-session').textContent = `${stats.longestSession}m`;
        document.getElementById('most-sessions-day').textContent = stats.mostSessionsDay;
        document.getElementById('best-streak').textContent = `${stats.bestStreak} days`;
        document.getElementById('most-hours-day').textContent = `${stats.mostHoursDay}h`;
    }

    calculateStatistics() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        let totalMinutes = 0;
        let totalSessions = 0;
        let longestSession = 0;
        let mostSessionsDay = 0;
        let mostHoursDay = 0;
        let completedSessions = 0;
        let totalSessionsAttempted = 0;
        
        // Calculate stats from last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const focusData = this.getFocusDataForDate(date);
            
            if (focusData) {
                totalMinutes += focusData.totalMinutes || 0;
                totalSessions += focusData.sessions || 0;
                longestSession = Math.max(longestSession, focusData.longestSession || 0);
                mostSessionsDay = Math.max(mostSessionsDay, focusData.sessions || 0);
                mostHoursDay = Math.max(mostHoursDay, Math.round((focusData.totalMinutes || 0) / 60));
                completedSessions += focusData.completedSessions || 0;
                totalSessionsAttempted += focusData.sessions || 0;
            }
        }
        
        return {
            totalHours: Math.round(totalMinutes / 60),
            totalSessions: totalSessions,
            avgSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
            completionRate: totalSessionsAttempted > 0 ? Math.round((completedSessions / totalSessionsAttempted) * 100) : 0,
            longestSession: longestSession,
            mostSessionsDay: mostSessionsDay,
            bestStreak: this.calculateBestStreak(),
            mostHoursDay: mostHoursDay
        };
    }

    updateGoalProgress() {
        const today = new Date();
        const focusData = this.getFocusDataForDate(today);
        const dailyGoal = 240; // 4 hours in minutes
        const currentProgress = focusData ? focusData.totalMinutes : 0;
        const progressPercentage = Math.min((currentProgress / dailyGoal) * 100, 100);
        
        document.getElementById('goal-progress-text').textContent = 
            `${Math.round(currentProgress / 60)}/${Math.round(dailyGoal / 60)}h`;
        document.getElementById('goal-progress-bar').style.width = `${progressPercentage}%`;
    }

    exportProgressData() {
        const data = this.generateExportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusflow-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success message
        this.showNotification('Data Exported', 'Your progress data has been downloaded successfully.');
    }

    generateExportData() {
        const today = new Date();
        const exportData = {
            exportDate: today.toISOString(),
            userPreferences: this.userPreferences,
            statistics: this.calculateStatistics(),
            dailyData: {}
        };
        
        // Export last 90 days of data
        for (let i = 0; i < 90; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const focusData = this.getFocusDataForDate(date);
            
            if (focusData) {
                exportData.dailyData[dateStr] = focusData;
            }
        }
        
        return exportData;
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