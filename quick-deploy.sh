#!/bin/bash

# FocusFlow Quick Deploy Script
# This script sets up everything for local development and starts the servers

set -e

echo "🚀 FocusFlow Quick Deploy"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "app.js" ]; then
    echo "❌ Error: Please run this script from the FocusFlow project root directory"
    exit 1
fi

# Check if backend exists
if [ ! -d "backend" ]; then
    echo "❌ Error: Backend directory not found. Please ensure the backend is set up."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "🔧 Setting up environment..."
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "⚠️  Please edit backend/.env with your MongoDB connection string"
    echo "   For local MongoDB: mongodb://localhost:27017/focusflow"
    echo "   For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/focusflow"
fi

echo "🚀 Starting servers..."
echo "   Frontend: http://localhost:8000"
echo "   Backend:  http://localhost:3001/api"
echo ""
echo "Press Ctrl+C to stop servers"
echo ""

# Start backend
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
python3 -m http.server 8000 &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Wait for servers
wait 