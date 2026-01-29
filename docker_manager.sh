#!/bin/bash

# Configuration
IMAGE_NAME="devhaxcodes/ev-tracker:latest"
DOCKER_USER="devhaxcodes"
DOCKER_PASS="Docker@123"

echo "======================================"
echo "   EV-Tracker Docker Management Script"
echo "======================================"
echo "1) Build Images"
echo "2) Run Containers (Local)"
echo "3) Push to Docker Hub (Not implemented for multi-service)"
echo "4) Pull from Docker Hub (Not implemented)"
echo "5) Exit"
echo "======================================"
read -p "Select an option [1-5]: " choice

case $choice in
    1)
        echo "🚀 Building Docker images..."
        docker compose build --no-cache
        ;;
    2)
        echo "🏃 Starting containers using docker-compose..."
        docker compose up
        echo "✅ App is running at http://localhost:3000"
        ;;
    3)
        echo "🔑 Logging into Docker Hub..."
        echo "$DOCKER_PASS" | docker login --username "$DOCKER_USER" --password-stdin
        echo "⬆️ Pushing images defined in docker-compose.yml..."
        docker compose push
        ;;
    4)
        echo "⬇️ Pulling images..."
        docker compose pull
        ;;
    5)
        echo "Bye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac
