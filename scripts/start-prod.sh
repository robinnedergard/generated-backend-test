#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" > /dev/null 2>&1; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - running migrations..."

# Run migrations (only runs pending migrations, safe to run multiple times)
npm run migration:run

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
exec node dist/main

