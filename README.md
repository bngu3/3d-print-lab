# SJSU FabLab 3D Print Lab

Full-stack request management application for the SJSU FabLab.

## Project Structure

- `frontend/`: React and Vite application
- `backend/`: Express API and PostgreSQL database access

## Local Development

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Configure the backend environment in `backend/.env`:

```env
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=your-long-random-session-secret
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:3001`.

## Staff Access

The staff dashboard is available at `/admin`, but it is intentionally hidden from the public navigation. Staff sign in with an individual email and password.

- `technician`: can view and update requests
- `admin`: can also archive and permanently delete requests

Staff accounts are stored in PostgreSQL. Passwords must be stored as bcrypt hashes, never as plaintext. Create or deactivate staff accounts through the PostgreSQL console until a protected staff-management screen is added.

Example account insert:

```sql
INSERT INTO users (email, password_hash, role_id, is_active)
VALUES (
  'staff@sjsu.edu',
  '<bcrypt-hash>',
  (SELECT id FROM roles WHERE name = 'technician'),
  TRUE
);
```

Do not commit `.env` files, database connection strings, session secrets, plaintext passwords, or bcrypt hashes to the repository.

## Production

The backend requires `DATABASE_URL`, `SESSION_SECRET`, and `FRONTEND_URL` in its hosting environment. Configure the frontend and backend deployments separately, then verify the frontend API URL in `frontend/src/api/requests.ts` points to the production backend.

Before deploying changes:

```bash
cd frontend
npm run build
```
