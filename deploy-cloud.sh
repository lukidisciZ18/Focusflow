#!/bin/bash

# FocusFlow Cloud Deployment Script
# This script helps deploy FocusFlow to various cloud platforms

set -e

echo "🚀 FocusFlow Cloud Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Setup environment variables
setup_env() {
    print_status "Setting up environment variables..."
    
    if [ ! -f "backend/.env" ]; then
        print_warning "No .env file found. Creating from template..."
        cp backend/env.example backend/.env
        print_warning "Please edit backend/.env with your actual values:"
        echo "  - MONGODB_URI (MongoDB Atlas connection string)"
        echo "  - JWT_SECRET (random secret key)"
        echo "  - GOOGLE_CLIENT_ID (from Google Cloud Console)"
        echo "  - GOOGLE_CLIENT_SECRET (from Google Cloud Console)"
        echo ""
        read -p "Press Enter after you've configured the .env file..."
    fi
    
    print_success "Environment variables configured"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Check if already logged in
    if ! vercel whoami &> /dev/null; then
        print_status "Please log in to Vercel..."
        vercel login
    fi
    
    print_status "Deploying backend to Vercel..."
    vercel --prod
    
    print_success "Backend deployed to Vercel!"
    print_status "Don't forget to set environment variables in Vercel dashboard"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Check if already logged in
    if ! railway whoami &> /dev/null; then
        print_status "Please log in to Railway..."
        railway login
    fi
    
    print_status "Deploying to Railway..."
    railway up
    
    print_success "Backend deployed to Railway!"
}

# Deploy to Render
deploy_render() {
    print_status "Deploying to Render..."
    
    print_warning "For Render deployment:"
    echo "1. Go to https://render.com"
    echo "2. Create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Set build command: cd backend && npm install"
    echo "5. Set start command: cd backend && npm start"
    echo "6. Add environment variables in Render dashboard"
    echo ""
    read -p "Press Enter when you've set up the Render service..."
    
    print_success "Render deployment instructions provided"
}

# Setup Google OAuth
setup_google_oauth() {
    print_status "Setting up Google OAuth..."
    
    echo "To set up Google OAuth:"
    echo "1. Go to https://console.cloud.google.com"
    echo "2. Create a new project or select existing one"
    echo "3. Enable Google+ API"
    echo "4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID"
    echo "5. Set application type to 'Web application'"
    echo "6. Add authorized origins:"
    echo "   - http://localhost:8000 (for development)"
    echo "   - https://your-frontend-domain.com (for production)"
    echo "7. Add authorized redirect URIs:"
    echo "   - http://localhost:8000"
    echo "   - https://your-frontend-domain.com"
    echo "8. Copy Client ID and Client Secret to your .env file"
    echo ""
    read -p "Press Enter when you've set up Google OAuth..."
    
    print_success "Google OAuth setup instructions provided"
}

# Setup MongoDB Atlas
setup_mongodb() {
    print_status "Setting up MongoDB Atlas..."
    
    echo "To set up MongoDB Atlas:"
    echo "1. Go to https://cloud.mongodb.com"
    echo "2. Create a free cluster"
    echo "3. Create a database user with read/write permissions"
    echo "4. Get your connection string"
    echo "5. Add the connection string to your .env file as MONGODB_URI"
    echo ""
    read -p "Press Enter when you've set up MongoDB Atlas..."
    
    print_success "MongoDB Atlas setup instructions provided"
}

# Update frontend API URL
update_frontend_api() {
    print_status "Updating frontend API URL..."
    
    echo "After deploying your backend, update the API URL in app.js:"
    echo "Change this line in app.js:"
    echo "  this.apiUrl = 'http://localhost:3001/api';"
    echo "To your deployed backend URL, for example:"
    echo "  this.apiUrl = 'https://your-app.vercel.app/api';"
    echo ""
    read -p "Press Enter when you've updated the API URL..."
    
    print_success "Frontend API URL update instructions provided"
}

# Main deployment menu
main_menu() {
    echo ""
    echo "Choose deployment platform:"
    echo "1. Vercel (Recommended for frontend + backend)"
    echo "2. Railway (Full-stack with database)"
    echo "3. Render (Alternative to Heroku)"
    echo "4. Setup Google OAuth"
    echo "5. Setup MongoDB Atlas"
    echo "6. Update frontend API URL"
    echo "7. Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
    
    case $choice in
        1)
            check_dependencies
            install_backend_deps
            setup_env
            deploy_vercel
            ;;
        2)
            check_dependencies
            install_backend_deps
            setup_env
            deploy_railway
            ;;
        3)
            check_dependencies
            install_backend_deps
            setup_env
            deploy_render
            ;;
        4)
            setup_google_oauth
            ;;
        5)
            setup_mongodb
            ;;
        6)
            update_frontend_api
            ;;
        7)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please try again."
            main_menu
            ;;
    esac
}

# Run the script
main_menu 