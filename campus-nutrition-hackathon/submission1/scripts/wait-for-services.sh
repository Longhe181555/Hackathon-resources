#!/bin/sh
set -e



# Wait for backend (max 10 attempts)
max_attempts=10
attempt=1
while ! wget -qO- http://back-end:3000/ > /dev/null; do
  echo "Waiting for backend... (attempt $attempt/$max_attempts)"
  if [ $attempt -ge $max_attempts ]; then
    echo "Backend did not become available after $max_attempts attempts. Exiting."
    exit 1
  fi
  attempt=$((attempt+1))
  sleep 2
done

# Wait for frontend (max 10 attempts)
attempt=1
while ! wget -qO- http://front-end:3000 > /dev/null; do
  echo "Waiting for frontend... (attempt $attempt/$max_attempts)"
  if [ $attempt -ge $max_attempts ]; then
    echo "Frontend did not become available after $max_attempts attempts. Exiting."
    exit 1
  fi
  attempt=$((attempt+1))
  sleep 2
done

echo "Both backend and frontend are up! Running k6 test..."
exec k6 run /scripts/hidden-test.js --summary-export=/scripts/score.json
