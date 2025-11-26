import express from 'express';
import { loadMetadata } from '../models/fileModel.js';

const router = express.Router();

/**
 * GET /api/info
 * Returns backend info and simple counts for users/files.
 */
router.get('/info', (req, res, next) => {
  try {
    const metadata = loadMetadata() || {};
    const usersCount = Array.isArray(metadata.users) ? metadata.users.length : 0;
    const filesCount = Array.isArray(metadata.files) ? metadata.files.length : 0;

    res.status(200).json({
      backend: 'file-manager-backend',
      counts: {
        users: usersCount,
        files: filesCount,
      },
    });
  } catch (err) {
    // forward to generic error handler
    next(err);
  }
});

export default router;
