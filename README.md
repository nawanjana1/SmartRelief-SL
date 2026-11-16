# SmartRelief SL

A web app for recording teacher attendance, finding uncovered timetable periods, and helping school administrators assign relief teachers fairly.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Data: Supabase (to be connected in a later step)

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## First run

1. Install dependencies from this folder:

   ```powershell
   npm install
   ```

2. Start the API in one terminal:

   ```powershell
   npm run dev:backend
   ```

3. Start the web app in a second terminal:

   ```powershell
   npm run dev:frontend
   ```

The web app runs at `http://localhost:5173`. The API health endpoint is `http://localhost:5000/api/health`.

## Build order

1. Master data: teachers, subjects, classes, and timetable.
2. Attendance and affected-period detection.
3. Relief candidate filtering and weighted ranking.
4. Admin assignment confirmation and teacher duty view.
5. Authentication, reports, and deployment hardening.

The initial dashboard uses sample data only. Supabase, authentication, and real assignment writes are not connected yet.
