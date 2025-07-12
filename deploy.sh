#!/bin/bash

# FocusFlow Deployment Script
# This script helps deploy both frontend and backend

echo "🚀 FocusFlow Deployment Script"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to deploy backend
deploy_backend() {
    echo "📦 Deploying Backend..."
    
    cd backend
    
    # Install dependencies
    echo "Installing backend dependencies..."
    npm install
    
    # Check if .env exists
    if [ ! -f .env ]; then
        echo "⚠️  .env file not found. Creating from template..."
        cp env.example .env
        echo "📝 Please edit .env file with your configuration:"
        echo "   - MONGODB_URI: Your MongoDB connection string"
        echo "   - JWT_SECRET: Your secret key"
        echo "   - FRONTEND_URL: Your frontend URL"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
    
    # Start backend server
    echo "Starting backend server..."
    npm start &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 5
    
    # Test backend health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend is running at http://localhost:3001"
    else
        echo "❌ Backend failed to start. Check the logs above."
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo "🌐 Deploying Frontend..."
    
    # Check if Python is available for simple server
    if command -v python3 &> /dev/null; then
        echo "Starting frontend server with Python..."
        python3 -m http.server 8000 &
        FRONTEND_PID=$!
        sleep 2
        echo "✅ Frontend is running at http://localhost:8000"
    elif command -v python &> /dev/null; then
        echo "Starting frontend server with Python..."
        python -m http.server 8000 &
        FRONTEND_PID=$!
        sleep 2
        echo "✅ Frontend is running at http://localhost:8000"
    else
        echo "❌ Python not found. Please install Python or use a different server."
        exit 1
    fi
}

# Function to show deployment options
show_options() {
    echo ""
    echo "🎯 Deployment Options:"
    echo "1. Local Development (Backend + Frontend)"
    echo "2. Backend Only"
    echo "3. Frontend Only"
    echo "4. Production Deployment Guide"
    echo "5. Exit"
    echo ""
    read -p "Choose an option (1-5): " choice
    
    case $choice in
        1)
            deploy_backend
            deploy_frontend
            echo ""
            echo "🎉 FocusFlow is now running!"
            echo "📱 Frontend: http://localhost:8000"
            echo "🔧 Backend: http://localhost:3001"
            echo ""
            echo "Press Ctrl+C to stop all servers"
            wait
            ;;
        2)
            deploy_backend
            echo ""
            echo "🔧 Backend is running at http://localhost:3001"
            echo "Press Ctrl+C to stop"
            wait $BACKEND_PID
            ;;
        3)
            deploy_frontend
            echo ""
            echo "🌐 Frontend is running at http://localhost:8000"
            echo "Press Ctrl+C to stop"
            wait $FRONTEND_PID
            ;;
        4)
            show_production_guide
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            show_options
            ;;
    esac
}

# Function to show production deployment guide
show_production_guide() {
    echo ""
    echo "🚀 Production Deployment Guide"
    echo "=============================="
    echo ""
    echo "📦 Backend Deployment Options:"
    echo ""
    echo "1. Vercel (Recommended):"
    echo "   cd backend"
    echo "   npm i -g vercel"
    echo "   vercel"
    echo ""
    echo "2. Heroku:"
    echo "   cd backend"
    echo "   heroku create focusflow-api"
    echo "   heroku config:set MONGODB_URI=your-mongodb-uri"
    echo "   heroku config:set JWT_SECRET=your-jwt-secret"
    echo "   git push heroku main"
    echo ""
    echo "3. Railway:"
    echo "   cd backend"
    echo "   npm i -g @railway/cli"
    echo "   railway login"
    echo "   railway init"
    echo "   railway up"
    echo ""
    echo "🌐 Frontend Deployment Options:"
    echo ""
    echo "1. Vercel:"
    echo "   cd public"
    echo "   vercel"
    echo ""
    echo "2. Netlify:"
    echo "   cd public"
    echo "   npm i -g netlify-cli"
    echo "   netlify deploy"
    echo ""
    echo "3. GitHub Pages:"
    echo "   Push to GitHub and enable Pages in repository settings"
    echo ""
    echo "🔧 Environment Setup:"
    echo "1. Set up MongoDB Atlas database"
    echo "2. Update API URL in app.js"
    echo "3. Set environment variables"
    echo "4. Deploy backend first, then frontend"
    echo ""
    echo "📞 Need help? Check the backend/README.md for detailed instructions."
}

# Main script
echo ""
echo "Welcome to FocusFlow deployment!"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ] && [ ! -d "backend" ]; then
    echo "❌ Please run this script from the FocusFlow project root directory."
    exit 1
fi

show_options 