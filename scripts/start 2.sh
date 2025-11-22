#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
max_attempts=60
attempt=0

# Try to find pg_isready in common locations, or use nc as fallback
PG_ISREADY=$(which pg_isready 2>/dev/null || find /usr -name pg_isready 2>/dev/null | head -1)

if [ -n "$PG_ISREADY" ]; then
  until "$PG_ISREADY" -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
      echo "PostgreSQL failed to become ready after $max_attempts attempts"
      exit 1
    fi
    echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
    sleep 1
  done
else
  # Fallback: use nc (netcat) to test TCP connection
  until nc -z "${DB_HOST:-postgres}" "${DB_PORT:-5432}" > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
      echo "PostgreSQL failed to become ready after $max_attempts attempts"
      exit 1
    fi
    echo "PostgreSQL is unavailable - sleeping (attempt $attempt/$max_attempts)"
    sleep 1
  done
  # Give PostgreSQL a moment to fully initialize after TCP is available
  sleep 2
fi

echo "PostgreSQL is up - running migrations..."

# Run migrations (only runs pending migrations, safe to run multiple times)
# Use NODE_ENV to ensure we're in the right context
NODE_ENV=development npm run migration:run 2>&1

# Check if migrations ran successfully
MIGRATION_EXIT_CODE=$?
if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
  echo "Migrations completed successfully"
else
  echo "Migration failed with exit code $MIGRATION_EXIT_CODE"
  echo "Continuing anyway - migrations may have already been applied"
  # Don't exit on migration failure - allows app to start even if migrations were already applied
fi

# Start the application
echo "Starting application..."
exec npm run start:dev

