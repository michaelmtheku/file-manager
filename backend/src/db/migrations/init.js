import { getDb } from '../index.js';

export default function initDb() {
  const db = getDb();

  // wrap schema creation in a transaction for safety
  const create = db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT,
        passwordHash TEXT,
        createdAt TEXT,
        created_at INTEGER
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        owner TEXT,
        size INTEGER,
        mime TEXT,
        created_at INTEGER,
        metadata TEXT,
        FOREIGN KEY(owner) REFERENCES users(id) ON DELETE SET NULL
      );
    `);
  });

  create();
  return db;
}
