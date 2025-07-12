const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/focusflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  devices: [{
    deviceId: String,
    userAgent: String,
    platform: String,
    lastSeen: Date
  }]
});

const User = mongoose.model('User', userSchema);

// Progress Schema
const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  todayMinutes: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastSessionDate: {
    type: Date,
    default: null
  },
  totalFocusTime: {
    type: Number,
    default: 0
  },
  completedSessions: [{
    date: Date,
    duration: Number,
    mode: String
  }],
  lastSync: {
    type: Date,
    default: Date.now
  }
});

const Progress = mongoose.model('Progress', progressSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

// Validation middleware
const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  }
];

const validateSignin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  }
];

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Sign up endpoint
app.post('/api/auth/signup', validateSignup, async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      devices: [{
        deviceId: deviceInfo.deviceId,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        lastSeen: new Date()
      }]
    });

    await user.save();

    // Create initial progress
    const progress = new Progress({
      userId: user._id,
      todayMinutes: 0,
      totalSessions: 0,
      streak: 0,
      totalFocusTime: 0,
      completedSessions: []
    });

    await progress.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in endpoint
app.post('/api/auth/signin', validateSignin, async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update device info
    const deviceIndex = user.devices.findIndex(d => d.deviceId === deviceInfo.deviceId);
    if (deviceIndex >= 0) {
      user.devices[deviceIndex].lastSeen = new Date();
    } else {
      user.devices.push({
        deviceId: deviceInfo.deviceId,
        userAgent: deviceInfo.userAgent,
        platform: deviceInfo.platform,
        lastSeen: new Date()
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync progress endpoint
app.post('/api/progress/sync', authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const userId = req.user.userId;

    // Find or create progress document
    let userProgress = await Progress.findOne({ userId });
    
    if (!userProgress) {
      userProgress = new Progress({
        userId,
        ...progress
      });
    } else {
      // Update progress
      Object.assign(userProgress, progress);
      userProgress.lastSync = new Date();
    }

    await userProgress.save();

    res.json({
      success: true,
      message: 'Progress synced successfully',
      lastSync: userProgress.lastSync
    });

  } catch (error) {
    console.error('Progress sync error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Load progress endpoint
app.get('/api/progress/load', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userProgress = await Progress.findOne({ userId });
    
    if (!userProgress) {
      return res.json({
        success: true,
        progress: {
          todayMinutes: 0,
          totalSessions: 0,
          streak: 0,
          lastSessionDate: null,
          totalFocusTime: 0,
          completedSessions: []
        }
      });
    }

    res.json({
      success: true,
      progress: {
        todayMinutes: userProgress.todayMinutes,
        totalSessions: userProgress.totalSessions,
        streak: userProgress.streak,
        lastSessionDate: userProgress.lastSessionDate,
        totalFocusTime: userProgress.totalFocusTime,
        completedSessions: userProgress.completedSessions
      }
    });

  } catch (error) {
    console.error('Progress load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile endpoint
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        devices: user.devices.length
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`FocusFlow API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 