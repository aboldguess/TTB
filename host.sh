#!/bin/sh
# host.sh - Launch the Transport Tycoon Basic server on a Raspberry Pi.
# Usage: ./host.sh [PORT]
# The optional PORT argument sets the HTTP port. Defaults to 3000.

# Pick port from argument or use default
PORT="${1:-3000}"

# Ensure dependencies are installed. This check keeps first run simple.
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the server with the specified port
# PORT is an environment variable read in server.js
PORT="$PORT" node server.js
