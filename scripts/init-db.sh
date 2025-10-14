#!/bin/bash

# KЁLTISON Database Initialization Script

set -e

echo "🔧 Initializing KЁLTISON database..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}"; do
    echo "PostgreSQL is unavailable - sleeping"
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Create database if it doesn't exist
echo "📊 Creating database if it doesn't exist..."
createdb -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" "${DB_NAME:-keltison_db}" 2>/dev/null || echo "Database already exists"

# Run schema
echo "🏗️ Running database schema..."
psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-postgres}" -d "${DB_NAME:-keltison_db}" -f /app/database/keltison_schema.sql

# Import sample data if provided
if [ -f "/app/database/keltison_sample_import.json" ]; then
    echo "📥 Importing sample data..."
    node /app/scripts/import-sample-data.js
fi

echo "✅ Database initialization completed!"
