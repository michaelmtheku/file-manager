import jwt from 'jsonwebtoken';
import { loadMetadata } from '../models/fileModel.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const db = loadMetadata();
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { id: user.id, email: user.email };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
