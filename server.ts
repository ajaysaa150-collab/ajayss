import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './api/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Serve Frontend (Vite in dev, static files in production)
async function setupFrontend() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Brew & Bloom] Full-stack Server running at http://localhost:${port} in ${isDev ? 'development' : 'production'} mode`);
  });
}

setupFrontend().catch((err) => {
  console.error('[Brew & Bloom] Failed to start server:', err);
  process.exit(1);
});
