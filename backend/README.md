# Backend - File Management API

## Features
- JWT Authentication (register/login)
- Upload files (Multer)
- List files and folders
- Rename file
- Delete file
- Create folders
- Move files between folders
- Preview support (serves raw file; frontend decides preview method)
- Basic metadata persistence using a JSON file (`metadata.json`) for simplicity

## Scripts
- `npm run dev` - start with nodemon
- `npm start` - production start

## Environment
See `.env.example` for required variables.

## Future Improvements
- Replace JSON metadata with a database (MongoDB / PostgreSQL)
- Add pagination
- Add sharing / permissions
- Add versioning