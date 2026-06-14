# Time Tracker

## Overview

Time Tracker is a full-stack web app for tracking time spent on projects, logging work sessions, uploading media, and collaborating in real time with other connected users.

The application includes:

- Secure user registration and login with JWT authentication
- Project management with create/update/delete
- Timer and time log submission tied to projects
- Time log viewing and filtering
- Media upload, listing, and deletion
- Live chat and presence status via Socket.IO
- Backend protection with rate limiting and security middleware

## Architecture

- `backend/`: Express server, MySQL database integration, authentication, file uploads, Socket.IO events, and API routes
- `frontend/`: React app built with Vite, token-based auth, routing, and API integration
- `database/schema.sql`: MySQL schema for users, projects, and time entries

## Features

- User registration and login
- JWT-based authenticated access
- Project creation, editing, and deletion
- Timer interface for tracking active work sessions
- Submit time logs with duration, notes, and project association
- Browse historical time logs
- Upload images and video media
- View uploaded media and delete files
- Real-time chat and online user presence updates
- Admin users can access the `/admin/users` endpoint if a role claim is provided

## Requirements

- Node.js 18+ (or compatible)
- npm
- MySQL database

## Environment Configuration

Create a `.env` file in `backend/` with the following values:

```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=timer_app
JWT_SECRET=your_jwt_secret
```

In `frontend/`, create a `.env` file for the API base URL:

```env
VITE_API_URL=http://localhost:5000
```

## Setup

1. Install root toolchains and dependencies:
   - `npm install`
2. Install backend dependencies:
   - `cd backend && npm install`
3. Install frontend dependencies:
   - `cd frontend && npm install`

## Running the App

### Backend

```bash
cd backend
npm start
```

The backend server listens on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
npm run dev
```

Open the provided Vite URL in the browser. The frontend expects the backend API to be reachable at `VITE_API_URL`.

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Full Workspace Test

From the repository root:

```bash
npm test
```

## Useful Scripts

- `npm test` - runs backend and frontend tests from root
- `npm run test:backend` - runs backend Jest tests
- `npm run test:frontend` - runs frontend Vitest tests
- `npm run test:coverage` - runs coverage for both backend and frontend
- `cd backend && npm start` - starts the backend server
- `cd frontend && npm run dev` - starts the frontend Vite dev server

## API Endpoints

### Auth

- `POST /register` - register a new user
- `POST /login` - log in and receive a JWT token

### Projects

- `GET /projects` - list authenticated user projects
- `POST /projects` - create a new project
- `PUT /projects/:id` - update a project
- `DELETE /projects/:id` - delete a project and associated time logs

### Time Tracking

- `POST /time` - create a time entry
- `GET /time` - fetch time entries (supports `project_id` and `date` query params)

### Media Uploads

- `POST /upload` - upload image/video media
- `GET /uploads-list` - list uploaded media
- `DELETE /uploads/:filename` - delete uploaded media file

### Real-Time & Admin

- Socket.IO connection for live chat and presence updates
- `GET /admin/users` - admin-only user list endpoint (requires admin role)

## Notes

- The backend creates the `timer_app` database and tables from `database/schema.sql` on startup.
- The app stores uploaded media in `backend/uploads/`.
- The frontend uses localStorage for storing the auth token and user role.

## Project Structure

- `backend/server.js` - main backend server and API routes
- `backend/models.js` - request validation schemas with Joi
- `backend/utils/time.js` - time formatting utilities
- `frontend/src/App.jsx` - application routing and authentication wrapper
- `frontend/src/api.js` - Axios instance with auth token injection
- `frontend/src/components/` - UI pages and features

## Contact

For questions or improvements, edit the relevant frontend or backend files and run the app locally.
