## Project Overview

Football/soccer tournament management system tracking UEFA European club competitions (UCL, UEL, UECL, and historical CWC/ICFC). Nx monorepo with NestJS backend, React 19 frontend, and shared TypeScript libraries.

| Layer          | Path              | Stack                                            |
| -------------- | ----------------- | ------------------------------------------------ |
| Backend        | `apps/backend/`   | NestJS, TypeORM, PostgreSQL, JWT auth            |
| Frontend (old) | `apps/frontend/`  | -- old version of the frontend (do not use)      |
| Frontend       | `apps/frontend2/` | React 19, Vite, Ant Design, TanStack Query, i18n |
| Shared Types   | `libs/types/`     | TypeScript interfaces, enums, constants          |
| Shared Utils   | `libs/utils/`     | Business logic shared between frontend/backend   |

Import shared libs via `@fbs2.0/types` and `@fbs2.0/utils` (configured in `tsconfig.base.json`).

## Development Commands

```bash
# Start development servers
npx nx serve backend      # NestJS backend (port 3331)
npx nx serve frontend2    # React frontend (Vite, port 4201)

# Full stack with Docker
docker compose up

# Build
npx nx build backend
npx nx build frontend2

# Lint
npx nx lint backend
npx nx lint frontend2

# Run tests (prefer nx over underlying tooling directly)
npx nx test backend
npx nx test frontend2

# Run a single test file
npx nx test backend --testFile=apps/backend/src/club/club.service.spec.ts

# Update dependencies
npx npm-check-updates -u

# Generate OpenAPI client (after updating openapi.json)
openapi-generator-cli generate -g typescript-axios -o apps/client/src/mono-api -i openapi.json --additional-properties='supportsES6=true'
```

Always run tasks through `nx` rather than calling underlying tools (jest, vitest, eslint) directly.

## Environment Variables

Backend (`.env`):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION_TIME`, `VITE_JWT_REFRESH_EXPIRATION_TIME`

Frontend (Vite `VITE_*` prefix):

- `VITE_BACKEND_HOST`, `VITE_BACKEND_PORT`, `VITE_API_PREFIX`, `VITE_SSL`

See `.env.example` for local setup; `.build.env` is used by Docker.

## Architecture & Key Patterns

### Backend

**Module structure**: Each domain (club, country, city, match, tournament, participant, coefficient, auth, user) has its own NestJS module with entity, service, and controller.

**Entity-interface pattern**: Entities implement interfaces from `@fbs2.0/types`:

```typescript
import { Club as ClubInterface } from "@fbs2.0/types";

@Entity()
export class Club implements ClubInterface { ... }
```

**Dual controller pattern**: Legacy controllers (`_club.controller.ts`) at root path; new versioned controllers (`club.controller.ts`) at `/v2/` prefix. New features go in versioned controllers.

**Auth**: Use `AccessTokenGuard` for protected endpoints:

```typescript
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
```

Swagger UI available at `/swagger`.

### Frontend

**React Query hooks**: Centralized in `apps/frontend2/src/react-query-hooks/` organized by domain.

- Query keys: `apps/frontend2/src/react-query-hooks/query-key.ts`
- Naming: `useGet*` for queries, `useCreate*/useUpdate*/useDelete*` for mutations
- Mutations use `onMutate` for success toast messages via i18n translation keys

**API client**: Singleton in `apps/frontend2/src/api/api.client.ts` with automatic JWT injection and token refresh on 401.

**Internationalization**: Bilingual English/Ukrainian. Translation files in `apps/frontend2/public/locales/{en,ua}/`. Entity fields use `name` (English) + `name_ua` (Ukrainian) pattern.

**Component structure**: PascalCase folders with `index.tsx` + `styles.module.scss`.

### File Naming Conventions

- Backend entities: `{name}.entity.ts` with `{name}.dto.ts`
- Frontend components: PascalCase directory with `index.tsx`
- React Query hooks: `use{Action}{Entity}.ts` (e.g., `useGetClubs.ts`, `useUpdateClub.ts`)

## Domain Concepts

- **Tournaments**: UCL (Champions League), UEL (Europa League), UECL (Conference League), CWC (Cup Winners' Cup — historical), ICFC (Fairs Cup — historical)
- **Season format**: `"YYYY-YYYY"` string (e.g., `"2024-2025"`)
- **Stages**: Qualification rounds → Group/League stage → Knockout rounds → Final
- **Coefficients**: UEFA club and country coefficient calculations (logic in `@fbs2.0/utils`)

## Formatting & Style

- always use curly braces for conditional blocks, loops, and functions even if they are single line
- divide blocks of code with empty lines for better readability
- add empty line before blocks
- prefer css classes over inline styles
- name css classes using defices (e.g. class-name) instead of camelCase (e.g. className)
- never delete existed empty lines
- always use colors from the design system (colors.$color-name) instead of hardcoded color values. Import colors from the file frontend2\src\style\colors.module.scss
- prefer arrow functions over function declarations
- for boolean variables and functions use "is" prefix (e.g. isLoading, isEnabled, isVisible)
- for functions that perform actions use verbs (e.g. fetchData, loadUser, saveChanges)
- keep line length under 120 characters
- keep only one React component per file and split components into separate files if they grow too large. Never exceed 400 lines in a single file.
