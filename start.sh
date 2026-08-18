#!/bin/sh
set -e

# Ensure INDEX.html is served as the default landing page.
# http-server (and most static servers) look for a lowercase "index.html"
# by default, so we create it as a copy of INDEX.html if it doesn't already exist.
if [ ! -f "index.html" ]; then
  cp "INDEX.html" "index.html"
fi

# Serve the current directory on Railway's default port (8000) using a
# minimal Node.js static file server (server.js) that binds explicitly to
# 0.0.0.0. The "http-server" npm package's "-a 0.0.0.0" flag was not
# reliably binding to all interfaces, which left the server reachable only
# on 127.0.0.1 / the internal Railway IP and caused 502s on the public
# domain.
exec node server.js
