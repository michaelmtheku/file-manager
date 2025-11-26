// Ensure test metadata and uploads exist before tests run
import fs from 'fs';
import path from 'path';

const metaFileName = process.env.METADATA_FILE || 'metadata.json';
const metaFilePath = path.resolve(process.cwd(), metaFileName);

const initial = { users: [], files: [] };

try {
  // create or overwrite metadata file for tests (idempotent)
  fs.writeFileSync(metaFilePath, JSON.stringify(initial, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log('Test metadata created at', metaFilePath);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Failed to create metadata file for tests:', e);
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

// Optional cleanup after tests:
// afterAll(() => {
//   try { fs.unlinkSync(metaFilePath); } catch (e) {}
//   // optionally remove uploads contents
// });