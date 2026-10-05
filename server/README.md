# EduMart Server

This folder contains the Express API backend for the EduMart platform.

## Stack

- Node.js
- Express
- MySQL via Sequelize
- JWT authentication
- Docker-ready service

## Local startup

```bash
npm install
npm run dev
```

The API is available on `http://localhost:5000/api`.

## Main modules

- `src/routes/` — route definitions
- `src/controllers/` — business logic
- `src/models/` — Sequelize models
- `src/services/` — domain services
- `src/config/` — database configuration
