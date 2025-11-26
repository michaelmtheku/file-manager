import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../../src/app.js';

const API = '/api';
let ownerToken;
let collabToken;
let uploadedFileId;

describe('File collaboration integration', () => {
  test('Health endpoint works', async () => {
    const res = await request(app).get(`${API}/health`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('Info endpoint reports counts', async () => {
    const res = await request(app).get(`${API}/info`);
    expect(res.status).toBe(200);
    expect(res.body.backend).toBeDefined();
    expect(res.body.counts).toHaveProperty('users');
  });

  test('Register owner user', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'owner@test.com', password: 'Secret123!' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    ownerToken = res.body.token;
  });

  test('Register collaborator user', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'collab@test.com', password: 'Secret123!' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    collabToken = res.body.token;
  });

  test('Owner uploads a file', async () => {
    // Create a temp file
    const tempDir = path.join(process.cwd(), 'backend', 'tests', 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const filePath = path.join(tempDir, 'sample.txt');
    fs.writeFileSync(filePath, 'Hello Collaboration Test');

    const res = await request(app)
      .post(`${API}/files/upload`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .attach('files', filePath);

    expect(res.status).toBe(201);
    expect(res.body.files).toBeDefined();
    expect(res.body.files.length).toBe(1);
    uploadedFileId = res.body.files[0].id;
  });

  test('Collaborator cannot rename before sharing (403)', async () => {
    const res = await request(app)
      .patch(`${API}/files/${uploadedFileId}/rename`)
      .set('Authorization', `Bearer ${collabToken}`)
      .send({ newName: 'should-not-work.txt' });

    expect(res.status).toBe(403);
  });

  test('Owner shares file with collaborator', async () => {
    const res = await request(app)
      .post(`${API}/files/${uploadedFileId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'collab@test.com', access: 'read' });

    expect(res.status).toBe(200);
    expect(res.body.file.sharedWith.length).toBe(1);
  });

  test('Collaborator can list shared files', async () => {
    const res = await request(app)
      .get(`${API}/files?scope=shared`)
      .set('Authorization', `Bearer ${collabToken}`);
    expect(res.status).toBe(200);
    expect(res.body.files.some(f => f.id === uploadedFileId)).toBe(true);
  });

  test('Collaborator can view metadata of shared file', async () => {
    const res = await request(app)
      .get(`${API}/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${collabToken}`);
    expect(res.status).toBe(200);
    expect(res.body.file.id).toBe(uploadedFileId);
  });

  test('Collaborator still cannot rename (403)', async () => {
    const res = await request(app)
      .patch(`${API}/files/${uploadedFileId}/rename`)
      .set('Authorization', `Bearer ${collabToken}`)
      .send({ newName: 'still-not-allowed.txt' });
    expect(res.status).toBe(403);
  });

  test('Owner unshares file', async () => {
    const res = await request(app)
      .post(`${API}/files/${uploadedFileId}/unshare`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'collab@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.file.sharedWith.length).toBe(0);
  });

  test('Collaborator no longer sees file in shared scope', async () => {
    const res = await request(app)
      .get(`${API}/files?scope=shared`)
      .set('Authorization', `Bearer ${collabToken}`);
    expect(res.status).toBe(200);
    expect(res.body.files.some(f => f.id === uploadedFileId)).toBe(false);
  });

  test('Owner deletes the file', async () => {
    const res = await request(app)
      .delete(`${API}/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(uploadedFileId);
  });
});