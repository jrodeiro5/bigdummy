#!/bin/bash

echo "Starting BigDummy Development Environment..."
echo

# Function to clean up background processes on exit
cleanup() {
  echo "Stopping all services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

# Set up trap to catch Ctrl+C and other termination signals
trap cleanup INT TERM EXIT

echo "[1/2] Starting Flask Backend..."
python -m api.app &
BACKEND_PID=$!
echo

echo "[2/2] Starting React Frontend..."
npm run dev &
FRONTEND_PID=$!
echo

echo "BigDummy Dev Environment is running!"
echo
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop all services..."

# Wait for processes to finish (or for user to press Ctrl+C)
wait
