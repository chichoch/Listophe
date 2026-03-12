# Listophe — Modernization Plan

## What Listophe Is

A real-time collaborative list-sharing app. Users can create named lists, add rows, check/uncheck items, and everyone viewing the same list sees changes instantly. Think of it as a simple shared checklist/todo tool.

### Current (legacy) stack
- **Frontend:** AngularJS 1.x, Bootstrap 3, manual `<script>` tags
- **Backend:** Express (Node.js), Socket.IO 2.x
- **Database:** MongoDB via Mongoose
- **Build:** None — raw files served by Express

---

## Proposed Modern Stack

### Frontend — React + TypeScript + Vite

| Concern | Choice | Why |
|---|---|---|
| Framework | **React 19** with TypeScript | As requested. Mature ecosystem, great DX |
| Build tool | **Vite** | Fast HMR, zero-config TS support, replaces Webpack/CRA entirely |
| Routing | **React Router v7** | Lightweight, widely used |
| Styling | **Tailwind CSS v4** | Utility-first, replaces Bootstrap. Alternatively: **shadcn/ui** for pre-built components on top of Tailwind |
| State | **React Query (TanStack Query)** | For server state (list data). Local UI state stays in `useState`/`useReducer` |

### Backend — Node.js + Express

| Concern | Choice | Why |
|---|---|---|
| Runtime | **Node.js 22 LTS** | As requested |
| Framework | **Express 5** | Stable release of the most widely used Node.js framework. Natural successor to the original Express setup |
| API style | **REST** | Simple CRUD app; REST is sufficient |
| Validation | **Zod** | Runtime + static type validation in one |

### Real-Time — Socket.IO 4

Socket.IO is still actively maintained and widely used. It has auto-reconnection, rooms, and namespaces built in. The room-based model (`socket.join(listId)`, `io.to(listId).emit(...)`) maps directly to the existing architecture, making it the most natural choice.

### Database — SQLite + Drizzle ORM

Zero infrastructure — just a file on disk. No database server to install or manage. Drizzle ORM provides type-safe queries with a thin, SQL-like API. The data model (lists with rows) is trivially relational and a perfect fit. If you later want to deploy to production, Drizzle supports swapping to Postgres or Turso (distributed SQLite) with minimal changes.

---

## Proposed Project Structure

```
listophe/
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateList.tsx
│   │   │   ├── ListView.tsx
│   │   │   └── ListRow.tsx
│   │   ├── hooks/
│   │   │   └── useSocket.ts       # Socket.IO hook
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── List.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tsconfig.json
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts         # Drizzle schema
│   │   │   └── index.ts          # DB connection
│   │   ├── routes/
│   │   │   └── lists.ts          # REST endpoints
│   │   ├── socket.ts             # Socket.IO event handlers
│   │   └── index.ts              # Express + HTTP + Socket.IO setup
│   ├── tsconfig.json
│   └── package.json
├── package.json                   # Workspace root (npm workspaces)
└── README.md
```

---

## Data Model

### Current (Mongoose)
A single `List` document with embedded `rows` array.

### Proposed (Drizzle + SQLite)

```typescript
// lists table
export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),       // nanoid or uuid
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// rows table
export const rows = sqliteTable('rows', {
  id: text('id').primaryKey(),
  listId: text('list_id').references(() => lists.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  checked: integer('checked', { mode: 'boolean' }).default(false),
  position: integer('position').notNull(),    // for ordering
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

---

## Feature Mapping: Old → New

| Feature | Old Implementation | New Implementation |
|---|---|---|
| Create list | Socket event → Mongoose save → redirect | REST `POST /api/lists` → Drizzle insert → navigate |
| View list | HTTP GET → Mongoose findById | REST `GET /api/lists/:id` → Drizzle query (cached via React Query) |
| Add row | Socket `addRow` → Mongoose push | Socket `addRow` → Drizzle insert → broadcast to room |
| Check/uncheck row | Socket `rowChecked` → Mongoose update | Socket `toggleRow` → Drizzle update → broadcast to room |
| Delete row | Partially implemented | REST or Socket → Drizzle delete → broadcast |
| Real-time sync | Socket.IO rooms (`socket.join(listId)`) | Same pattern with Socket.IO 4 |

---

## Implementation Order

1. **Scaffold** — Set up monorepo with npm workspaces, Vite frontend, Express backend
2. **Database** — Define Drizzle schema, set up SQLite, write migrations
3. **REST API** — CRUD endpoints for lists and rows
4. **Frontend pages** — Home (create list) and List view (display rows)
5. **Real-time** — Add Socket.IO 4 for live updates (add row, toggle, delete)
6. **Styling** — Tailwind + basic responsive layout
7. **Polish** — Error handling, loading states, empty states, share URL UX

---

## Decisions

- **Auth:** None for now. Lists are anonymous and accessed via shareable URLs.
- **Deployment:** **Fly.io**, deployed via GitHub Actions (auto-deploy on push to `main`). Express serves the Vite-built frontend as static files, so a single Fly app is sufficient.
- **List discoverability:** Lists are only accessible by direct URL. No "my lists" page (would require auth).
- **Row reordering:** Yes — drag-and-drop via **dnd-kit**. Row `position` column in the DB supports persistent ordering. Reorder events are broadcast to all viewers via Socket.IO.
