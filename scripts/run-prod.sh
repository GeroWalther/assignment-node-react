#!/bin/bash

# 🚀 Run Production Images from Docker Hub
# Uses your pre-built images for lightning-fast startup

echo "🐳 Starting ItemStore Pro with Docker Hub images..."
echo "📦 Using images:"
echo "   - gero253/assessment-frontend:latest"
echo "   - gero253/assessment-mern:latest"
echo "   - mongo:7.0 (database)"
echo "   - mongo-express:1.0.2 (database UI)"
echo ""
echo "⚡ Lightning fast startup - no building required!"
echo ""

# Pull latest images first (optional, but ensures you have latest)
echo "📥 Pulling latest images from Docker Hub..."
docker compose -f docker-compose.prod.yml pull

echo ""
echo "🚀 Starting all services..."

# Start all services
docker compose -f docker-compose.prod.yml up

echo ""
echo "🎉 Production environment started!"
echo "🌐 Access points:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:4001/api"
echo "   Database UI: http://localhost:8081"
echo ""
echo "💡 Using production images - optimized for performance!"
echo "🛑 Press Ctrl+C to stop all services"
