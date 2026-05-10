# Shaikh Race 🏎️

A high-performance 3D browser racing game built with Next.js, React Three Fiber, and FastAPI.

## Features
- **3D Graphics**: Realistic car meshes and environments using Three.js.
- **Infinite Gameplay**: Procedurally generated road and obstacles.
- **Backend Sync**: Persistent user profiles, car upgrades, and global leaderboards.
- **Real-time**: Live leaderboard updates via WebSockets.
- **Daily Rewards**: Claim bonuses every 24 hours.

## Local Development (Docker)

The easiest way to run the full stack is using Docker Compose.

1. Clone the repository
2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Start the services:
   ```bash
   docker-compose up --build
   ```
4. Access the game at [http://localhost:3000](http://localhost:3000)

## Manual Setup

### Backend (FastAPI)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend (Next.js)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Frontend (Vercel)
- Connect your GitHub repo to Vercel.
- Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to your Vercel project settings.
- Deploy.

### Backend (Railway / Render)
- Deploy the `/backend` folder.
- Provision a PostgreSQL database.
- Add all environment variables from `.env.example`.

## API Documentation
Once the backend is running, access the interactive Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs).