# Copilot Instructions for FBS2.0

## Project Overview

Football/soccer tournament management system tracking UEFA European club competitions (UCL, UEL, UECL, and historical CWC/ICFC). **Nx monorepo** with NestJS backend, React frontend, and shared TypeScript libraries.

## Architecture

| Layer        | Path              | Stack                                            |
| ------------ | ----------------- | ------------------------------------------------ |
| Backend      | `apps/backend/`   | NestJS, TypeORM, PostgreSQL, JWT auth            |
| Frontend     | `apps/frontend2/` | React 19, Vite, Ant Design, TanStack Query, i18n |
| Shared Types | `libs/types/`     | TypeScript interfaces, enums, constants          |
| Shared Utils | `libs/utils/`     | Business logic shared between frontend/backend   |

Import shared libs via `@fbs2.0/types` and `@fbs2.0/utils` (configured in [tsconfig.base.json](../tsconfig.base.json)).

## Key Patterns

### Backend Entities & Controllers

- Entities implement interfaces from `@fbs2.0/types`:
  ```typescript
  // apps/backend/src/club/entities/club.entity.ts
  import { Club as ClubInterface } from "@fbs2.0/types";
  @Entity()
  export class Club implements ClubInterface { ... }
  ```
- **Dual controller pattern**: Legacy controllers (`_club.controller.ts`) at root path, new versioned controllers (`club.controller.ts`) at `/v2/` prefix
- Use `AccessTokenGuard` for protected endpoints with `@UseGuards(AccessTokenGuard)` and `@ApiBearerAuth()`

### Frontend React Query Hooks

Organized by domain in `apps/frontend2/src/react-query-hooks/`:

- Query keys centralized in [query-key.ts](../apps/frontend2/src/react-query-hooks/query-key.ts)
- Pattern: `useGet*` for queries, `useCreate*/useUpdate*/useDelete*` for mutations
- Mutations use `onMutate` for success toast messages via translation keys

### Internationalization (i18n)

- Languages: `en` (English), `ua` (Ukrainian)
- Translation files: `apps/frontend2/public/locales/{en,ua}/`
- Entity fields use `name` + `name_ua` pattern for bilingual content

### API Client

Singleton pattern in [api.client.ts](../apps/frontend2/src/api/api.client.ts) with:

- Automatic token injection via interceptors
- Token refresh on 401 responses
- Backend URL configured via `VITE_BACKEND_HOST`, `VITE_BACKEND_PORT` env vars

## Domain Concepts

- **Tournaments**: UCL (Champions League), UEL (Europa League), UECL (Conference League), CWC (Cup Winners' Cup - historical), ICFC (Fairs Cup - historical)
- **Season format**: `"YYYY-YYYY"` (e.g., `"2024-2025"`)
- **Stages**: Qualification rounds → Group/League stage → Knockout rounds → Final
- **Coefficients**: UEFA club and country coefficient calculations

## Development Commands

```bash
# Start development servers
npx nx serve backend      # NestJS backend (port 3331)
npx nx serve frontend2    # React frontend (Vite)

# Full stack with Docker
docker compose up

# Build for production
npx nx build backend
npx nx build frontend2

# Linting
npx nx lint backend
npx nx lint frontend2
```

## Environment Variables

Backend requires (via `.env` or Docker):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, `DATABASE_PASSWORD`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRATION_TIME`, `VITE_JWT_REFRESH_EXPIRATION_TIME`

Frontend uses Vite env vars (`VITE_*` prefix):

- `VITE_BACKEND_HOST`, `VITE_BACKEND_PORT`, `VITE_API_PREFIX`, `VITE_SSL`

## File Naming Conventions

- Backend entities: `{name}.entity.ts` with corresponding `{name}.dto.ts`
- Frontend components: PascalCase folders with `index.tsx` + `styles.module.scss`
- React Query hooks: `use{Action}{Entity}.ts` (e.g., `useGetClubs.ts`, `useUpdateClub.ts`)
