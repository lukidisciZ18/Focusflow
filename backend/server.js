const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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

// Enhanced User Schema
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
    required: false // Optional for OAuth users
  },
  name: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'apple'],
    default: 'email'
  },
  googleId: {
    type: String,
    sparse: true
  },
  appleId: {
    type: String,
    sparse: true
  },
  emailVerified: {
    type: Boolean,
    default: false
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
    mode: { type: String, default: 'zen' },
    sessionLength: { type: String, default: '25_min' },
    motivationStyle: { type: String, default: 'philosophical_wisdom' },
    lockScreenWidget: { type: Boolean, default: false },
    notifications: {
      sessionReminders: { type: Boolean, default: true },
      breakReminders: { type: Boolean, default: true },
      dailyMotivation: { type: Boolean, default: true },
      wakeUpReminders: { type: Boolean, default: true },
      windDownReminders: { type: Boolean, default: true },
      focusWindowReminders: { type: Boolean, default: true }
    },
    schedule: {
      wakeUpTime: { type: String, default: '06:00' },
      bedtime: { type: String, default: '23:00' },
      focusWindowStart: { type: String, default: '09:00' },
      focusWindowEnd: { type: String, default: '17:00' }
    }
  },
  devices: [{
    deviceId: String,
    userAgent: String,
    platform: String,
    lastSeen: Date
  }],
  deletedAt: {
    type: Date,
    default: null
  }
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
    mode: String,
    sessionType: String
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
    const { email, password, deviceInfo, name } = req.body;

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
      name: name || email.split('@')[0],
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
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences
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
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      },
      token
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleToken, deviceInfo } = req.body;
    
    // In a real implementation, you would verify the Google token
    // For now, we'll simulate the verification
    const googleUser = {
      id: 'google_' + Date.now(),
      email: req.body.email,
      name: req.body.name
    };

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: googleUser.email },
        { googleId: googleUser.id }
      ]
    });

    if (!user) {
      // Create new user
      user = new User({
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.id,
        authProvider: 'google',
        emailVerified: true,
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
    } else {
      // Update existing user
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      user.authProvider = 'google';
      user.emailVerified = true;
      
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

      user.lastLogin = new Date();
      await user.save();
    }

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
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      },
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apple OAuth endpoint
app.post('/api/auth/apple', async (req, res) => {
  try {
    const { appleToken, deviceInfo } = req.body;
    
    // In a real implementation, you would verify the Apple token
    // For now, we'll simulate the verification
    const appleUser = {
      id: 'apple_' + Date.now(),
      email: req.body.email,
      name: req.body.name
    };

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: appleUser.email },
        { appleId: appleUser.id }
      ]
    });

    if (!user) {
      // Create new user
      user = new User({
        email: appleUser.email,
        name: appleUser.name,
        appleId: appleUser.id,
        authProvider: 'apple',
        emailVerified: true,
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
    } else {
      // Update existing user
      if (!user.appleId) {
        user.appleId = appleUser.id;
      }
      user.authProvider = 'apple';
      user.emailVerified = true;
      
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

      user.lastLogin = new Date();
      await user.save();
    }

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
        name: user.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      },
      token
    });

  } catch (error) {
    console.error('Apple auth error:', error);
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
        name: user.name,
        avatar: user.avatar,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
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

// Update user profile endpoint
app.put('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload avatar endpoint
app.post('/api/user/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update avatar path
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      avatar: user.avatar
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export user data endpoint
app.get('/api/user/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-password');
    const progress = await Progress.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exportData = {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        authProvider: user.authProvider,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        devices: user.devices
      },
      progress: progress ? {
        todayMinutes: progress.todayMinutes,
        totalSessions: progress.totalSessions,
        streak: progress.streak,
        lastSessionDate: progress.lastSessionDate,
        totalFocusTime: progress.totalFocusTime,
        completedSessions: progress.completedSessions,
        lastSync: progress.lastSync
      } : null,
      exportDate: new Date().toISOString()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="focusflow-export.json"');
    res.json(exportData);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import user data endpoint
app.post('/api/user/import', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { importData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user preferences if provided
    if (importData.user && importData.user.preferences) {
      user.preferences = { ...user.preferences, ...importData.user.preferences };
    }

    await user.save();

    // Update progress if provided
    if (importData.progress) {
      let progress = await Progress.findOne({ userId });
      if (!progress) {
        progress = new Progress({ userId });
      }
      
      Object.assign(progress, importData.progress);
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Data imported successfully'
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account endpoint (GDPR compliant)
app.delete('/api/user/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Soft delete - mark as deleted but keep data for compliance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.deletedAt = new Date();
    await user.save();

    // Delete progress data
    await Progress.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset request endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return res.json({ success: true, message: 'If an account exists, a reset email has been sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real implementation, send email with reset link
    // For now, we'll just return success
    console.log('Password reset token:', resetToken);

    res.json({
      success: true,
      message: 'If an account exists, a reset email has been sent'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset confirmation endpoint
app.post('/api/auth/reset-password/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset confirmation error:', error);
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