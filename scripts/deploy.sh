#!/bin/bash

# KЁLTISON Deployment Script

set -e

echo "🚀 Deploying KЁLTISON Mini App..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("TELEGRAM_BOT_TOKEN" "JWT_SECRET" "WEBAPP_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t keltison-miniapp .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if application is running
echo "🔍 Checking application health..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Application is running!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Application failed to start"
        docker-compose logs app
        exit 1
    fi
    echo "Waiting for application... ($i/30)"
    sleep 2
done

# Show logs
echo "📋 Application logs:"
docker-compose logs --tail=20 app

echo ""
echo "🎉 KЁLTISON Mini App deployed successfully!"
echo ""
echo "📱 Application URL: ${WEBAPP_URL:-http://localhost:3000}"
echo "🔧 Admin Panel: ${WEBAPP_URL:-http://localhost:3000}/admin"
echo "📊 Health Check: ${WEBAPP_URL:-http://localhost:3000}/health"
echo ""
echo "🤖 Telegram Bot Setup:"
echo "1. Go to @BotFather in Telegram"
echo "2. Create a new bot or use existing bot"
echo "3. Set WebApp URL: ${WEBAPP_URL:-http://localhost:3000}"
echo "4. Use the bot token in your .env file"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f app"
echo "  Stop app: docker-compose down"
echo "  Restart app: docker-compose restart app"
echo "  Update app: ./scripts/deploy.sh"
