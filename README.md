# EduMart

EduMart is an online learning material marketplace for students, tutors, and institutes. The project follows the architecture and requirements defined in the documentation set in the `docs/` folder.

## Architecture overview

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL 8
- Containerization: Docker Compose
- API style: RESTful JSON endpoints

## Included project structure

- `client/` — React frontend application
- `server/` — Express API server
- `sql/` — database schema and initialization scripts
- `docs/` — project charter, requirements, architecture, and planning documents
- `.github/workflows/` — CI pipeline skeleton

## Quick start

```bash
docker compose up --build -d
```

Then:

- Frontend: http://localhost
- Backend API: http://localhost:5000/api
- Database: localhost:3306

## Documentation reference

The implementation is aligned to the documents listed below:

- `docs/project_charter.md`
- `docs/requirements.md`
- `docs/project_plan.md`
- `docs/team_roles.md`
- `docs/technical_architecture.md`
- `docs/API_ENDPOINTS.md`
- `docs/sql_schema.md`
- `docs/wireframes.md`

## Local development

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Database setup

```bash
mysql -u root -p < sql/database_schema.sql
```

## License

Project documentation and starter structure for the EduMart academic e-commerce platform.
