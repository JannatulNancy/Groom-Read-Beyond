import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories
const DATA_DIR = path.resolve(__dirname, 'data');
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const UPLOADS_DIR = path.resolve(PUBLIC_DIR, 'uploads');
const IMAGES_DIR = path.resolve(PUBLIC_DIR, 'images');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

// Copy assets to public if needed
const ASSETS_IMAGES_DIR = path.resolve(__dirname, 'src', 'assets', 'images');
if (fs.existsSync(ASSETS_IMAGES_DIR)) {
  try {
    const files = fs.readdirSync(ASSETS_IMAGES_DIR);
    for (const f of files) {
      const srcPath = path.join(ASSETS_IMAGES_DIR, f);
      const destPath = path.join(IMAGES_DIR, f);
      if (!fs.existsSync(destPath) && fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  } catch (e) {
    console.warn('Notice: asset images sync warning', e);
  }
}

// Serve public static assets (images, uploads, icons)
app.use('/images', express.static(IMAGES_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(PUBLIC_DIR));

// Also alias /src/assets/images to /images so any legacy links resolve
app.use('/src/assets/images', express.static(IMAGES_DIR));

// -------------------------------------------------------------
// Shared Server State (Disk Files)
// -------------------------------------------------------------
const CONTENT_FILE = path.join(DATA_DIR, 'siteContent.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const META_FILE = path.join(DATA_DIR, 'meta.json');

let serverRevision = Date.now();
interface ClientConnection {
  id: number;
  res: Response;
}
let sseClients: ClientConnection[] = [];
let nextClientId = 1;

function broadcastUpdate(entity: 'content' | 'books' | 'orders' | 'all') {
  serverRevision = Date.now();
  const payload = `data: ${JSON.stringify({ type: 'update', entity, revision: serverRevision })}\n\n`;
  sseClients.forEach((c) => {
    try {
      c.res.write(payload);
    } catch {
      // ignore
    }
  });
}

// -------------------------------------------------------------
// SSE & Polling Endpoints for Real-Time Client/Customer Auto-Sync
// -------------------------------------------------------------
app.get('/api/sync/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = nextClientId++;
  const client = { id: clientId, res };
  sseClients.push(client);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'init', revision: serverRevision })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

app.get('/api/sync/poll', (_req: Request, res: Response) => {
  res.json({ revision: serverRevision });
});

// -------------------------------------------------------------
// Site Content API
// -------------------------------------------------------------
app.get('/api/content', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = fs.readFileSync(CONTENT_FILE, 'utf-8');
      return res.json({ success: true, content: JSON.parse(data), source: 'server_disk' });
    }
  } catch (err) {
    console.error('Error reading content file:', err);
  }
  return res.json({ success: false, content: null, source: 'none' });
});

app.post('/api/content', (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content required' });
    }
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
    broadcastUpdate('content');
    return res.json({ success: true, message: 'Content saved to server database & broadcast live', revision: serverRevision });
  } catch (err: any) {
    console.error('Error saving content:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Books API
// -------------------------------------------------------------
app.get('/api/books', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(BOOKS_FILE)) {
      const data = fs.readFileSync(BOOKS_FILE, 'utf-8');
      return res.json({ success: true, books: JSON.parse(data), source: 'server_disk' });
    }
  } catch (err) {
    console.error('Error reading books file:', err);
  }
  return res.json({ success: false, books: null, source: 'none' });
});

app.post('/api/books', (req: Request, res: Response) => {
  try {
    const { books } = req.body;
    if (!Array.isArray(books)) {
      return res.status(400).json({ success: false, message: 'Books array required' });
    }
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2), 'utf-8');
    broadcastUpdate('books');
    return res.json({ success: true, message: 'Books saved to server database & broadcast live', revision: serverRevision });
  } catch (err: any) {
    console.error('Error saving books:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Orders API
// -------------------------------------------------------------
app.get('/api/orders', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return res.json({ success: true, orders: JSON.parse(data), source: 'server_disk' });
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return res.json({ success: false, orders: null, source: 'none' });
});

app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, message: 'Orders array required' });
    }
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    broadcastUpdate('orders');
    return res.json({ success: true, message: 'Orders saved to server database & broadcast live', revision: serverRevision });
  } catch (err: any) {
    console.error('Error saving orders:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
});

// -------------------------------------------------------------
// Image Upload API (Saves Base64/Files to public/uploads disk)
// -------------------------------------------------------------
app.post('/api/upload-image', (req: Request, res: Response) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'dataUrl string required' });
    }

    // Match data:image/png;base64,...
    const matches = dataUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image data URI' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanName = (filename || 'upload')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const uniqueFileName = `${cleanName}_${Date.now()}.${ext}`;
    const targetFilePath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(targetFilePath, buffer);
    const publicUrl = `/uploads/${uniqueFileName}`;

    return res.json({
      success: true,
      url: publicUrl,
      sizeKb: Math.round(buffer.length / 1024),
    });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed saving image' });
  }
});

// -------------------------------------------------------------
// Dev & Production Middleware Setup
// -------------------------------------------------------------
async function setupServer() {
  if (!isProduction) {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist folder
    const DIST_DIR = path.resolve(__dirname, 'dist');
    app.use(express.static(DIST_DIR));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(DIST_DIR, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BizVenture Server] Running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

setupServer().catch((err) => {
  console.error('[BizVenture Server] Fatal startup error:', err);
  process.exit(1);
});
