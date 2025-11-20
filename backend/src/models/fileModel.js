import fs from 'fs';

const METADATA_FILE = 'metadata.json';

function init() {
  if (!fs.existsSync(METADATA_FILE)) {
    const initial = { users: [], files: [], folders: [] };
    fs.writeFileSync(METADATA_FILE, JSON.stringify(initial, null, 2));
  }
}
init();

export function loadMetadata() {
  const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function saveMetadata(db) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(db, null, 2));
}