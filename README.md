# Simple Login / Registration Form

This app collects name, age, and email and stores submissions in a SQLite database on the server.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy

This is ready for a Node.js hosting service. Set the start command to `npm start`.

Important: the included SQLite database is fine for a simple single-server deployment, but for a production app with multiple instances or a server that can lose its filesystem, use a managed database such as PostgreSQL.

Before exposing `/api/users` publicly, add authentication/authorization to the GET endpoint or remove it.
