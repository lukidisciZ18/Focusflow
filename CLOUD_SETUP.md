# FocusFlow Cloud Deployment Guide

This guide will help you deploy FocusFlow to the cloud with proper Google OAuth integration and progress synchronization.

## Prerequisites

### 1. Install Node.js and npm
Download and install Node.js from https://nodejs.org/ (LTS version recommended)

### 2. Install Git
Download and install Git from https://git-scm.com/

## Step 1: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Set application type to "Web application"
   - Add authorized origins:
     - `http://localhost:8000` (for development)
     - `https://your-frontend-domain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:8000`
     - `https://your-frontend-domain.com`
5. Copy the Client ID and Client Secret

## Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/focusflow`)
5. Add your IP address to the IP whitelist

## Step 3: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp backend/env.example backend/.env
   ```

2. Edit `backend/.env` with your actual values:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/focusflow
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   ```

## Step 4: Deploy Backend

### Option A: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project in Vercel dashboard
   - Go to Settings → Environment Variables
   - Add all variables from your `.env` file

### Option B: Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Deploy:
   ```bash
   railway up
   ```

4. Set environment variables in Railway dashboard

### Option C: Deploy to Render

1. Go to [Render](https://render.com/)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables in Render dashboard

## Step 5: Update Frontend API URL

After deploying your backend, update the API URL in `app.js`:

```javascript
// Change this line:
this.apiUrl = 'http://localhost:3001/api';

// To your deployed backend URL, for example:
this.apiUrl = 'https://your-app.vercel.app/api';
```

## Step 6: Deploy Frontend

### Deploy to Vercel (Recommended)

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy frontend:
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. Go to [Netlify](https://netlify.com/)
2. Drag and drop your project folder or connect to GitHub
3. Set build command: (leave empty for static site)
4. Set publish directory: `.` (root directory)

## Step 7: Test the Deployment

1. Open your deployed frontend URL
2. Try signing in with Google
3. Test progress synchronization across devices
4. Verify that data persists after page refresh

## Troubleshooting

### Google Sign-in Not Working

1. Check that Google OAuth credentials are correct
2. Verify authorized origins include your frontend domain
3. Check browser console for errors
4. Ensure backend is properly deployed and accessible

### Database Connection Issues

1. Verify MongoDB Atlas connection string
2. Check that IP address is whitelisted
3. Ensure database user has correct permissions
4. Check backend logs for connection errors

### CORS Issues

1. Update CORS configuration in `backend/server.js`
2. Add your frontend domain to allowed origins
3. Check that backend URL is correct in frontend

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `PORT` | Server port (default: 3001) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Security Best Practices

1. Use strong, unique JWT secrets
2. Keep environment variables secure
3. Use HTTPS in production
4. Regularly update dependencies
5. Monitor application logs
6. Set up proper CORS policies

## Support

If you encounter issues:

1. Check the browser console for errors
2. Review backend logs
3. Verify all environment variables are set
4. Test with a fresh browser session
5. Check network connectivity to backend

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and analytics
4. Implement backup strategies
5. Consider scaling options 