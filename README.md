# ProfMatch (Next.js)

Frontend for faculty semantic search and RAG chat. Search and chat are proxied to the FastAPI repo (`faculty_project_fastapi`).

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`FACULTY_API_URL` in `.env.local` should point at a running FastAPI server:

- Local backend: `http://localhost:8000`
- Deployed backend: `https://faculty-project-fastapi.onrender.com`

Next.js API routes retry the backend on HTTP 503 (Render cold start) before returning “Service starting” to the UI.

University and department dropdowns load from `GET /api/filters`. Search results are grouped one card per professor.

MySQL env vars (`MYSQL_*`) are only used by the leftover `/testing` page (`/api/professor`, `/api/interest`, `/api/department`). Search and chat do not query MySQL from Next.js.
