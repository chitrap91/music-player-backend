# Music Streaming Backend

Backend API for the music streaming project, built with Node.js, Express, and MongoDB.

## Purpose

This backend handles:

- Authentication (register/login with JWT)
- Track APIs (list, search, like, comments, recently played, download)
- Playlist APIs (create, fetch, add track, remove track)
- User/profile-related data retrieval for the frontend

## Repositories

- Backend GitHub: [https://github.com/chitrap91/music-player-backend](https://github.com/chitrap91/music-player-backend)
- Frontend GitHub: [https://github.com/chitrap91/music-player-frontend](https://github.com/chitrap91/music-player-frontend)

## Data and Storage

- **MongoDB** stores application data, including user profile data and user-linked entities:
  - users
  - playlists
  - likes
  - comments
  - recently played history
- **AWS S3** stores sample audio/media used by tracks.  
  Track records in MongoDB keep the S3 URLs (`url`, `coverUrl`) consumed by frontend and download routes.

## API Base Paths

- `/auth` -> register/login
- `/track` -> tracks, search, likes, comments, recent, download
- `/playlist` -> playlist CRUD + add/remove track

## Environment Variables

Create a `.env` file in `backend/`:

```env
DB=<your-mongodb-connection-string>
JWT_SECRET_KEY=<your-jwt-secret>
ALLOWED_ORIGINS=http://localhost:5173,https://ornate-twilight-62d8ce.netlify.app
```

Notes:

- `DB` is the MongoDB connection string.
- `JWT_SECRET_KEY` is used to sign auth tokens.
- `ALLOWED_ORIGINS` controls CORS for frontend origins.

## Run Locally

```bash
npm install
npm start
```

Server runs on: `http://localhost:3000` (default Express setup).

For debug mode:

```bash
npm run debug
```

## Live Frontend

- [https://ornate-twilight-62d8ce.netlify.app/](https://ornate-twilight-62d8ce.netlify.app/)
