#!/bin/bash
# Script to update env.js in a running container
# Usage: ./update-env.sh <container_name> [env_file]

set -e

CONTAINER_NAME=$1
ENV_FILE=${2:-.env.production}

# Check if container name is provided
if [ -z "$CONTAINER_NAME" ]; then
  echo "Error: Container name is required"
  echo "Usage: ./update-env.sh <container_name> [env_file]"
  exit 1
fi

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file $ENV_FILE not found"
  exit 1
fi

echo "Updating env.js in container $CONTAINER_NAME using $ENV_FILE"

# Load environment variables
source $ENV_FILE

# Create env.js content
ENV_CONTENT=$(cat <<EOF
/**
 * Environment variables for browser
 * Generated on: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
 * This file is auto-generated and should not be modified directly
 */

window.env = {
  "NODE_ENV": "${NODE_ENV:-production}",
  "REACT_APP_API_URL": "${REACT_APP_API_URL:-/api}",
  "REACT_APP_CLICKPESA_API_KEY": "${REACT_APP_CLICKPESA_API_KEY:-}",
  "REACT_APP_ENCRYPTION_KEY": "${REACT_APP_ENCRYPTION_KEY:-}",
  "REACT_APP_ANALYTICS_KEY": "${REACT_APP_ANALYTICS_KEY:-}",
  "REACT_APP_SENTRY_DSN": "${REACT_APP_SENTRY_DSN:-}"
};
EOF
)

# Update env.js in the container
echo "$ENV_CONTENT" | docker exec -i $CONTAINER_NAME sh -c 'cat > /usr/share/nginx/html/env.js'

echo "env.js updated successfully in container $CONTAINER_NAME"
