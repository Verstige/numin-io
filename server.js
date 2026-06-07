import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const distPath = join(__dirname, 'dist');

// Serve static assets from /assets/* — no fallback, let nginx/CDN handle
app.use('/assets', express.static(distPath, { maxAge: '1y', immutable: true }));

// Serve other static files (favicon, manifest, etc.)
app.use(express.static(distPath, { maxAge: '0' }));

// SPA fallback — only for non-asset, non-file routes
app.use((req, res) => {
  // Only serve index.html for actual page routes, not file requests
  if (!req.path.includes('.') && !req.path.startsWith('/assets')) {
    res.sendFile(join(distPath, 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, () => {
  console.log(`Numin running on port ${PORT}`);
});