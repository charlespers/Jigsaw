#!/bin/bash

# Quick start script for Jigsaw backend

echo "Starting Jigsaw Backend Server..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the server
echo ""
echo "Starting server on http://localhost:3001"
echo "Press Ctrl+C to stop"
echo ""
python app.py

