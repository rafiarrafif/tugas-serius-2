# AGENTS.md

This file tells AI coding agents how to work in this repository.
Read it fully before you write or change any code. Follow every rule. If a rule conflicts with a user task, ask the user before you break the rule.

## 1. Project Overview

- This is a monorepo with two apps in one repository.
- Frontend lives in `./frontend`.
- Backend lives in `./backend`.
- There is only ONE `AGENTS.md` (this file). It covers both frontend and backend.
- Work only inside the folder that the task needs. Do not edit the other app unless the task asks for it.

| Area     | Location     | Main tools                                          |
| -------- | ------------ | --------------------------------------------------- |
| Frontend | `./frontend` | React, React Router, axios, shadcn/ui, Tailwind CSS |
| Backend  | `./backend`  | Express, Drizzle ORM (MSSQL), swagger-autogen       |

## 2. General Rules

1. Read the task fully. Ask short questions if something important is missing.
2. Match the existing code style, naming, and structure. Do not invent a new style.
3. Make small, focused changes. Do not refactor unrelated code.
4. Do not add a new library if an existing one can do the job. If you must add one, tell the user why.
5. Never hard-code secrets, API keys, or passwords. Use environment variables.
6. Write clear names. Prefer simple code over clever code.
7. Use TypeScript types where the project uses TypeScript. Avoid `any`.
8. When you finish, give a short summary of what you changed and which files you touched.

---

## 3. Frontend Rules (`./frontend`)

### 3.1 API communication: axios only

- ALL communication with the backend MUST go through `axios`.
- Do NOT use `fetch`, `XMLHttpRequest`, or any other HTTP client.
- The endpoint is given by the user in each task or command. Use exactly that endpoint.
- NEVER guess, invent, or change an endpoint. If the endpoint is missing, ask the user.
- Use one shared axios instance at `src/shared/lib/axios.ts` (base URL from an environment variable). Do not call `axios.create` in other files.
- Put API calls in a module `services/` folder (see 3.5). Components and pages must not call axios directly. They call a service function or a hook.
- Handle loading, success, and error states for every request.

### 3.2 UI: shadcn first, then Tailwind CSS

Follow this order for every UI component:

1. **First choice: shadcn/ui.** Build the component with shadcn components.
2. **Second choice: Tailwind CSS.** Only if shadcn cannot do it, build it with Tailwind utility classes.
3. **Forbidden: vanilla CSS.** Do NOT write plain CSS, CSS modules, SCSS, or inline `style={{}}` for styling. Do not create new `.css` files for components.

Extra rules:

- Compose shadcn components together before you decide "shadcn cannot do it".
- Use the `cn()` helper for conditional class names.
- Do not edit the generated files in `src/shared/components/ui/` unless the task asks for it.
- If you use Tailwind because shadcn cannot do the job, add a short comment saying why.

### 3.3 shadcn documentation: read it first (MANDATORY)

- Before you use or build ANYTHING with shadcn, you MUST read ALL files in `./frontend/agents/*`.
- Read every file. Do not skip any file. Do not read only some of them.
- Read them again at the start of each new task that touches shadcn, because the docs may change.
- If `./frontend/agents/*` does not exist or is empty, stop and tell the user. Do not guess how shadcn works.

### 3.4 Routing: React Router only

- ALL routing MUST use React Router.
- Do NOT use another router and do not write a custom router.
- Use `Link`, `NavLink`, `useNavigate`, `useParams`, and `Outlet` from React Router.
- Define routes per module (`src/modules/<module>/routes.tsx`). Combine them in one root router at `src/app/router.tsx`.
- Lazy-load module pages with `React.lazy` or the router's `lazy` option when it makes sense.

### 3.5 Component structure: module-first

The project is split by MODULE first. Inside each module, code is split by type (pages, layouts, components, widgets, hooks, and so on).
This is the ONE structure to use. Do not use any other structure.

```
frontend/
├── agents/                      # shadcn docs (read before using shadcn)
└── src/
    ├── app/                     # app setup only
    │   ├── router.tsx           # root router, combines module routes
    │   ├── providers.tsx        # global providers
    │   └── main.tsx
    ├── modules/                 # one folder per feature module
    │   └── <module>/            # e.g. auth, users, products
    │       ├── pages/           # route-level screens
    │       ├── layouts/         # layouts used only by this module
    │       ├── components/      # small UI parts used only by this module
    │       ├── widgets/         # bigger self-contained blocks (UI + logic)
    │       ├── hooks/           # React hooks of this module
    │       ├── services/        # axios API calls of this module
    │       ├── types/           # TypeScript types of this module
    │       ├── utils/           # helper functions of this module
    │       ├── routes.tsx       # route definitions of this module
    │       └── index.ts         # public exports of this module
    └── shared/                  # code used by 2+ modules
        ├── components/
        │   └── ui/              # shadcn generated components
        ├── layouts/
        ├── widgets/
        ├── hooks/
        ├── lib/                 # axios instance, cn(), config
        ├── types/
        └── utils/
```

Rules for this structure:

