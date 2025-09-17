#!/bin/bash

# Bash script to start both frontend and backend in development mode

echo "🚀 Starting ToolTip Companion Development Environment"
echo ""

# Start backend in background
echo "📡 Starting Backend API..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
echo ""
echo "✅ Both services should be running:"
echo "   Backend API: http://localhost:3001"
echo "   Frontend: http://localhost:8082"
echo ""
echo "Press Ctrl+C to stop both services"

# Start frontend in foreground
cd .. && npm run dev

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM
