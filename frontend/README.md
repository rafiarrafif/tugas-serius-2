# Frontend

The frontend provides the UNS Food Court interface for browsing stalls and menus, viewing stall details, registering and signing in, and creating, editing, or deleting stalls when permitted.

## Requirements

- Node.js and npm
- The backend running at `http://localhost:3000`

## Setup and Run

From this directory:

```bash
npm ci
cp .env.example .env
```

Set `BACKEND_ENDPOINT` in `.env` to the backend API base URL. For local development:

```dotenv
BACKEND_ENDPOINT=http://localhost:3000/api/v1
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173`. The backend currently allows credentialed browser requests from this origin; if the frontend uses a different port, update the backend CORS origin as well.

## Available Commands

| Command             | Purpose                                        |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Start the development server with hot reload   |
| `npm run typecheck` | Generate route types and run TypeScript checks |
| `npm run build`     | Create the production client and server build  |
| `npm start`         | Serve the production build                     |

## Using the Application

- Browse stalls at `/stall`; open a stall to see its details and paginated menu items.
- Register at `/auth/register` or sign in at `/auth/login`.
- Signed-in owners and administrators can create stalls at `/create/stall`.
- Stall owners and administrators can edit or delete authorized stalls from the detail page.
- API failures are shown in the relevant form or page. The backend remains responsible for final input validation and access control.

## Technology and Architecture

- React 19 and TypeScript
- React Router 8 with server rendering, route loaders, and route actions
- Axios for backend requests, using the shared instance in `src/shared/lib/axios.ts` and response handling in `src/shared/lib/api-handler.ts`
- Tailwind CSS, with shadcn-style UI components and Base UI primitives

Route modules live in `app/routes/`. They load session state and compose pages from `src/modules/`. Feature code is grouped by module; for example, stall pages, API services, and types live under `src/modules/stalls/`. Shared request utilities and types live under `src/shared/`.

Login and registration requests are sent from the browser, so they are visible in the browser Network inspector. After login, the frontend immediately calls `/auth/me` to verify and load the account profile. The returned token is then sent to the frontend server action, which sets an `HttpOnly` session cookie. Stall create, edit, and delete requests are also sent directly from the browser; the backend accepts the session token from the `auth_token` cookie and enforces authorization.

The frontend uses these backend API paths (prefixed by `BACKEND_ENDPOINT`):

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /stalls`, `GET /stalls/:id`, `POST /stalls/`, `PUT /stalls/:id`, `DELETE /stalls/:id`
- `GET /menu-items`

## Production

Build and run the production server with:

```bash
npm run build
npm start
```

The build output is written to `build/client/` and `build/server/`.
