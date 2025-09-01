#!/bin/bash

# 🚀 Development Environment Script
# One command to rule them all!

echo "🐳 Starting ItemStore Pro Development Environment..."
echo "📦 This will start:"
echo "   - MongoDB (port 27017)"
echo "   - Mongo Express UI (port 8081)"
echo "   - Backend API with hot reload (port 4001)"
echo "   - Frontend with hot reload (port 3000)"
echo ""

# Build and start all services
docker compose -f docker-compose.dev.yml up --build

echo "🎉 Development environment started!"
echo "🌐 Access points:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:4001/api"
echo "   Database UI: http://localhost:8081"
echo ""
echo "💡 Hot reload is enabled - your changes will be reflected automatically!"
echo "🛑 Press Ctrl+C to stop all services"
