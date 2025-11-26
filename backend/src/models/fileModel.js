import initDb from '../db/migrations/init.js';
import { randomUUID } from 'crypto';
import { DB_FILE_PATH } from '../db/index.js';

// initialize DB and schema
const db = initDb();

// helper to convert DB row to JS object
function rowToFile(row) {
  if (!row) return null;
  return {
    id: row.id,
    filename: row.filename,
    owner: row.owner,
    size: row.size,
    mime: row.mime,
    created_at: row.created_at,
    metadata: row.metadata ? JSON.parse(row.metadata) : {}
  };
}

/* Files API */
export function listFiles() {
  const stmt = db.prepare('SELECT * FROM files ORDER BY created_at DESC');
  return stmt.all().map(rowToFile);
}

export function getFileById(id) {
  const stmt = db.prepare('SELECT * FROM files WHERE id = ?');
  return rowToFile(stmt.get(id));
}

export function createFile({ filename, owner = null, size = 0, mime = '', metadata = {} }) {
  const id = randomUUID();
  const created_at = Date.now();
  const stmt = db.prepare(
    \`INSERT INTO files (id, filename, owner, size, mime, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)\`
  );
  stmt.run(id, filename, owner, size, mime, created_at, JSON.stringify(metadata || {}));
  return getFileById(id);
}

export function deleteFile(id) {
  const stmt = db.prepare('DELETE FROM files WHERE id = ?');
  const info = stmt.run(id);
  return info.changes > 0;
}

/* Users API */
export function listUsers() {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all();
}

export function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) || null;
}

export function createUser({ id = randomUUID(), name = '', email = '' }) {
  const created_at = Date.now();
  const stmt = db.prepare('INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)');
  stmt.run(id, name, email, created_at);
  return { id, name, email, created_at };
}

/* Compatibility wrappers for old metadata.json API
   - loadMetadata(): returns { users: [...], files: [...] }
   - saveMetadata(obj): replaces DB contents with provided object (atomic transaction)
*/
export function loadMetadata() {
  return {
    users: listUsers(),
    files: listFiles()
  };
}

export function saveMetadata({ users = [], files = [] } = {}) {
  // Replace DB contents in a transaction: clear tables then insert provided rows
  const tx = db.transaction((uRows, fRows) => {
    db.prepare('DELETE FROM files').run();
    db.prepare('DELETE FROM users').run();

    const insertUser = db.prepare('INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)');
    for (const u of uRows) {
      const id = u.id || randomUUID();
      const name = u.name || '';
      const email = u.email || '';
      const created_at = u.created_at || Date.now();
      insertUser.run(id, name, email, created_at);
    }

    const insertFile = db.prepare(
      'INSERT INTO files (id, filename, owner, size, mime, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const f of fRows) {
      const id = f.id || randomUUID();
      const filename = f.filename || f.name || '';
      const owner = f.owner || null;
      const size = f.size || 0;
      const mime = f.mime || '';
      const created_at = f.created_at || Date.now();
      const metadata = f.metadata ? JSON.stringify(f.metadata) : '{}';
      insertFile.run(id, filename, owner, size, mime, created_at, metadata);
    }
  });

  tx(users, files);
  return loadMetadata();
}

/* Export DB path for compatibility with code that used metadataPath */
export const metadataPath = DB_FILE_PATH;

/* export db for advanced usage */
export { db as database };
