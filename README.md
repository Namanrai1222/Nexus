# Nexus — Forum & Discussion Platform

A modern, full-stack community forum and discussion platform inspired by Reddit and Stack Overflow. Built with React, Express, PostgreSQL, and Socket.IO.

## Features

- **Communities** — Create and join topic-based communities (Evergreen, Time-bounded, Private, Federated, Anonymous types)
- **Rich Posts** — Text, link, and image posts with Markdown rendering, tags, and versioned edit history
- **Threaded Comments** — Nested comment trees up to 4 levels deep with collapse/expand
- **Voting** — Upvote/downvote on posts and comments with real-time score updates
- **Impact Score** — User reputation system aggregated from community contributions
- **Real-time** — Live notifications, new comments, and vote updates via Socket.IO
- **Authentication** — JWT access + refresh tokens with httpOnly cookies and automatic token rotation
- **Profiles** — User profiles with avatar upload, bio, post history, and stats
- **Search** — Search posts and communities from the global search bar
- **Responsive** — Mobile-first design with dark/light mode support

## Tech Stack

| Layer       | Technology                                  |
| ----------- | ------------------------------------------- |
| Frontend    | React 18, TypeScript, Vite, TailwindCSS     |
| State       | Zustand (client), React Query (server)      |
| Backend     | Node.js, Express 5, TypeScript              |
| Database    | PostgreSQL 16, Prisma ORM                   |
| Real-time   | Socket.IO                                   |
| Auth        | JWT (access + refresh), bcryptjs            |
| File Upload | Multer (dev), Cloudinary (production)       |
| Deployment  | Docker, Docker Compose, Nginx               |

## Project Structure

```
nexus/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/            # Axios API clients
│   │   ├── components/     # UI components (auth, comments, layout, posts, shared)
│   │   ├── context/        # React contexts (Auth, Socket)
│   │   ├── hooks/          # Custom hooks (useAuth, usePosts, useComments, useSocket)
│   │   ├── pages/          # Route pages
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utilities (cn, formatDate)
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema (14 models, 7 enums)
│   ├── src/
│   │   ├── config/         # Database, Cloudinary, Socket.IO config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, error, rate limit, upload middleware
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # ApiError, ApiResponse, asyncHandler
│   ├── Dockerfile
│   └── server.ts           # Entry point
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+ (or use Docker)
- **npm** 9+

### 1. Clone and install

```bash
git clone <repo-url> nexus
cd nexus

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your values:

```env
DATABASE_URL=postgresql://nexus:password@localhost:5432/nexus_db
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Set up the database

```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run development servers

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Docker Deployment

Run the entire stack with Docker Compose:

```bash
docker compose up --build -d
```

This starts:
- **PostgreSQL** on port 5432
- **Express API** on port 5000 (with automatic Prisma migrations)
- **React client** (Nginx) on port 5173

To tear down:

```bash
docker compose down -v
```

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint                          | Auth     | Description               |
| ------ | --------------------------------- | -------- | ------------------------- |
| POST   | `/auth/register`                  | No       | Register a new user       |
| POST   | `/auth/login`                     | No       | Login and get tokens      |
| POST   | `/auth/refresh`                   | No       | Refresh access token      |
| POST   | `/auth/logout`                    | Yes      | Logout current session    |
| GET    | `/auth/me`                        | Yes      | Get current user          |
| GET    | `/posts`                          | Optional | List posts (paginated)    |
| POST   | `/posts`                          | Yes      | Create a post             |
| GET    | `/posts/:slug`                    | Optional | Get post by slug          |
| PUT    | `/posts/:postId`                  | Yes      | Update a post             |
| DELETE | `/posts/:postId`                  | Yes      | Soft-delete a post        |
| POST   | `/posts/:postId/vote`             | Yes      | Vote on a post            |
| GET    | `/posts/:postId/comments`         | Optional | Get comments for a post   |
| POST   | `/posts/:postId/comments`         | Yes      | Create a comment          |
| POST   | `/comments/:commentId/vote`       | Yes      | Vote on a comment         |
| DELETE | `/comments/:commentId`            | Yes      | Soft-delete a comment     |
| GET    | `/communities`                    | No       | List communities          |
| POST   | `/communities`                    | Yes      | Create a community        |
| GET    | `/communities/:slug`              | No       | Get community by slug     |
| POST   | `/communities/:slug/join`         | Yes      | Join a community          |
| POST   | `/communities/:slug/leave`        | Yes      | Leave a community         |
| GET    | `/users/:username`                | No       | Get user profile          |
| GET    | `/users/:username/posts`          | No       | Get user's posts          |
| PUT    | `/users/profile`                  | Yes      | Update profile            |
| POST   | `/users/avatar`                   | Yes      | Upload avatar             |
| GET    | `/notifications`                  | Yes      | Get notifications         |
| PUT    | `/notifications/:id/read`         | Yes      | Mark notification read    |
| PUT    | `/notifications/read-all`         | Yes      | Mark all read             |

## License

MIT