- A new feature goes into its own folder in `src/modules/<module>/`.
- Use `kebab-case` for folders and files. Use `PascalCase` for component names. Use `camelCase` for hooks (`useXxx`) and functions.
- Keep code inside its module. Move code to `src/shared/` ONLY when two or more modules need it.
- A module must NOT import from the internal folders of another module. Import only from that module's `index.ts`, or move the code to `src/shared/`.
- Only create the sub-folders a module really needs. Do not create empty folders.
- What is the difference between `components` and `widgets`:
  - `components` = small, simple UI pieces with little or no business logic.
  - `widgets` = larger blocks that combine components, hooks, and services to do one job (for example a data table with filters).

### 3.6 Frontend checklist (before you finish)

- [ ] All HTTP calls use axios, and the endpoint is the one the user gave.
- [ ] UI uses shadcn first. Tailwind only when needed. No vanilla CSS.
- [ ] I read all files in `./frontend/agents/*` before using shadcn.
- [ ] Routing uses React Router.
- [ ] Files are in the correct module folder and sub-folder.

---

## 4. Backend Rules (`./backend`)

### 4.1 Existing backend structure

This repository does not use a `src/modules/` layout. The actual backend is organized by resource and layer, with the following structure under `./backend/src`:

```
backend/
└── src/
    ├── controllers/                 # resource controllers (e.g. stallController.ts)
    ├── routes/                      # Express routers (e.g. stallRouter.ts)
    ├── services/                    # business logic (e.g. stallService.ts)
    ├── repositories/               # Drizzle data access (e.g. stallRepository.ts)
    ├── dtos/                       # request/response DTO types (e.g. stallDto.ts)
    ├── middleware/                 # auth, role, audit, and request guards
    ├── db/
    │   ├── index.ts                # Drizzle db instance
    │   └── schema.ts               # database tables and schema
    ├── docs/                       # Swagger output and generation config
    ├── utils/                      # shared helpers
    ├── index.ts                    # app startup and route mounting
    └── ...
```

The repo uses resource naming such as `stallRouter.ts`, `stallController.ts`, `stallService.ts`, `stallRepository.ts`, and `stallDto.ts`. Do not introduce a new `src/modules/` structure in this backend unless the task explicitly requires a major refactor.

### 4.2 Request flow

The backend follows the standard app flow used in this repo:

```
Route  →  Controller  →  Service  →  Repository  →  Database (Drizzle)
```

Middleware such as `authMiddleware`, `roleMiddleware`, and `auditMiddleware` sits around the route and runs before the controller logic.

- `routes/` defines the URL path, method, middleware, and Swagger comments for the endpoint.
- `controllers/` reads request params/query/body, calls the service, and sends the HTTP response.
- `services/` contains business rules and validation logic.
- `repositories/` uses Drizzle for all database operations.
- `db/schema.ts` contains the database schema definitions.

### 4.3 File and naming conventions

- Keep the existing resource-based naming pattern: `<resource>Router.ts`, `<resource>Controller.ts`, `<resource>Service.ts`, `<resource>Repository.ts`, `<resource>Dto.ts`.
- Use Express `Router()` in `src/routes/` and mount those routers in `src/index.ts`.
- Put auth/authorization/audit checks in `src/middleware/` and reuse them from routes.
- Keep DTOs in `src/dtos/` and use them for the payload/response shapes already used by the backend.

### 4.4 Database: Drizzle ORM

- Use **Drizzle ORM** for all database access. Do not write direct SQL unless it is required and already matches the project patterns.
- Define tables in `src/db/schema.ts` and keep the existing naming conventions (`USERS`, `STALLS`, `MENU_ITEMS`, `REVIEWS`, etc.).
- Use Drizzle connection helpers from `src/db/index.ts`.
- Prefer Drizzle inferred types (`$inferSelect`, `$inferInsert`) when the project pattern allows it.
- Do not change the database by hand; changes should follow the project’s migration flow.

### 4.5 API documentation: Swagger

- Swagger is generated from route comments and the generated output in `src/docs/swagger-output.json`.
- Add or update the Swagger comments in the router file when a route is added or changed.
- Keep the documented route path, middleware, parameters, request payloads, and response codes aligned with the actual Express handlers.
- Do not invent endpoints or change the API contract without updating the relevant router and docs in the same change.

### 4.6 Backend checklist (before you finish)

- [ ] The flow remains Route → Controller → Service → Repository.
- [ ] Business logic stays in `src/services/`, and database access stays in `src/repositories/`.
- [ ] Route files stay in `src/routes/` and use existing resource naming.
- [ ] Database access uses Drizzle and matches the current schema in `src/db/schema.ts`.
- [ ] Swagger comments/docs are updated when routes change.
- [ ] I did not convert the backend to a different structure than the one already used by the repository.

---

## 5. When Frontend and Backend Work Together

- The backend Swagger docs are the contract. The user gives the endpoint for each frontend task. Use that endpoint with axios.
- If a frontend task needs an endpoint that does not exist yet, tell the user. Do not invent it on the frontend side.
- Keep request and response types in sync between the two apps. If you change one side, tell the user what must change on the other side.
