#!/bin/bash

# Configuration
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"

case "$1" in
    setup)
        echo "Installing Backend dependencies..."
        cd $BACKEND_DIR && npm install && cd ..
        echo "Installing Frontend dependencies..."
        cd $FRONTEND_DIR && npm install && cd ..
        echo "Setup complete."
        ;;
    dev)
        echo "Starting Backend and Frontend..."
        # Using npx to run concurrently without requiring a global install
        npx concurrently \
            --names "BACKEND,FRONTEND" \
            --prefix-colors "blue,magenta" \
            "cd $BACKEND_DIR && node server.js" \
            "cd $FRONTEND_DIR && npm run dev"
        ;;
    build)
        echo "Building Frontend for production..."
        cd $FRONTEND_DIR && npm run build
        ;;
    )
        echo "Usage: $0 {setup|dev|build}"
        exit 1
        ;;
esac