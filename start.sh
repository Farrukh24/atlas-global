#!/bin/bash
echo "🚀 ATLAS GLOBAL LOGISTICS - DOCKER LAUNCH"
echo "========================================"

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check Docker status
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi

# Create database folder if missing
mkdir -p ./database

# Check for SQL files (optional warning)
if [ -z "$(ls -A ./database/*.sql 2>/dev/null)" ]; then
    echo "⚠️  Warning: No SQL files found in ./database/"
    echo "   Ensure your schema.sql is placed there before launch if initializing from scratch."
fi

# Build and Launch
echo "📦 Building containers and launching ecosystem..."
docker-compose up -d --build

echo "✅ Atlas Global Logistics is now active!"
echo "----------------------------------------"
echo "🖥️  Web Dashboard: http://localhost:3001"
echo "📊 Backend API:   http://localhost:3000/docs"
echo "🔧 DB Admin:      http://localhost:8080"
echo "----------------------------------------"
echo "Use 'docker-compose logs -f' to view output."
