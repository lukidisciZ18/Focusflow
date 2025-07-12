#!/bin/bash

# FocusFlow Deployment Options Script
# This script provides multiple deployment options for FocusFlow

set -e

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup local development
setup_local() {
    print_status "Setting up local development environment..."
    
    # Check if backend directory exists
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found. Please run this script from the project root."
        exit 1
    fi
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Create .env file if it doesn't exist
    if [ ! -f "backend/.env" ]; then
        print_status "Creating .env file from template..."
        cp backend/env.example backend/.env
        print_warning "Please edit backend/.env with your MongoDB connection string"
    fi
    
    print_success "Local development environment setup complete"
}

# Function to start local development
start_local() {
    print_status "Starting local development servers..."
    
    # Start backend
    print_status "Starting backend server on port 3001..."
    cd backend
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait a moment for backend to start
    sleep 3
    
    # Start frontend
    print_status "Starting frontend server on port 8000..."
    python3 -m http.server 8000 &
    FRONTEND_PID=$!
    
    print_success "Servers started successfully!"
    print_status "Frontend: http://localhost:8000"
    print_status "Backend API: http://localhost:3001/api"
    print_status "Press Ctrl+C to stop servers"
    
    # Wait for interrupt
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
    wait
}

# Function to setup MongoDB
setup_mongodb() {
    print_status "Setting up MongoDB..."
    
    if command_exists brew; then
        print_status "Installing MongoDB using Homebrew..."
        brew tap mongodb/brew
        brew install mongodb-community
        brew services start mongodb-community
        print_success "MongoDB installed and started"
    else
        print_warning "Homebrew not found. Please install MongoDB manually:"
        print_status "1. Download from https://www.mongodb.com/try/download/community"
        print_status "2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
    fi
}

# Function to setup GitHub repository
setup_github() {
    print_status "Setting up GitHub repository..."
    
    if [ ! -d ".git" ]; then
        git init
        print_status "Git repository initialized"
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.production

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF
        print_status ".gitignore created"
    fi
    
    print_status "Ready to commit and push to GitHub"
    print_warning "Don't forget to:"
    print_status "1. git add ."
    print_status "2. git commit -m 'Initial commit'"
    print_status "3. git remote add origin https://github.com/yourusername/focusflow.git"
    print_status "4. git push -u origin main"
}

# Function to setup Vercel deployment
setup_vercel() {
    print_status "Setting up Vercel deployment..."
    
    if ! command_exists vercel; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_status "Login to Vercel (will open browser)..."
    vercel login
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Vercel deployment setup complete"
}

# Function to setup Railway deployment
setup_railway() {
    print_status "Setting up Railway deployment..."
    
    if ! command_exists railway; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    print_status "Login to Railway..."
    railway login
    
    print_status "Initializing Railway project..."
    cd backend
    railway init
    
    print_status "Deploying to Railway..."
    railway up
    
    cd ..
    print_success "Railway deployment setup complete"
}

# Function to setup Heroku deployment
setup_heroku() {
    print_status "Setting up Heroku deployment..."
    
    if ! command_exists heroku; then
        print_status "Installing Heroku CLI..."
        brew tap heroku/brew && brew install heroku
    fi
    
    print_status "Login to Heroku..."
    heroku login
    
    print_status "Creating Heroku app..."
    heroku create focusflow-backend
    
    print_status "Adding MongoDB addon..."
    heroku addons:create mongolab
    
    print_status "Setting environment variables..."
    heroku config:set NODE_ENV=production
    heroku config:set JWT_SECRET=$(openssl rand -base64 32)
    
    print_status "Deploying to Heroku..."
    git subtree push --prefix backend heroku main
    
    print_success "Heroku deployment setup complete"
}

# Function to setup Netlify deployment
setup_netlify() {
    print_status "Setting up Netlify deployment..."
    
    if ! command_exists netlify; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_status "Login to Netlify..."
    netlify login
    
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=public
    
    print_success "Netlify deployment setup complete"
}

# Function to test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test backend health
    if curl -s http://localhost:3001/api/health > /dev/null; then
        print_success "Backend is running"
    else
        print_error "Backend is not responding"
    fi
    
    # Test frontend
    if curl -s http://localhost:8000 > /dev/null; then
        print_success "Frontend is running"
    else
        print_error "Frontend is not responding"
    fi
}

# Function to show help
show_help() {
    echo "FocusFlow Deployment Options"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  local       Setup and start local development environment"
    echo "  setup       Setup prerequisites and dependencies"
    echo "  mongodb     Install and setup MongoDB"
    echo "  github      Setup GitHub repository"
    echo "  vercel      Deploy frontend to Vercel"
    echo "  railway     Deploy backend to Railway"
    echo "  heroku      Deploy backend to Heroku"
    echo "  netlify     Deploy frontend to Netlify"
    echo "  test        Test local deployment"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local     # Start local development"
    echo "  $0 setup     # Setup everything for local development"
    echo "  $0 vercel    # Deploy frontend to Vercel"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        "local")
            check_prerequisites
            setup_local
            start_local
            ;;
        "setup")
            check_prerequisites
            setup_local
            setup_mongodb
            setup_github
            print_success "Setup complete! Run '$0 local' to start development"
            ;;
        "mongodb")
            setup_mongodb
            ;;
        "github")
            setup_github
            ;;
        "vercel")
            setup_vercel
            ;;
        "railway")
            setup_railway
            ;;
        "heroku")
            setup_heroku
            ;;
        "netlify")
            setup_netlify
            ;;
        "test")
            test_deployment
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@" 