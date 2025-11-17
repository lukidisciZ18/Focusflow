# Google OAuth Setup Guide for FocusFlow

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project: `FocusFlow App`
4. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google Identity" or "Google+ API"
4. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: FocusFlow
   - User support email: your-email@gmail.com
   - Developer contact information: your-email@gmail.com
   - Save and continue through all steps

4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: FocusFlow Web Client
   - Authorized JavaScript origins:
     ```
     http://localhost:8000
     http://127.0.0.1:8000
     https://your-frontend-domain.com (add this after deployment)
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:8000
     https://your-frontend-domain.com (add this after deployment)
     ```
   - Click "Create"

5. **Copy the Client ID and Client Secret** (you'll need these for the .env file)

## Step 4: Configure Environment Variables

1. Edit the `backend/.env` file:
   ```bash
   nano backend/.env
   ```

2. Update these values:
   ```env
   # Database Configuration (for now, use local MongoDB or MongoDB Atlas)
   MONGODB_URI=mongodb://localhost:27017/focusflow
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id-from-step-3
   GOOGLE_CLIENT_SECRET=your-google-client-secret-from-step-3
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   ```

## Step 5: Test Local Development

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend (in another terminal):
   ```bash
   # If you have Python 3:
   python3 -m http.server 8000
   
   # Or if you have Node.js:
   npx http-server -p 8000
   ```

3. Open http://localhost:8000 in your browser
4. Try signing in with Google

## Step 6: Deploy to Cloud

### Option A: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy backend:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project in Vercel
   - Settings → Environment Variables
   - Add all variables from your .env file

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

## Step 7: Update Frontend API URL

After deploying your backend, update the API URL in `app.js`:

```javascript
// Find this line:
this.apiUrl = 'http://localhost:3001/api';

// Change it to your deployed backend URL:
this.apiUrl = 'https://your-app.vercel.app/api';
```

## Step 8: Deploy Frontend

1. Go to [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
2. Connect your GitHub repository
3. Deploy the frontend
4. Update Google OAuth authorized origins with your frontend domain

## Troubleshooting

### Google Sign-in Not Working

1. **Check Console Errors**: Open browser dev tools and check for errors
2. **Verify OAuth Credentials**: Ensure Client ID and Secret are correct
3. **Check Authorized Origins**: Make sure your domain is in the authorized origins
4. **Verify Backend URL**: Ensure the frontend is calling the correct backend URL

### Common Error Messages

- `"Invalid Google token"`: OAuth credentials are incorrect
- `"Google token verification failed"`: Token format is wrong
- `"CORS error"`: Backend URL is incorrect or CORS not configured

### Testing Checklist

- [ ] Google OAuth credentials are set in .env
- [ ] Backend server is running on port 3001
- [ ] Frontend is accessible on port 8000
- [ ] No console errors in browser
- [ ] Google sign-in button appears
- [ ] Sign-in process completes without errors
- [ ] User data is saved to database
- [ ] Progress syncs across devices

## Security Notes

1. **Never commit .env files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Regularly rotate** OAuth credentials
5. **Monitor** application logs for suspicious activity

## Next Steps After Setup

1. Set up MongoDB Atlas for production database
2. Configure custom domain
3. Set up monitoring and analytics
4. Implement backup strategies
5. Add additional authentication providers (Apple, GitHub, etc.)

Your FocusFlow app should now have working Google OAuth! 🚀 