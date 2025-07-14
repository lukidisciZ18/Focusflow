#!/bin/bash

# Simple FocusFlow Deployment Guide
# This script guides you through deploying FocusFlow without requiring local Node.js

echo "🚀 FocusFlow Simple Deployment Guide"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "This guide will help you deploy FocusFlow to the cloud."
echo "You don't need Node.js installed locally - we'll use cloud platforms."
echo ""

# Step 1: Google OAuth Setup
echo "Step 1: Set up Google OAuth"
echo "============================"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API:"
echo "   - Go to 'APIs & Services' → 'Library'"
echo "   - Search for 'Google+ API' and enable it"
echo "4. Create OAuth 2.0 credentials:"
echo "   - Go to 'APIs & Services' → 'Credentials'"
echo "   - Click 'Create Credentials' → 'OAuth 2.0 Client ID'"
echo "   - Set application type to 'Web application'"
echo "   - Add authorized origins:"
echo "     * http://localhost:8000 (for development)"
echo "     * https://your-frontend-domain.com (for production)"
echo "   - Add authorized redirect URIs:"
echo "     * http://localhost:8000"
echo "     * https://your-frontend-domain.com"
echo "5. Copy the Client ID and Client Secret"
echo ""
read -p "Press Enter when you've set up Google OAuth..."

# Step 2: MongoDB Atlas Setup
echo ""
echo "Step 2: Set up MongoDB Atlas"
echo "============================="
echo "1. Go to https://cloud.mongodb.com/"
echo "2. Create a free account and cluster"
echo "3. Create a database user with read/write permissions"
echo "4. Get your connection string (looks like: mongodb+srv://username:password@cluster.mongodb.net/focusflow)"
echo "5. Add your IP address to the IP whitelist"
echo ""
read -p "Press Enter when you've set up MongoDB Atlas..."

# Step 3: Environment Variables
echo ""
echo "Step 3: Prepare Environment Variables"
echo "===================================="
echo "You'll need these environment variables for your backend deployment:"
echo ""
echo "MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/focusflow"
echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production"
echo "GOOGLE_CLIENT_ID=your-google-client-id"
echo "GOOGLE_CLIENT_SECRET=your-google-client-secret"
echo "PORT=3001"
echo "NODE_ENV=production"
echo ""
read -p "Press Enter when you have these values ready..."

# Step 4: Choose Deployment Platform
echo ""
echo "Step 4: Choose Deployment Platform"
echo "=================================="
echo "1. Vercel (Recommended - Easy deployment)"
echo "2. Railway (Full-stack with database)"
echo "3. Render (Alternative to Heroku)"
echo "4. Netlify (Frontend only)"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Deploying to Vercel..."
        echo "======================="
        echo "1. Go to https://vercel.com/"
        echo "2. Sign up/login with GitHub"
        echo "3. Click 'New Project'"
        echo "4. Import your GitHub repository"
        echo "5. Configure the project:"
        echo "   - Framework Preset: Node.js"
        echo "   - Root Directory: backend"
        echo "   - Build Command: npm install"
        echo "   - Output Directory: ."
        echo "   - Install Command: npm install"
        echo "   - Development Command: npm run dev"
        echo "6. Add environment variables in Vercel dashboard"
        echo "7. Deploy!"
        echo ""
        echo "After deployment, your backend URL will be: https://your-project.vercel.app"
        ;;
    2)
        echo ""
        echo "Deploying to Railway..."
        echo "======================="
        echo "1. Go to https://railway.app/"
        echo "2. Sign up/login with GitHub"
        echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
        echo "4. Select your repository"
        echo "5. Set the service directory to 'backend'"
        echo "6. Add environment variables in Railway dashboard"
        echo "7. Deploy!"
        echo ""
        echo "After deployment, your backend URL will be: https://your-project.railway.app"
        ;;
    3)
        echo ""
        echo "Deploying to Render..."
        echo "======================"
        echo "1. Go to https://render.com/"
        echo "2. Sign up/login with GitHub"
        echo "3. Click 'New' → 'Web Service'"
        echo "4. Connect your GitHub repository"
        echo "5. Configure the service:"
        echo "   - Name: focusflow-backend"
        echo "   - Root Directory: backend"
        echo "   - Build Command: npm install"
        echo "   - Start Command: npm start"
        echo "6. Add environment variables in Render dashboard"
        echo "7. Deploy!"
        echo ""
        echo "After deployment, your backend URL will be: https://your-project.onrender.com"
        ;;
    4)
        echo ""
        echo "Deploying Frontend to Netlify..."
        echo "================================="
        echo "1. Go to https://netlify.com/"
        echo "2. Sign up/login with GitHub"
        echo "3. Click 'New site from Git'"
        echo "4. Connect your GitHub repository"
        echo "5. Configure the build:"
        echo "   - Build command: (leave empty)"
        echo "   - Publish directory: . (root directory)"
        echo "6. Deploy!"
        echo ""
        echo "Note: You'll still need to deploy the backend separately"
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

# Step 5: Update Frontend
echo ""
echo "Step 5: Update Frontend API URL"
echo "==============================="
echo "After deploying your backend, you need to update the API URL in app.js:"
echo ""
echo "Find this line in app.js:"
echo "  this.apiUrl = 'http://localhost:3001/api';"
echo ""
echo "And change it to your deployed backend URL, for example:"
echo "  this.apiUrl = 'https://your-project.vercel.app/api';"
echo ""
read -p "Press Enter when you've updated the API URL..."

# Step 6: Deploy Frontend
echo ""
echo "Step 6: Deploy Frontend"
echo "======================="
echo "1. Go to https://vercel.com/ (or your chosen platform)"
echo "2. Create a new project"
echo "3. Import your GitHub repository"
echo "4. Configure the project:"
echo "   - Framework Preset: Other"
echo "   - Root Directory: . (root directory)"
echo "   - Build Command: (leave empty)"
echo "   - Output Directory: ."
echo "5. Deploy!"
echo ""

print_success "Deployment guide completed!"
echo ""
echo "Next steps:"
echo "1. Test your deployed application"
echo "2. Try signing in with Google"
echo "3. Test progress synchronization"
echo "4. Set up custom domain (optional)"
echo ""
echo "If you encounter issues, check the CLOUD_SETUP.md file for troubleshooting." 