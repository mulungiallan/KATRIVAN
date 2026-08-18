#!/bin/sh
set -e

# Ensure INDEX.html is served as the default landing page.
# http-server (and most static servers) look for a lowercase "index.html"
# by default, so we create it as a copy of INDEX.html if it doesn't already exist.
if [ ! -f "index.html" ]; then
  cp "INDEX.html" "index.html"
fi

# Serve the current directory on Railway's default port (8000) using the
# Node.js "http-server" npm package (installed via package.json), since
# Python is not available in the runtime container.
exec npx --no-install http-server . -p 8000 -a 0.0.0.0
