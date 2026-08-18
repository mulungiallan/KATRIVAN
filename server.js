// Minimal static file server that reliably binds to 0.0.0.0.
// Replaces the "http-server" npm package, whose "-a 0.0.0.0" flag was not
// binding to all interfaces in this environment, resulting in the server
// only being reachable on 127.0.0.1 / the internal Railway IP (502s on the
// public domain).
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 8000;
const HOST = "0.0.0.0";
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Internal Server Error");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Prevent path traversal outside the served root.
  const safeSuffix = path.normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(ROOT, safeSuffix);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.access(filePath, fs.constants.R_OK, (accessErr) => {
      if (accessErr) {
        // Fall back to index.html for the root/unknown paths (SPA-style).
        const fallback = path.join(ROOT, "index.html");
        fs.access(fallback, fs.constants.R_OK, (fallbackErr) => {
          if (fallbackErr) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not Found");
          } else {
            sendFile(res, fallback);
          }
        });
        return;
      }
      sendFile(res, filePath);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
