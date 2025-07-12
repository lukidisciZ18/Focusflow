const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory storage for development
const users = new Map();
const progress = new Map();

// Security middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mode: 'mock-server'
  });
});

// Sign up endpoint
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
      preferences: {},
      devices: [{
        deviceId: deviceInfo?.deviceId || 'device_' + Date.now(),
        userAgent: deviceInfo?.userAgent || 'unknown',
        platform: deviceInfo?.platform || 'unknown',
        lastSeen: new Date()
      }]
    };

    users.set(email, user);

    // Create progress record
    progress.set(user.id, {
      userId: user.id,
      todayMinutes: 0,
      totalSessions: 0,
      streak: 0,
      lastSessionDate: null,
      totalFocusTime: 0,
      completedSessions: [],
      lastSync: new Date()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userData } = user;
    res.json({
      token,
      user: userData
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in endpoint
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();

    // Add device info if provided
    if (deviceInfo) {
      const existingDevice = user.devices.find(d => d.deviceId === deviceInfo.deviceId);
      if (existingDevice) {
        existingDevice.lastSeen = new Date();
      } else {
        user.devices.push({
          deviceId: deviceInfo.deviceId,
          userAgent: deviceInfo.userAgent,
          platform: deviceInfo.platform,
          lastSeen: new Date()
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password: _, ...userData } = user;
    res.json({
      token,
      user: userData
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync progress endpoint
app.post('/api/progress/sync', authenticateToken, async (req, res) => {
  try {
    const { progress: progressData, lastSync } = req.body;
    const userId = req.user.userId;

    let userProgress = progress.get(userId);
    if (!userProgress) {
      userProgress = {
        userId,
        todayMinutes: 0,
        totalSessions: 0,
        streak: 0,
        lastSessionDate: null,
        totalFocusTime: 0,
        completedSessions: [],
        lastSync: new Date()
      };
    }

    // Update progress with new data
    Object.assign(userProgress, progressData);
    userProgress.lastSync = new Date();

    progress.set(userId, userProgress);

    res.json({
      success: true,
      message: 'Progress synced successfully',
      progress: userProgress
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Load progress endpoint
app.get('/api/progress/load', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProgress = progress.get(userId);

    if (!userProgress) {
      return res.json({
        progress: {
          todayMinutes: 0,
          totalSessions: 0,
          streak: 0,
          lastSessionDate: null,
          totalFocusTime: 0,
          completedSessions: [],
          lastSync: new Date()
        }
      });
    }

    res.json({
      progress: userProgress
    });

  } catch (error) {
    console.error('Load progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User profile endpoint
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user by ID
    let user = null;
    for (const [email, userData] of users) {
      if (userData.id === userId) {
        user = userData;
        break;
      }
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user data (without password)
    const { password: _, ...userData } = user;
    res.json({
      user: userData
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`FocusFlow Mock API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log('Mode: Mock server (no MongoDB required)');
}); 