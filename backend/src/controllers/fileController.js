import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { loadMetadata, saveMetadata } from '../models/fileModel.js';
import { hasReadAccess, hasWriteAccess } from '../utils/accessControl.js';

export function uploadFiles(req, res, next) {
  try {
    const parentFolder = req.body.parentFolder || null;
    const db = loadMetadata();
    const now = new Date().toISOString();

    const newFiles = req.files.map((f) => ({
      id: uuid(),
      originalName: f.originalname,
      storedName: path.basename(f.path),
      mimeType: f.mimetype,
      size: f.size,
      parentFolder,
      ownerId: req.user.id,
      sharedWith: [],
      createdAt: now,
      updatedAt: now,
    }));

    db.files.push(...newFiles);
    saveMetadata(db);
    res.status(201).json({ files: newFiles });
  } catch (e) {
    next(e);
  }
}

export function listFiles(req, res, next) {
  try {
    const scope = req.query.scope || 'all'; // all | owned | shared
    const folder = req.query.folder || null;
    const db = loadMetadata();

    let files = db.files.filter((f) => f.parentFolder === folder);

    if (scope === 'owned') {
      files = files.filter((f) => f.ownerId === req.user.id);
    } else if (scope === 'shared') {
      files = files.filter((f) => f.ownerId !== req.user.id && hasReadAccess(req.user.id, f));
    } else {
      files = files.filter((f) => hasReadAccess(req.user.id, f));
    }

    res.json({ files });
  } catch (e) {
    next(e);
  }
}

export function getFileMetadata(req, res, next) {
  try {
    const db = loadMetadata();
    const file = db.files.find((f) => f.id === req.params.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
    if (!hasReadAccess(req.user.id, file)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json({ file, rawUrl: `/files/raw/${file.storedName}` });
  } catch (e) {
    next(e);
  }
}

export function renameFile(req, res, next) {
  try {
    const { newName } = req.body;
    if (!newName) return res.status(400).json({ message: 'newName required' });
    const db = loadMetadata();
    const file = db.files.find((f) => f.id === req.params.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
    if (!hasWriteAccess(req.user.id, file)) return res.status(403).json({ message: 'Forbidden' });
    file.originalName = newName;
    file.updatedAt = new Date().toISOString();
    saveMetadata(db);
    res.json({ file });
  } catch (e) {
    next(e);
  }
}

export function moveFile(req, res, next) {
  try {
    const { targetFolder } = req.body;
    const db = loadMetadata();
    const file = db.files.find((f) => f.id === req.params.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
    if (!hasWriteAccess(req.user.id, file)) return res.status(403).json({ message: 'Forbidden' });
    file.parentFolder = targetFolder || null;
    file.updatedAt = new Date().toISOString();
    saveMetadata(db);
    res.json({ file });
  } catch (e) {
    next(e);
  }
}

export function deleteFile(req, res, next) {
  try {
    const db = loadMetadata();
    const idx = db.files.findIndex((f) => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    const file = db.files[idx];
    if (!hasWriteAccess(req.user.id, file)) return res.status(403).json({ message: 'Forbidden' });

    db.files.splice(idx, 1);
    try {
      fs.unlinkSync(path.join(process.env.UPLOAD_DIR || 'uploads', file.storedName));
    } catch {
      // ignore
    }
    saveMetadata(db);
    res.json({ message: 'Deleted', id: file.id });
  } catch (e) {
    next(e);
  }
}
