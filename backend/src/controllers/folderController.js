import { v4 as uuid } from 'uuid';
import { loadMetadata, saveMetadata } from '../models/fileModel.js';

export function createFolder(req, res, next) {
  try {
    const { name, parentFolder } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const db = loadMetadata();
    const folder = {
      id: uuid(),
      name,
      parentFolder: parentFolder || null,
      ownerId: req.user.id,
      createdAt: new Date().toISOString(),
    };
    db.folders.push(folder);
    saveMetadata(db);
    res.status(201).json({ folder });
  } catch (e) {
    next(e);
  }
}

export function listFolders(req, res, next) {
  try {
    const parentFolder = req.query.parent || null;
    const db = loadMetadata();
    const folders = db.folders.filter(
      (f) => f.parentFolder === parentFolder && f.ownerId === req.user.id
    );
    res.json({ folders });
  } catch (e) {
    next(e);
  }
}
