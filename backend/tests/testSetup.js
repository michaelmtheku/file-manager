import fs from 'fs';

beforeAll(() => {
  // Ensure fresh test metadata file
  const testFile = process.env.METADATA_FILE || 'metadata.test.json';
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
});

afterAll(() => {
  // Optionally remove test metadata file to keep repo clean
  const testFile = process.env.METADATA_FILE || 'metadata.test.json';
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
});