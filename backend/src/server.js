import { createServer } from 'http';
import app from './app.js';
import { config } from 'dotenv';

config();
const PORT = process.env.PORT || 5000;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});