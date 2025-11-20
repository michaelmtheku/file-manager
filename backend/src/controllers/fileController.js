import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import {
  loadMetadata,
  saveMetadata
} from '../models/fileModel.js';

export function uploadFiles(req, res, next) {
  try {
    const parentFolder = req.body.parentFolder || null;
    const db = loadMetadata();
    const now = new Date().toISOString();

    const newFiles = req.files.map(f => {
      const fileRecord = {
        id: uuid(),
        originalName: f.originalname,
        storedName: path.basename(f.path),
        mimeType: f.mimetype,
        size: f.size,
        parentFolder,
        ownerId: req.user.id,
        createdAt: now,
        updatedAt: now
      };
      db.files.push(fileRecord);
      return fileRecord;
    });
    saveMetadata(db);
    res.status(201).json({ files: newFiles });
  } catch (e) {
    next(e);
  }
}

export function listFiles(req, res, next) {
  try {
    const folder = req.query.folder || null;
    const db = loadMetadata();
    const files = db.files.filter(f => f.parentFolder === folder && f.ownerId === req.user.id);
    res.json({ files });
  } catch (e) {
    next(e);
  }
}

export function getFileMetadata(req, res, next) {
  try {
    const db = loadMetadata();
    const file = db.files.find(f => f.id === req.params.id && f.ownerId === req.user.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
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
    const file = db.files.find(f => f.id === req.params.id && f.ownerId === req.user.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
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
    const file = db.files.find(f => f.id === req.params.id && f.ownerId === req.user.id);
    if (!file) return res.status(404).json({ message: 'Not found' });
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
    const idx = db.files.findIndex(f => f.id === req.params.id && f.ownerId === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    const [file] = db.files.splice(idx, 1);
    // Remove physical file
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