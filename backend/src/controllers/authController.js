import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { generateToken } from '../services/tokenService.js';
import { loadMetadata, saveMetadata } from '../models/fileModel.js';

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });
    const db = loadMetadata();
    if (db.users.find(u => u.email === email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { id: uuid(), email, passwordHash: hash, createdAt: new Date().toISOString() };
    db.users.push(user);
    saveMetadata(db);
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const db = loadMetadata();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    next(e);
  }
}

export function profile(req, res) {
  res.json({ user: { id: req.user.id, email: req.user.email } });
}