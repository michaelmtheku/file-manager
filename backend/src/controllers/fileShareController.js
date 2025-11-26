import { loadMetadata, saveMetadata } from '../models/fileModel.js';

function findUserByEmail(db, email) {
  return db.users.find((u) => u.email === email);
}

export function shareFile(req, res) {
  const { email, access = 'read' } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });

  const db = loadMetadata();
  const file = db.files.find((f) => f.id === req.params.id);
  if (!file) return res.status(404).json({ message: 'File not found' });

  if (file.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Only owner can share' });
  }

  const targetUser = findUserByEmail(db, email);
  if (!targetUser) return res.status(404).json({ message: 'User to share with not found' });
  if (targetUser.id === file.ownerId) {
    return res.status(400).json({ message: 'Cannot share with owner' });
  }

  const existing = file.sharedWith.find((s) => s.userId === targetUser.id);
  if (existing) {
    existing.access = access;
  } else {
    file.sharedWith.push({ userId: targetUser.id, access });
  }

  file.updatedAt = new Date().toISOString();
  saveMetadata(db);
  res.json({ file });
}

export function unshareFile(req, res) {
  const { userId, email } = req.body;
  if (!userId && !email) {
    return res.status(400).json({ message: 'userId or email required' });
  }

  const db = loadMetadata();
  const file = db.files.find((f) => f.id === req.params.id);
  if (!file) return res.status(404).json({ message: 'File not found' });

  if (file.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Only owner can unshare' });
  }

  let targetId = userId;
  if (!targetId && email) {
    const user = db.users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    targetId = user.id;
  }

  const before = file.sharedWith.length;
  file.sharedWith = file.sharedWith.filter((s) => s.userId !== targetId);
  if (file.sharedWith.length === before) {
    return res.status(404).json({ message: 'Share entry not found' });
  }

  file.updatedAt = new Date().toISOString();
  saveMetadata(db);
  res.json({ file });
}

export function listFileShares(req, res) {
  const db = loadMetadata();
  const file = db.files.find((f) => f.id === req.params.id);
  if (!file) return res.status(404).json({ message: 'File not found' });
  if (file.ownerId !== req.user.id) {
    return res.status(403).json({ message: 'Only owner can view shares' });
  }
  const shares = file.sharedWith.map((s) => {
    const u = db.users.find((x) => x.id === s.userId);
    return { userId: s.userId, email: u?.email || '(deleted)', access: s.access };
  });
  res.json({ shares });
}
