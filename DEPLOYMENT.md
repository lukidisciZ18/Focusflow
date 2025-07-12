# FocusFlow Deployment Options

## 🚀 Quick Start

### Option 1: One-Click Local Development
```bash
./quick-deploy.sh
```
This starts everything locally - frontend on localhost:8000 and backend on localhost:3001.

### Option 2: Advanced Deployment Options
```bash
./deploy-options.sh help
```
This shows all available deployment options.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB (local or cloud)
- Git (for cloud deployments)

## 🛠️ Local Development

1. **Install MongoDB:**
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   
   # Or use MongoDB Atlas (free cloud option)
   # Sign up at https://www.mongodb.com/atlas
   ```

2. **Run the app:**
   ```bash
   ./quick-deploy.sh
   ```

3. **Access the app:**
   - Open http://localhost:8000 in your browser
   - The backend API runs on http://localhost:3001/api

## ☁️ Cloud Deployment Options

### Frontend Hosting
- **Vercel** (Recommended): `./deploy-options.sh vercel`
- **Netlify**: `./deploy-options.sh netlify`
- **GitHub Pages**: Manual setup in repository settings

### Backend Hosting
- **Railway** (Recommended): `./deploy-options.sh railway`
- **Heroku**: `./deploy-options.sh heroku`
- **DigitalOcean**: Manual setup in App Platform

## 🔧 Environment Setup

### Backend (.env file)
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/focusflow
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8000
```

### Frontend (app.js)
Update the API URL in `app.js`:
```javascript
this.apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com/api'  // Your deployed backend URL
    : 'http://localhost:3001/api';
```

## 🧪 Testing

### Test local deployment:
```bash
./deploy-options.sh test
```

### Test API endpoints:
```bash
# Health check
curl http://localhost:3001/api/health

# Sign up test
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Backend directory not found"**
   - Make sure you're in the project root directory
   - Ensure the backend folder exists

2. **"MongoDB connection failed"**
   - Check if MongoDB is running: `brew services list | grep mongodb`
   - Verify your connection string in `backend/.env`

3. **"Port already in use"**
   - Kill existing processes: `lsof -ti:8000 | xargs kill -9`
   - Or use different ports in the scripts

4. **"CORS errors"**
   - Check that CORS_ORIGIN in backend matches your frontend URL
   - Ensure frontend is using the correct backend URL

### Debug Commands:
```bash
# Check if servers are running
lsof -i :8000
lsof -i :3001

# Check backend logs
cd backend && npm start

# Check frontend console
# Open browser dev tools (F12) and check console
```

## 📚 Full Documentation

For detailed deployment instructions, see [deployment-guide.md](deployment-guide.md).

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Look at the full deployment guide
3. Test your setup with the test commands
4. Check browser console for frontend errors
5. Check backend logs for API errors 