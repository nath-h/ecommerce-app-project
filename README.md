# my-ecommerce-app

A full-stack ecommerce portfolio project built using:

**Frontend:** Vue 3 + Pinia + Vite

**Backend:** Express + Prisma + JWT Authentication

**Database:** PostgreSQL

# First Time Setup Guide

## Requirements:

- Node 20.19+ or 22.12+ (Node 21 not supported)
- Docker Desktop

## Quick Start

For first time project setup, simply enter:

```bash
git clone https://github.com/nath-h/ecommerce-app-project.git
cd my-ecommerce-app (or if you followed the prompts given by VS Code to open the project, skip this step)
npm run setup
```

This will:

1. Clone this github repo
2. Navigate to the root folder
3. Install all required npm dependencies for root, frontend, and backend
4. Start Docker PostgreSQL and Adminer containers
5. Set up Prisma database and seed the database with starter data

## After Setup

Once setup is complete, use these commands for development or exploration:

```bash
# Start development servers (frontend + backend)
npm run dev

# Start frontend server only
npm run dev:frontend

# Start backend server only
npm run dev:backend
```

## Access Points

After setup and running the above commands, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Database Management

**Prisma Studio (Recommended):**

```bash
# Start Prisma Studio (Database Management/Visualization Tool)
npm run db:studio
```

Studio should open automatically, otherwise navigate to http://localhost:5555

**Adminer (Alternative):**
Navigate to http://localhost:8081 after setup and use the following credentials:
System: 'PostgreSQL', Server: 'postgres', Username: 'admin', Password: 'password', Database: 'ecommerce_db'

## Default Admin Account Credentials

Navigate to http://localhost:5173/login and enter the following:

```
Email: admin@admin.com
Password: password
```

Once logged in, an Admin panel will appear in the navigation bar. This will give you access to the Admin dashboard.

## Default User Account Credentials

```
Email: user@user.com
Password: password
```
