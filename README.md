# PetraStats

PetraStats is a football statistics platform built for Petra School.

It provides a centralized system for managing football seasons, teams, players, matches, match events, and player statistics, with a public-facing statistics dashboard and a protected administration system.

## Features

### Public

* Football statistics dashboard
* Match results and upcoming matches
* Top scorers
* Top assist providers
* Goalkeeper statistics
* Team statistics
* Player directory
* Individual player profiles
* Match details and event timelines
* Season-based statistics

### Preview

![alt text](image-1.png)

### Administration

* Secure admin authentication
* Role-based access control
* Create and manage seasons
* Create and manage teams
* Create and manage players
* Create and manage matches
* Record match events
* Correct match events and statistics
* Publish and unpublish matches
* Manage football data without directly editing the database

## Core Principle

PetraStats treats match events as the source of truth.

Goals, assists, cards, scores, and other derived statistics should be calculated from recorded match events rather than manually duplicated across multiple database fields.

This keeps statistics consistent when an administrator corrects an event.

For example:

```text
Match Event
    ↓
Goal recorded
    ↓
Player statistics updated
    ↓
Scorer leaderboard updated
    ↓
Team statistics updated
    ↓
Dashboard updated
```

## Architecture

PetraStats is built as a full-stack Next.js application using Server Actions.

```text
┌─────────────────────────┐
│     PetraStats App      │
│                         │
│  Next.js (App Router)   │
│   React + TypeScript    │
│                         │
│ ┌─────────────────────┐ │
│ │   Server Actions    │ │
│ └──────────┬──────────┘ │
└────────────┼────────────┘
             │ Prisma
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
└─────────────────────────┘
```

## Project Structure

```text
petra-stats/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
├── .env.example
└── README.md
```

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* Recharts

### Backend (Next.js Server Actions)

* Node.js
* Next.js Server Actions
* Prisma
* PostgreSQL
* Zod
* jose (Authentication)
* bcryptjs

### Development

* Git
* GitHub
* npm

## Getting Started

### Requirements

Make sure you have installed:

* Node.js 20+
* npm
* PostgreSQL 16+
* Git

### 1. Clone the repository

```bash
git clone <repository-url>
cd petra-stats
```

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment variables

Create a `.env` file inside `frontend/`.

```env
DATABASE_URL="postgresql://username:password@localhost:5432/petra_stats"
AUTH_SECRET="your-development-secret"
```

Never commit real environment variables to Git.

### 4. Set up Prisma

From the frontend directory:

```bash
npx prisma generate
npx prisma db push
```

### 5. Start the application

```bash
npm run dev
```

The app runs on:

```text
http://localhost:3000
```

## Data Model

The core system is built around:

```text
Season
  │
  ├── Teams
  │     │
  │     └── Players
  │
  └── Matches
         │
         └── Match Events
```

Important entities include:

* User
* Season
* Team
* Player
* Match
* MatchEvent

Goalkeeper match statistics can be stored separately when goalkeeper-specific data such as saves needs to be recorded.

## Match Events

Match events are used to represent actions occurring during a match.

Current event types include:

```text
GOAL
OWN_GOAL
YELLOW_CARD
RED_CARD
```

A goal event may contain:

```text
Player
Assist Player
Minute
Match
```

Statistics are derived from these events.

## API

The backend exposes a REST API for the frontend.

Example endpoints:

```text
GET    /api/seasons
GET    /api/teams
GET    /api/players
GET    /api/matches
GET    /api/matches/:id

GET    /api/stats/scorers
GET    /api/stats/assists
GET    /api/stats/goalkeepers

POST   /api/admin/seasons
POST   /api/admin/teams
POST   /api/admin/players
POST   /api/admin/matches

POST   /api/admin/matches/:id/events

PATCH  /api/admin/matches/:id/events/:eventId
DELETE /api/admin/matches/:id/events/:eventId
```

Administrative endpoints require authentication and appropriate permissions.

## Security

PetraStats follows several security principles:

* Passwords are hashed before storage.
* Authentication is handled server-side.
* Authorization is enforced on protected API routes.
* External input is validated with Zod.
* Database queries are handled through Prisma.
* Secrets are stored in environment variables.
* Administrative functionality is never protected only by frontend UI.
* Production errors should not expose sensitive implementation details.

## Development Principles

The project follows these engineering rules:

* Use strict TypeScript.
* Avoid `any` unless there is a documented reason.
* Validate external input.
* Keep business logic out of UI components.
* Prefer reusable services for complex backend logic.
* Use Prisma migrations for database changes.
* Use transactions for important multi-step operations.
* Keep frontend and backend responsibilities separate.
* Avoid unnecessary dependencies.
* Handle loading, error, success, and empty states.
* Write tests for important business logic.
* Keep commits small and logically scoped.

## Git

Do not commit:

```text
node_modules/
.env
.env.local
.next/
logs
local database files
```

Before committing, verify:

```bash
git status
```

and make sure dependencies and environment secrets are not being tracked.

## Production

Planned deployment:

```text
Frontend → Vercel
Backend  → Render
Database → Neon PostgreSQL
```

Production environment variables must be configured through the deployment platforms rather than committed to the repository.

## Roadmap

### Phase 1 — Foundation

* [ ] Frontend setup
* [ ] Backend setup
* [ ] PostgreSQL setup
* [ ] Prisma setup
* [ ] Database schema
* [ ] Seed data

### Phase 2 — Authentication

* [ ] Login
* [ ] Password hashing
* [ ] Authentication middleware
* [ ] Role-based authorization

### Phase 3 — Management

* [ ] Season management
* [ ] Team management
* [ ] Player management
* [ ] Match management

### Phase 4 — Match Engine

* [ ] Match events
* [ ] Goals
* [ ] Assists
* [ ] Cards
* [ ] Score calculation
* [ ] Event correction
* [ ] Statistics calculation

### Phase 5 — Public Platform

* [ ] Dashboard
* [ ] Matches
* [ ] Scorers
* [ ] Assisters
* [ ] Goalkeepers
* [ ] Teams
* [ ] Players
* [ ] Player profiles
* [ ] Match details

### Phase 6 — Quality

* [ ] Automated tests
* [ ] Accessibility review
* [ ] SEO
* [ ] Performance optimization
* [ ] Security review
* [ ] Production deployment

## Definition of Done

The first production-ready version of PetraStats should allow an administrator to:

1. Create a season.
2. Create teams.
3. Add players.
4. Create a match.
5. Record match events.
6. Correct recorded events.
7. Automatically update statistics.
8. Display the updated statistics publicly.

The same underlying match data must remain consistent across the dashboard, leaderboards, team pages, player profiles, and match details.

## License

This project is currently intended for use within Petra School.

Copyright © PetraStats.
