import { Router } from 'express';
import {
  createFolder,
  listFolders
} from '../controllers/folderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, listFolders);
router.post('/', authenticate, createFolder);

export default router;