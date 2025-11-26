import fs from 'fs';
import path from 'path';
import initDb from './init.js';
import { randomUUID } from 'crypto';

export default function importFromJson(filePath = path.resolve(process.cwd(), 'backend', 'metadata.json')) {
  if (!fs.existsSync(filePath)) {
    console.log('No metadata.json file found at', filePath);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  let data = {};
  try {
    data = JSON.parse(raw || '{}');
  } catch (e) {
    console.error('Failed to parse metadata.json:', e);
    throw e;
  }

  const db = initDb();

  const users = data.users || [];
  const files = data.files || [];

  const tx = db.transaction((uRows, fRows) => {
    const insertUser = db.prepare('INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)');
    for (const u of uRows) {
      const id = u.id || randomUUID();
      insertUser.run(id, u.name || '', u.email || '', u.created_at || Date.now());
    }

    const insertFile = db.prepare(
      'INSERT INTO files (id, filename, owner, size, mime, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const f of fRows) {
      insertFile.run(
        f.id || randomUUID(),
        f.filename || f.name || '',
        f.owner || null,
        f.size || 0,
        f.mime || '',
        f.created_at || Date.now(),
        JSON.stringify(f.metadata || {})
      );
    }
  });

  tx(users, files);
  console.log('Imported metadata.json into SQLite DB');
}