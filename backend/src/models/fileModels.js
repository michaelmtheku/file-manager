import fs from 'fs';
import path from 'path';

const METADATA_FILE = process.env.METADATA_FILE || 'metadata.json';
const metadataPath = path.resolve(process.cwd(), METADATA_FILE);

function loadMetadata() {
  try {
    const raw = fs.readFileSync(metadataPath, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      // initialize minimal metadata file
      const initial = { users: [], files: [] };
      saveMetadata(initial);
      return initial;
    }
    throw err;
  }
}

function saveMetadata(data) {
  // write to a temp file then rename for atomicity
  const dir = path.dirname(metadataPath);
  const tmp = path.join(dir, `${path.basename(metadataPath)}.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, metadataPath);
}

export { loadMetadata, saveMetadata, metadataPath };
