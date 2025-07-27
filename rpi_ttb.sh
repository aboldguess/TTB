#!/bin/sh
# rpi_ttb.sh - Launch Transport Tycoon Basic on a Raspberry Pi.
# Usage: ./rpi_ttb.sh [-p] [PORT]
#   -p, --production  Install dependencies and run using production settings.
#   [PORT]            Optional HTTP port, defaults to 3000.

# Default values
PORT=3000
PROD=false

# Parse command line arguments
for arg in "$@"; do
  case $arg in
    -p|--production)
      PROD=true
      shift
      ;;
    *)
      PORT="$arg"
      shift
      ;;
  esac
done

# Install dependencies on first run
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  if [ "$PROD" = true ]; then
    npm install --production
  else
    npm install
  fi
fi

# Run the server in the requested mode
if [ "$PROD" = true ]; then
  NODE_ENV=production PORT="$PORT" node server.js
else
  PORT="$PORT" node server.js
fi
