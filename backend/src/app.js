import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import systemRoutes from './routes/systemRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import { ensureUploadDir } from './startup/ensureUploadDir.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

ensureUploadDir();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// System / health/info
app.use('/api', systemRoutes);

// Existing routers
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);

// Static raw file serving (adjust path as needed)
app.use('/files/raw', express.static(path.join(process.env.UPLOAD_DIR || 'uploads')));

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

export default app;