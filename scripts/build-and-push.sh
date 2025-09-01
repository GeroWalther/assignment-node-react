#!/bin/bash

# 🚀 Build and Push Docker Images to Docker Hub
# This script builds production images and pushes them to your Docker Hub repositories

set -e  # Exit on any error

# Configuration - Using your actual Docker Hub repositories
DOCKER_USERNAME="gero253"
FRONTEND_REPO="assessment-frontend"
BACKEND_REPO="assessment-mern"
IMAGE_TAG="latest"

echo "🐳 Building and pushing ItemStore Pro images to Docker Hub..."
echo "📦 Username: $DOCKER_USERNAME"
echo "🎯 Frontend repo: $FRONTEND_REPO"
echo "🎯 Backend repo: $BACKEND_REPO"
echo "🏷️  Tag: $IMAGE_TAG"
echo ""

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo "🔐 Logging into Docker Hub..."
    docker login
else
    echo "✅ Already logged into Docker Hub"
fi

echo ""
echo "🏗️  Building production images..."

# Build Backend Image
echo "📦 Building backend image..."
docker build -f backend/Dockerfile.prod -t $DOCKER_USERNAME/$BACKEND_REPO:$IMAGE_TAG ./backend

# Build Frontend Image  
echo "🎨 Building frontend image..."
docker build -f frontend/Dockerfile.prod -t $DOCKER_USERNAME/$FRONTEND_REPO:$IMAGE_TAG ./frontend

echo ""
echo "🚀 Pushing images to Docker Hub..."

# Push Backend Image
echo "📦 Pushing backend image..."
docker push $DOCKER_USERNAME/$BACKEND_REPO:$IMAGE_TAG

# Push Frontend Image
echo "🎨 Pushing frontend image..."
docker push $DOCKER_USERNAME/$FRONTEND_REPO:$IMAGE_TAG

echo ""
echo "✅ Images successfully pushed to Docker Hub!"
echo "📋 Your images are now available at:"
echo "   - https://hub.docker.com/r/$DOCKER_USERNAME/$BACKEND_REPO"
echo "   - https://hub.docker.com/r/$DOCKER_USERNAME/$FRONTEND_REPO"
echo ""
echo "🎯 To run with these images:"
echo "   docker compose -f docker-compose.prod.yml up"
echo ""
echo "💡 Images can now be pulled and run anywhere!"
