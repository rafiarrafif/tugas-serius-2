# Backend

The backend provides the API for UNS Food Court. It serves stall and menu data, account registration and authentication, reviews, likes, flags, and audit records.

## Requirements

- Node.js and npm
- A SQL Server instance with a database and tables matching `src/db/schema.ts`

This repository does not include a database migration or schema-install script. Prepare the SQL Server database before starting the API.

## Setup

From this directory:

```bash
npm install
cp .env.example .env
```

Update `.env` for your SQL Server instance:

| Variable                      | Description                                               |
| ----------------------------- | --------------------------------------------------------- |
| `DB_SERVER`                   | SQL Server hostname or address                            |
| `DB_PORT`                     | SQL Server port, usually `1433`                           |
| `DB_USER`                     | Database login                                            |
| `DB_PASSWORD`                 | Database password; replace the example value              |
| `DB_NAME`                     | Application database name                                 |
| `DB_ENCRYPT`                  | Set to `true` when the connection requires encryption     |
| `DB_TRUST_SERVER_CERTIFICATE` | Set to `true` for a trusted local development certificate |

Do not commit a real `.env` file or database credentials.

## Run and API Docs

Start the development server:

```bash
npm run dev
```

The API listens at `http://localhost:3000`. Check database connectivity at `/health`; browse the generated Swagger UI at `/docs`.

Other available commands:

| Command            | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `npm start`        | Start the API without watch mode                               |
| `npm run docs:gen` | Generate `src/docs/swagger-output.json` from route annotations |

The `predev` and `prestart` scripts generate Swagger output automatically before the server starts.

## API Overview

All application routes are mounted under `/api/v1`.

| Resource       | Main routes                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Authentication | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`                                                                         |
| Stalls         | `GET /stalls`, `POST /stalls/`, `GET /stalls/:id`, `PUT /stalls/:id`, `DELETE /stalls/:id`                                        |
| Stall reviews  | `GET /stalls/:id/reviews`, `POST /stalls/:id/reviews`, review detail and delete routes under `/stalls/:stallId/reviews/:reviewId` |
| Menu items     | `GET /menu-items`, `POST /menu-items/`, `GET /menu-items/:id`, `PUT /menu-items/:id`, `DELETE /menu-items/:id`                    |
| Users          | `GET /users`, `POST /users/`                                                                                                      |
| Likes          | `POST /likes/`, `DELETE /likes/:id`                                                                                               |
| Flags          | `GET /flags/:id`, `PUT /flags/:id`                                                                                                |
| Audit          | `POST /audit/`, `GET /audit/:id`                                                                                                  |

`GET /health` and `/docs` are outside the `/api/v1` prefix.

Responses use a JSON envelope with a `status` such as `success` or `fail`, an optional `message`, and endpoint data. Swagger documents request parameters, payloads, and response codes; the route handlers are the source of truth for the API contract.

## Authentication and Authorization

Login returns a JWT. Protected routes accept it in the `auth_token` request header; browser-originated stall create, update, and delete requests may send it in the `auth_token` cookie. Authentication middleware validates the token and extracts its user ID and role.

Stall creation requires the `owner` or `admin` role. Updating and deleting require one of those roles, and the owner role is limited to stalls owned by the authenticated user. The backend enforces these checks regardless of frontend visibility or validation.

The development CORS configuration allows credentialed requests from `http://localhost:5173`, matching the frontend development server. Change that origin in `src/index.ts` when serving the frontend from another origin.

## Architecture

The request path follows:

```text
Route -> Middleware -> Controller -> Service -> Repository -> SQL Server
```

- `src/routes/` defines HTTP methods, paths, middleware, and Swagger annotations.
- `src/middleware/` handles JWT authentication, role checks, stall ownership checks, and audit logging.
- `src/controllers/` translates HTTP requests and responses.
- `src/services/` contains application rules and data mapping.
- `src/repositories/` accesses SQL Server through Drizzle ORM.
- `src/db/schema.ts` defines the typed database schema; `src/db/index.ts` manages the SQL Server connection and Drizzle instance.
- `src/dtos/` contains request and response data shapes.
- `src/docs/` contains Swagger generation and its generated output.

Database schema changes must be coordinated with the SQL Server database. The application currently defines its Drizzle schema in code and does not provide a migration command.
