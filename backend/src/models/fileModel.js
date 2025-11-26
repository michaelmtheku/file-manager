import initDb from '../db/migrations/init.js';
import { randomUUID } from 'crypto';
import { DB_FILE_PATH } from '../db/index.js';

// initialize DB and schema
const db = initDb();

// helper to convert DB row to JS file object
// The entire original file object is stored in the metadata column as JSON
function rowToFile(row) {
  if (!row) return null;
  // Parse the metadata column which stores the complete file object
  const fileData = row.metadata ? JSON.parse(row.metadata) : {};
  // Ensure id is always present from the primary key
  fileData.id = row.id;
  return fileData;
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
    `INSERT INTO files (id, filename, owner, size, mime, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`
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

export function createUser({
  id = randomUUID(),
  name = '',
  email = '',
  passwordHash = null,
  createdAt = null,
}) {
  const created_at = Date.now();
  const stmt = db.prepare(
    'INSERT INTO users (id, name, email, passwordHash, createdAt, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  stmt.run(id, name, email, passwordHash, createdAt, created_at);
  return { id, name, email, passwordHash, createdAt, created_at };
}

/* Compatibility wrappers for old metadata.json API
   - loadMetadata(): returns { users: [...], files: [...] }
   - saveMetadata(obj): replaces DB contents with provided object (atomic transaction)
*/
export function loadMetadata() {
  return {
    users: listUsers(),
    files: listFiles(),
  };
}

export function saveMetadata({ users = [], files = [] } = {}) {
  // Replace DB contents in a transaction: clear tables then insert provided rows
  const tx = db.transaction((uRows, fRows) => {
    db.prepare('DELETE FROM files').run();
    db.prepare('DELETE FROM users').run();

    const insertUser = db.prepare(
      'INSERT INTO users (id, name, email, passwordHash, createdAt, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const u of uRows) {
      const id = u.id || randomUUID();
      const name = u.name || '';
      const email = u.email || '';
      const passwordHash = u.passwordHash || null;
      const createdAt = u.createdAt || null;
      const created_at = u.created_at || Date.now();
      insertUser.run(id, name, email, passwordHash, createdAt, created_at);
    }

    const insertFile = db.prepare(
      'INSERT INTO files (id, filename, owner, size, mime, created_at, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const f of fRows) {
      const id = f.id || randomUUID();
      // Extract some common fields for indexing, but store the complete object in metadata
      const filename = f.originalName || f.filename || f.name || '';
      const owner = f.ownerId || f.owner || null;
      const size = f.size || 0;
      const mime = f.mimeType || f.mime || '';
      const created_at = f.created_at || Date.now();
      // Store the entire file object as JSON in the metadata column
      insertFile.run(id, filename, owner, size, mime, created_at, JSON.stringify(f));
    }
  });

  tx(users, files);
  return loadMetadata();
}

/* Export DB path for compatibility with code that used metadataPath */
export const metadataPath = DB_FILE_PATH;

/* export db for advanced usage */
export { db as database };
