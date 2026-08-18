#!/bin/sh
set -e

# Ensure INDEX.html is served as the default landing page.
# Python's http.server looks for a lowercase "index.html" by default,
# so we create it as a copy of INDEX.html if it doesn't already exist.
if [ ! -f "index.html" ]; then
  cp "INDEX.html" "index.html"
fi

# Serve the current directory on Railway's default port (8000).
exec python3 -m http.server 8000 --bind 0.0.0.0
