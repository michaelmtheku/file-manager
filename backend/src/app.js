import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');

// Static serving of uploaded files for previews
app.use('/files/raw', express.static(uploadDir));

app.use('/api', routes);
app.use(errorHandler);

export default app;