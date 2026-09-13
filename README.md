# Simple Login / Registration App + Admin Login

Learning project demonstrating a small full-stack app:

- Public registration form: name, age, email
- Node.js + Express backend
- SQLite database
- Admin login protected by an HttpOnly session cookie
- Admin dashboard that can view submitted users
- Environment variables for admin credentials

## Run locally

```bash
npm install
npm start
```

Open:

- `http://localhost:3000/` — registration
- `http://localhost:3000/admin` — admin login

### Learning-mode admin credentials

If you do not set environment variables, the app uses:

- Email: `admin@example.com`
- Password: `ChangeMe123!`

This is only for learning. Change them before exposing the app publicly.

### Recommended local environment variables

PowerShell:

```powershell
$env:ADMIN_EMAIL="your-admin-email@example.com"
$env:ADMIN_PASSWORD="your-strong-password"
npm.cmd start
```

## Render

In Render, add these Environment Variables to the web service:

- `ADMIN_EMAIL` = your admin email
- `ADMIN_PASSWORD` = your admin password

Then deploy.

## API endpoints

Public:

- `POST /api/users` — create a registration record
- `POST /api/admin/login` — admin login
- `POST /api/admin/logout` — admin logout

Admin-only:

- `GET /api/admin/me` — verify current admin session
- `GET /api/admin/users` — view submitted users

## Important learning notes

This is a learning project, not a production-ready authentication system. Sessions are kept in server memory, so they are lost when the process restarts. For production you would normally use a persistent session store, a managed database, rate limiting, CSRF protection where appropriate, stronger account management, audit logging, and a proper secret-management strategy.
