# Listophe

Listophe is a real-time collaborative list-sharing app. Create a list, share the URL, and everyone on that list sees updates instantly.

## Stack

- Frontend: React 19, TypeScript, Vite, React Router v7, Tailwind CSS v4, TanStack Query
- Backend: Node.js 22, Express 5, Socket.IO 4, Zod
- Database: SQLite + Drizzle ORM

## Project Layout

- `frontend/` React + Vite app
- `backend/` Express API + Socket.IO server + Drizzle schema
- `PLAN.md` modernization plan for this rewrite

## Docker

The Docker image builds the frontend, starts the backend, and serves the compiled frontend from the same server.

Build the image:

```bash
docker build -t listophe .
```

Run the container on the app's default port:

```bash
docker run --rm -p 3000:3000 listophe
```

Then open `http://localhost:3000`.

Persist SQLite data between container runs:

```bash
docker run --rm -p 3000:3000 -v "$(pwd)/data:/app/data" listophe
```

The app writes its SQLite database to `/app/data/listophe.db` by default.

If you want the container to listen on a different port, set `PORT` and map the same port on the host:

```bash
docker run --rm -e PORT=8080 -p 8080:8080 listophe
```

Useful environment variables:

- `PORT` — HTTP port for the backend and bundled frontend server. Defaults to `3000`.
- `DATABASE_URL` — custom SQLite file path. Defaults to `/app/data/listophe.db`.
- `CORS_ORIGIN` — comma-separated list of allowed origins for API and Socket.IO access.



## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Run database bootstrap migration:

```bash
npm run db:migrate
```

3. Start both backend and frontend in dev mode:

```bash
npm run dev
```

4. Open `http://localhost:5173`

## Useful Scripts

- `npm run dev` — run backend and frontend together
- `npm run build` — build frontend and backend
- `npm run start` — run production backend (`backend/dist`)
- `npm run typecheck` — run TypeScript checks for both workspaces
- `npm run db:migrate` — ensure SQLite schema exists
- `npm run db:generate` — generate Drizzle migration files from schema

## API Summary

- `POST /api/lists` create list
- `GET /api/lists/:listId` fetch list with rows
- `POST /api/lists/:listId/rows` add row
- `PATCH /api/lists/:listId/rows/:rowId` toggle row checked state
- `DELETE /api/lists/:listId/rows/:rowId` delete row
- `PUT /api/lists/:listId/rows/reorder` persist row order

## Socket Events

- Client emits: `joinList`, `addRow`, `toggleRow`, `deleteRow`, `reorderRows`
- Server emits: `joinedList`, `rowAdded`, `rowUpdated`, `rowDeleted`, `rowsReordered`
