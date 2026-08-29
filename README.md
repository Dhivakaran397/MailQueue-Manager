# Mini ReachInbox — Email Scheduling & Tracking System

A full-stack email scheduling and tracking system built with Node.js, React (Vite), Prisma ORM, SMTP Transport, and Tailwind CSS.

## Features
- **Zero-Docker Native Local Running:** Runs natively with SQLite & in-memory queue fallback — **NO Docker or external databases required!**
- **Authentication:** JWT Bearer token authentication (register & login) + Google OAuth 2.0.
- **Campaign Scheduling:** CSV file upload (supports headerless & standard CSVs) + single direct email dispatch with customizable scheduling.
- **Background Worker:** Automates email delivery via **Gmail SMTP & Ethereal Test SMTP** and updates delivery status (`SENT`, `PENDING`, `FAILED`).
- **Live Sandbox Previews:** Generates clickable Ethereal SMTP preview links for test emails.

---

## 🚀 Quick Start (NO DOCKER REQUIRED)

### Prerequisites
- Node.js 18+

---

### Step 1: Start Backend API
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
> Starts Express server on `http://localhost:5000` using SQLite (`dev.db`).

---

### Step 2: Start Email Worker (in a separate terminal)
```bash
cd backend
npm run worker
```
> Monitors pending campaigns and automatically sends emails via Ethereal SMTP.

---

### Step 3: Start Frontend App (in a third terminal)
```bash
cd frontend
npm install
npm run dev
```
> Open **http://localhost:5173** in your web browser!

---

## 🐳 Optional: Production Docker Setup (PostgreSQL + Redis)
If you wish to deploy with PostgreSQL 15 & Redis 7 containers:
```bash
docker-compose up -d
```
*(Switch Prisma datasource provider in `prisma/schema.prisma` to PostgreSQL if using Docker).*

## CSV Format
The CSV file should have an `email` column:
```csv
email
user1@example.com
user2@example.com
user3@example.com
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Campaigns
- `POST /api/campaigns/schedule` - Upload CSV and schedule campaign (multipart/form-data)

### Recipients
- `GET /api/recipients` - Get paginated recipients with search and filter

## Environment Variables

### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5432/minireachinbox |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| JWT_SECRET | Secret key for JWT signing | (required) |
| PORT | Backend server port | 5000 |

### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |
