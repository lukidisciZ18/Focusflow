// Mock API for FocusFlow Authentication
// This simulates the backend API endpoints for testing

class MockFocusFlowAPI {
    constructor() {
        this.users = new Map();
        this.progress = new Map();
        this.tokens = new Map();
    }

    // Mock signup endpoint
    async signup(email, password, deviceInfo) {
        if (this.users.has(email)) {
            return { success: false, error: 'User already exists' };
        }

        const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        const user = {
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

        this.users.set(email, user);
        this.tokens.set(token, userId);
        this.progress.set(userId, user.progress);

        return {
            success: true,
            user: user,
            token: token
        };
    }

    // Mock signin endpoint
    async signin(email, password, deviceInfo) {
        const user = this.users.get(email);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        user.lastLogin = new Date().toISOString();
        this.tokens.set(token, user.id);

        return {
            success: true,
            user: user,
            token: token
        };
    }

    // Mock progress sync endpoint
    async syncProgress(token, progress) {
        const userId = this.tokens.get(token);
        if (!userId) {
            return { success: false, error: 'Invalid token' };
        }

        this.progress.set(userId, progress);
        return { success: true, message: 'Progress synced' };
    }

    // Mock progress load endpoint
    async loadProgress(token) {
        const userId = this.tokens.get(token);
        if (!userId) {
            return { success: false, error: 'Invalid token' };
        }

        const progress = this.progress.get(userId);
        return {
            success: true,
            progress: progress || {
                todayMinutes: 0,
                totalSessions: 0,
                streak: 0,
                lastSessionDate: null,
                totalFocusTime: 0,
                completedSessions: []
            }
        };
    }
}

// Create global mock API instance
window.mockFocusFlowAPI = new MockFocusFlowAPI();

// Mock fetch function for testing
window.mockFetch = async (url, options) => {
    const api = window.mockFocusFlowAPI;
    
    if (url.includes('/auth/signup')) {
        const body = JSON.parse(options.body);
        const result = await api.signup(body.email, body.password, body.deviceInfo);
        
        return {
            ok: result.success,
            json: async () => result
        };
    }
    
    if (url.includes('/auth/signin')) {
        const body = JSON.parse(options.body);
        const result = await api.signin(body.email, body.password, body.deviceInfo);
        
        return {
            ok: result.success,
            json: async () => result
        };
    }
    
    if (url.includes('/progress/sync')) {
        const body = JSON.parse(options.body);
        const token = options.headers.Authorization.replace('Bearer ', '');
        const result = await api.syncProgress(token, body.progress);
        
        return {
            ok: result.success,
            json: async () => result
        };
    }
    
    if (url.includes('/progress/load')) {
        const token = options.headers.Authorization.replace('Bearer ', '');
        const result = await api.loadProgress(token);
        
        return {
            ok: result.success,
            json: async () => result
        };
    }
    
    return {
        ok: false,
        json: async () => ({ error: 'Endpoint not found' })
    };
};

console.log('Mock FocusFlow API loaded for testing'); 