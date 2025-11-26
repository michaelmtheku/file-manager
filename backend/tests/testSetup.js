// Ensure test environment uses in-memory DB
import fs from 'fs';
import path from 'path';

// Set environment variables for tests
process.env.USE_IN_MEMORY_DB = '1';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';

// Initialize the DB schema for tests
import initDb from '../src/db/migrations/init.js';

try {
  initDb();
  // eslint-disable-next-line no-console
  console.log('Test DB initialized (in-memory)');
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Failed to initialize test DB:', e);
}

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.cwd(), process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), 'uploads');

try {
  fs.mkdirSync(uploadDir, { recursive: true });
  // eslint-disable-next-line no-console
  console.log('Upload dir ensured at', uploadDir);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Failed to create upload dir for tests:', e);
}