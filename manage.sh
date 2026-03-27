#!/bin/bash

# Configuration
BACKEND_DIR="./Backend"

case "$1" in
    setup)
        echo "Installing Backend dependencies..."
        (cd "$BACKEND_DIR" && npm install)
        echo "Installing Frontend dependencies (repo root)..."
        npm install
        echo "Setup complete."
        ;;
    dev)
        echo "Starting Backend and Frontend..."
        npx concurrently \
            --names "BACKEND,FRONTEND" \
            --prefix-colors "blue,magenta" \
            "cd $BACKEND_DIR && node server.js" \
            "npm run dev"
        ;;
    build)
        echo "Building Frontend for production..."
        npm run build
        ;;
    *)
        echo "Usage: $0 {setup|dev|build}"
        exit 1
        ;;
esac
