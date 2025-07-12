# FocusFlow Backend API

A secure, scalable backend API for the FocusFlow productivity app with real-time progress syncing across devices.

## Features

- 🔐 **Secure Authentication** with JWT tokens
- 📊 **Progress Syncing** across all devices
- 🛡️ **Security** with rate limiting and CORS
- 📱 **Multi-device Support** with device tracking
- 🗄️ **MongoDB Database** for data persistence
- ⚡ **High Performance** with Express.js

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/focusflow
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
```

### 3. Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended for Production)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

#### Option B: Local MongoDB

```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# or
sudo apt-get install mongodb   # Ubuntu

# Start MongoDB
mongod
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in to existing account

### Progress Management

- `POST /api/progress/sync` - Sync progress to cloud
- `GET /api/progress/load` - Load progress from cloud

### User Management

- `GET /api/user/profile` - Get user profile
- `GET /api/health` - Health check

## Deployment Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 2. Heroku

```bash
# Install Heroku CLI
# Create app
heroku create focusflow-api

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# Deploy
git push heroku main
```

### 3. Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 4. DigitalOcean App Platform

1. Connect your GitHub repository
2. Set environment variables in the dashboard
3. Deploy with one click

## Security Features

- ✅ **Password Hashing** with bcrypt
- ✅ **JWT Authentication** with secure tokens
- ✅ **Rate Limiting** to prevent abuse
- ✅ **CORS Protection** for cross-origin requests
- ✅ **Input Validation** with express-validator
- ✅ **Helmet Security** headers

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  lastLogin: Date,
  preferences: Map,
  devices: Array
}
```

### Progress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  todayMinutes: Number,
  totalSessions: Number,
  streak: Number,
  lastSessionDate: Date,
  totalFocusTime: Number,
  completedSessions: Array,
  lastSync: Date
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `NODE_ENV` | Environment (development/production) | No |

## Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","deviceInfo":{"deviceId":"test-device"}}'
```

## Monitoring

The API includes health check endpoint:

```bash
curl http://localhost:3001/api/health
```

## Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation
- Review the logs for debugging

## License

MIT License - see LICENSE file for details 