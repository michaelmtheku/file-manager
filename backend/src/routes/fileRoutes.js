import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from 'dotenv';
import {
  uploadFiles,
  listFiles,
  deleteFile,
  renameFile,
  moveFile,
  getFileMetadata
} from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';

config();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads'),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

const router = Router();

router.get('/', authenticate, listFiles);
router.get('/:id', authenticate, getFileMetadata);
router.post('/upload', authenticate, upload.array('files', 10), uploadFiles);
router.patch('/:id/rename', authenticate, renameFile);
router.patch('/:id/move', authenticate, moveFile);
router.delete('/:id', authenticate, deleteFile);

export default router;