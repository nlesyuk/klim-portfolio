# Backend Upgrade Plan: Node/Express → Modern Node/TS Stack

Upgrade plan for `packages/backend` (Node + Express 4, plain JS/CommonJS, raw `pg`, JWT) to a maintainable, typed, secure stack while keeping the public HTTP contract that `packages/frontend` depends on.

## Decisions

| Topic           | Choice                                                          | Reason                                                              |
| --------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Language        | **TypeScript** (CommonJS → ESM)                                 | Catches the bugs `noImplicitAny` would catch; shared types with FE  |
| Web framework   | **Stay on Express 5**                                           | Express 5 fixes async error handling; minimal API churn vs. rewrite |
| Module system   | **ESM** (`"type": "module"`)                                    | Node default; aligns with frontend                                  |
| Validation      | **Zod**                                                         | Schema = runtime check + inferred TS type; pairs with shared models |
| DB layer        | **Kysely** on top of existing `pg`                              | Type-safe query builder; no migration of existing SQL semantics     |
| Migrations      | **node-pg-migrate** (or Kysely-migrator)                        | Capture current `db/database.sql` as versioned migrations           |
| Auth            | Keep JWT, bump `jsonwebtoken@9`                                 | v8 is EOL; v9 has algorithm-confusion fix (`CVE-2022-23529`)        |
| File storage    | **Multer → S3-compatible (R2/MinIO)** with `@aws-sdk/client-s3` | Local disk doesn't survive container restarts; PWA scaling          |
| Logging         | **pino** + `pino-http`                                          | Structured JSON logs; ~5× faster than console.log + replaces it     |
| Process manager | **Docker** + healthcheck endpoint                               | Stop hand-rolling `nodemon`-in-prod; orchestration handles restart  |
| Tests           | **Vitest** + **supertest**                                      | Same runner as future FE tests; clean ESM support                   |
| Lint            | ESLint flat config + `@typescript-eslint@7`                     | Match frontend Phase 1                                              |
| Node version    | **Node 24 LTS**                                                 | Active LTS since 2025-10; maintained until ~2028-04                 |

## Current state inventory

- **Framework:** Express `^4.17.1` (CommonJS, plain JS, ~2,360 LOC)
- **Files:** 6 controllers (auth 182, contact 227, photoCollections 471, shots 360, slider 463, work 533), 7 routes, 2 middleware, `db/index.js` (single pg `Pool`), `db/database.sql` (raw schema)
- **DB:** PostgreSQL via `pg@^8.7.1` — mostly parameterized, **but** `work`/`photoCollections` controllers built multi-row INSERT/UPDATE via template-literal string concat of user input (`format`, image filename, `order`, `id`) → real SQL-injection vectors. Closed in Phase 4 by Kysely (all queries parameterized).
- **Auth:** `jsonwebtoken@^8.5.1` (EOL), `bcryptjs@^2.4.3`, refresh-token flow already present
- **Uploads:** `multer@^1.4.3` on disk under `public/uploads/<domain>/<category>/` — disk-storage with custom filename pattern
- **Multi-tenancy:** Hard-coded user-IDs in `global/constants.js` keyed by `domain` header from FE (`klimstepan.com=1`, `derzhanovska.com=2`)
- **Env:** Custom `IS_PROD` flag toggles between `DB_PROD_*` and `DB_LOCAL_*` env vars (non-standard; should use `NODE_ENV` + 12-factor URLs)
- **Lint:** ESLint 8 + `eslint-config-airbnb-base@15`

## Risk inventory (must address before / during migration)

| #   | Severity | Issue                                                                                               | Where                      |
| --- | -------- | --------------------------------------------------------------------------------------------------- | -------------------------- |
| R1  | 🔴 high   | `jsonwebtoken@8` is EOL — known CVEs                                                                | `package.json`             |
| R2  | 🔴 high   | No `helmet`, no rate limiting, no body-size cap on `urlencoded` (50 MB)                             | `index.js`                 |
| R3  | 🔴 high   | `cors()` with empty config → wildcard origin                                                        | `index.js`                 |
| R4  | 🟡 med    | `app.use(multer({ storage }).any())` runs **before** auth middleware — unauth file uploads possible | `index.js`                 |
| R5  | 🟡 med    | `res.sendStatus(401).send({ message })` — `sendStatus` already sends; the `.send` no-ops            | `middleware/authJwt.js:17` |
| R6  | 🟡 med    | Errors in `multer.diskStorage.destination` callback don't bubble — silent failure mode              | `index.js`                 |
| R7  | 🟡 med    | Hard-coded tenant map; no way to onboard a 3rd site without code change                             | `global/constants.js`      |
| R8  | 🟢 low    | `console.log`/`console.error` everywhere — unparseable in prod                                      | all controllers            |
| R9  | 🟢 low    | No graceful shutdown; `server.setTimeout(5000)` only                                                | `index.js`                 |
| R10 | 🟢 low    | `interfaces/index.js` is empty stub — leftover from never-finished TS attempt                       | `interfaces/index.js`      |

---

## Phase 0 — Audit & contract freeze (≈1 day) ⬜ BLOCKED (needs running prod DB + FE smoke env)

Goal: capture **what cannot change** so the FE keeps working through every phase.

1. Generate `docs/backend-audit.md` with:
   - Route table: `METHOD path → controller → response shape` (one row per endpoint). Each row is a contract.
   - Schema dump from current DB (`pg_dump --schema-only`) reconciled against `db/database.sql` (the SQL file may drift from prod).
   - Multer storage layout — list every `<domain>/<category>` directory in production to confirm path conventions.
2. Smoke-test FE↔BE locally: full CRUD on photos/shots/slides/works/contacts with both `klimstepan.com` and `derzhanovska.com` headers. Record any 5xx as known-bad before touching anything.

**Exit criteria:** route table committed; schema captured; smoke baseline documented.

---

## Phase 1 — Security hardening + dep bumps (≈1 day) ✅ DONE

No structural changes — just close known holes and bump EOL deps.

1. **Bump deps:**
   - `jsonwebtoken@^9.0` (algorithm-confusion fix; **breaking**: `verify` rejects when `algorithms` is unset — pass `{ algorithms: ['HS256'] }`)
   - `multer@^1.4.5-lts.1` (security patches; full `multer@2` upgrade deferred to Phase 6)
   - `dotenv@^16`
   - `uuid@^10`
   - `bcryptjs@^2.4.3` → swap for `bcrypt@^5` (native, faster) **or** keep bcryptjs if cross-platform Docker builds matter
   - `eslint@^9` + flat config (mirrors FE Phase 1)
2. **Add security middleware** in `index.js`:
   ```js
   app.use(helmet());
   app.use(rateLimit({ windowMs: 60_000, max: 60 }));   // tune per-route later
   app.use(express.json({ limit: '1mb' }));             // already there
   app.use(express.urlencoded({ limit: '1mb' }));       // ← was 50mb, drop
   ```
3. **CORS allowlist** — replace empty config with explicit origin list from env:
   ```js
   app.use(cors({
     origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? false,
     credentials: true,
   }));
   ```
4. **Move multer behind auth** for write routes — currently `app.use(multer(…).any())` runs globally, including before `verifyToken`. Refactor to per-route `upload.array('photos[]')` on protected routes only.
5. **Fix `sendStatus + send` bug** in `middleware/authJwt.js:17` → `res.status(401).send({ message })`.

**Exit criteria:** `npm audit` clean (or only vetted advisories); requests over 1 MB body rejected; CORS rejects unknown origins; `multer` does not handle uploads on unauth routes.

---

## Phase 2 — Node 24 LTS + ESM + TypeScript (≈2–3 days) ✅ DONE

Migrate the runtime and the language. Do this before Kysely/Zod so they land on typed code.

1. **Engine:** add `"engines": { "node": ">=24" }` to `package.json`; switch CI/Docker base image to `node:24-alpine`.
2. **ESM:** set `"type": "module"`; rename `index.js` → `src/index.ts`; convert every `require()` to `import`. Express 4 fully supports ESM.
3. **TS setup:**
   - `tsconfig.json`: `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `strict: true`, `noImplicitAny: true`, `esModuleInterop: true`, `outDir: dist`, `rootDir: src`.
   - Add `tsx` (or `ts-node` with `--esm`) for dev runtime; `tsc` for build.
   - Scripts: `dev: "tsx watch src/index.ts"`, `build: "tsc"`, `start: "node dist/index.js"`.
4. **Convert files incrementally** — controllers in dependency order (auth → contact → photos → shots → slider → work). Each file gets:
   - Typed `req`/`res` (`import type { Request, Response } from 'express'`)
   - Typed query result rows (interim: `unknown[]`, tightened in Phase 3)
   - `async` handlers wrapped with a `asyncHandler(fn)` util so thrown errors propagate (Express 4 swallows them by default — Express 5 fixes this; if you upgrade to Express 5 here, drop the wrapper)
5. **Delete the empty `interfaces/index.js`**.

**Exit criteria:** `tsc --noEmit` clean; `npm run dev` boots; FE smoke still passes.

---

## Phase 3 — Domain models shared with FE + Zod validation (≈1–2 days) ✅ DONE

The frontend now has `packages/frontend/src/models/index.ts` (Phase 7 of FE). Mirror those types on the backend so the contract is enforced in one place.

1. **Extract shared models** to `packages/shared/` (new workspace package):
   - `Photo`, `PhotoCollection`, `Shot`, `Slide`, `Work`, `Contact`, `Category`, `User`
   - FE imports `from '@klim/shared'`; BE imports the same. One source of truth.
2. **Validation schemas** per resource in `packages/backend/src/schemas/`:
   ```ts
   export const CreateWorkInput = z.object({
     title: z.string().min(2),
     videoId: z.string().min(9).max(20),
     order: z.coerce.number().int(),
     description: z.string().optional(),
     credits: z.string().optional(),
   });
   export type CreateWorkInput = z.infer<typeof CreateWorkInput>;
   ```
3. **Validation middleware** that runs `schema.parse(req.body)` and replaces `req.body` with the parsed value. Failures → 400 with the Zod issue list.
4. **Strip the manual `if (!field) throw …` checks** from every controller — they're now redundant and inconsistent.

**Exit criteria:** every write endpoint has a Zod schema; bad input returns 400 with structured errors (not 500); FE error rendering still works.

---

## Phase 4 — Typed DB layer with Kysely (≈2 days) ✅ DONE (codegen pending prod creds)

Keep `pg` as the driver. Wrap it with [Kysely](https://kysely.dev) for type-safe queries. No ORM, no magic — same SQL, just typed.

1. **Schema dump → TS types** with `kysely-codegen` against the running dev DB:
   ```ts
   export interface Database {
     users: UsersTable;
     work: WorkTable;
     photos: PhotosTable;
     shot: ShotsTable;
     photo: PhotoTable;     // note: singular `photo` (collection meta) vs plural `photos` (files)
     slides: SlidesTable;
     general: GeneralTable;
   }
   ```
2. **`src/db/index.ts`** exposes a singleton `Kysely<Database>` over the existing `pg.Pool`.
3. **Migrate controllers one at a time** — `db.query('SELECT …', [a, b])` → `db.selectFrom('work').where('id', '=', id).selectAll().executeTakeFirst()`. Keep complex queries as raw `sql\`…\`` template literals where the builder is awkward.
4. **Migrations:** initialize `node-pg-migrate`. First migration is the current `database.sql` verbatim (so prod is already "at head"). All future schema changes go through migrations.

**Exit criteria:** zero `db.query(string, params)` calls left; every controller speaks Kysely; `npm run migrate up` is a no-op against prod.

---

## Phase 5 — Error handling, logging, observability (≈1 day) ✅ DONE

1. **Replace console.log/error** with `pino` + `pino-http`:
   - Request log per req (method, path, status, latency, requestId).
   - Controller logs use `logger.info({ workId }, 'work created')` not string concat.
   - Pretty-print in dev (`pino-pretty`), JSON in prod.
2. **Error middleware** at the bottom of `src/index.ts`:
   ```ts
   app.use((err, req, res, _next) => {
     req.log.error({ err }, 'request failed');
     if (err instanceof ZodError) return res.status(400).json({ issues: err.issues });
     if (err instanceof DomainError) return res.status(err.status).json({ message: err.message });
     return res.status(500).json({ message: 'Internal Server Error' });
   });
   ```
   This replaces the per-controller `try/catch → res.status(500)` boilerplate (each controller currently has ~6 of these — ~50 LOC removed).
3. **`/health` endpoint** that pings the DB pool.
4. **Graceful shutdown:** on `SIGTERM`, stop accepting requests, drain in-flight, close `pg.Pool`.

**Exit criteria:** zero `console.*` calls in `src/`; uncaught errors return 500 with a clean payload; `/health` returns 200 OK; `kill -SIGTERM` exits within 10 s.

---

## Phase 6 — Object storage for uploads (≈2 days) ✅ DONE (creds stubbed; disk fallback when S3 unset; data-migration script not run)

Disk storage breaks the moment the backend runs in a container (writes lost on restart) or behind > 1 replica (each instance has its own disk). Move uploads to S3-compatible object storage.

1. **Pick a target** — Cloudflare R2 (cheap egress) or AWS S3 or self-hosted MinIO. All speak the S3 API.
2. **Swap multer storage engine:** `multer-s3@^3` + `@aws-sdk/client-s3`.
   - Key layout: `<domain>/<category>/<timestamp>_<filename>` (same as today, easier migration).
   - Bucket policy: private; FE reads via signed URL or a `/public/uploads/*` proxy route.
3. **One-time migration script** (`scripts/migrate-disk-to-s3.ts`) that walks the current `public/uploads/` tree and uploads each file, then rewrites the `image` column in `photos` to the new key. Run once, then delete the disk path from FS.
4. **Helper `getRightPathForImage()`** returns a signed URL (1 h TTL) for private images or a CDN URL for public ones — FE doesn't care which.
5. **Upgrade to `multer@2`** here (security release; not before because v2 has its own minor API changes, easier to do together with the storage swap).

**Exit criteria:** new uploads land in S3, not disk; old uploads accessible via the same FE URL contract; container can be killed/restarted with no data loss.

---

## Phase 7 — Tests (≈2 days) 🟡 SCAFFOLD (contract tests pass; live-DB integration pending)

There are no tests today. Add the minimum that catches the migration's regressions.

1. **Setup:** Vitest + `supertest` against an Express app exported from `src/app.ts` (separate from `src/index.ts` which calls `listen`).
2. **Integration tests** (Postgres in CI via `testcontainers` or `pg-mem`):
   - Auth: signup → signin → refresh → access protected route → logout.
   - One end-to-end CRUD per resource (work, photo, shot, slide, contact). Test the **HTTP contract**, not internal helpers.
3. **Schema-snapshot test:** run Zod over a sample of real production responses; ensures we don't accidentally drop a field.
4. **Skip:** unit tests for helpers — they're trivial; covered by integration.

**Exit criteria:** `npm test` runs in CI; auth flow + one CRUD per resource green; coverage ≥ 60% of `controllers/`.

---

## Phase 8 — Containerization & CI (≈1 day) ✅ DONE (Dockerfile/compose/CI written; not yet run in cloud)

1. **Dockerfile** (multi-stage):
   - `node:24-alpine` builder → `npm ci && npm run build`
   - `node:24-alpine` runner → `COPY --from=builder /app/dist /app/node_modules /app/package*.json /app`
   - Runs as non-root user; `HEALTHCHECK CMD wget -q http://localhost:8090/health || exit 1`.
2. **docker-compose.yml** for local dev: app + postgres + minio (S3-compatible).
3. **CI** (GitHub Actions): on every PR — `lint`, `typecheck`, `test`, `build`. On `main` — build + push image.
4. **README** updated with: 12-factor env vars, dev quickstart, deploy notes.

**Exit criteria:** `docker compose up` boots the whole stack from a clean checkout; CI green on `main`.

---

## Out of scope (explicit)

- Switching DB engines (Postgres stays)
- GraphQL / tRPC (REST contract preserved)
- Real-time / websockets
- Admin UI generation (e.g. AdminJS) — FE dashboard already covers it
- Internationalization / i18n
- Multi-region deployment

## Effort summary

| Phase                        | Days            |
| ---------------------------- | --------------- |
| 0 — Audit                    | 1               |
| 1 — Security + dep bumps     | 1               |
| 2 — Node 24 + ESM + TS       | 2–3             |
| 3 — Shared models + Zod      | 1–2             |
| 4 — Kysely + migrations      | 2               |
| 5 — Logging + error handling | 1               |
| 6 — S3 uploads               | 2               |
| 7 — Tests                    | 2               |
| 8 — Docker + CI              | 1               |
| **Total**                    | **~13–15 days** |

## Rollout strategy

- Each phase ships as a separate PR to `main`. None of phases 0–5 change the HTTP contract — safe to deploy continuously.
- Phase 6 (S3) is the only one with a data-migration step: run the migration script in a maintenance window, verify a sample of FE image renders, then flip the storage engine env var.
- Roll back = revert the PR. The DB schema only changes in Phase 4 (migrations introduced) — schema migrations are forward-only; design each to be reversible or to ship with a rollback migration.

## Risk register

| Risk                                                              | Mitigation                                                                                                |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `jsonwebtoken@9` rejects tokens issued by v8 if alg not specified | Force `algorithms: ['HS256']` on `verify` _and_ on `sign`; rotate `SECRET` is **not** required.           |
| ESM migration breaks `__dirname` usage in helpers                 | Replace with `fileURLToPath(import.meta.url)` once per module. Grep first to count sites.                 |
| Kysely codegen mismatch between `database.sql` and prod schema    | Run codegen against **prod** (read replica), not the SQL file.                                            |
| S3 migration script aborts halfway                                | Make idempotent: skip files where the target key already exists; track progress to a side table.          |
| Disk paths used by nginx for `/public/uploads/*` static serving   | Phase 6 must update nginx config (or add a proxy route on the backend) — coordinate with ops.             |
| `multer.any()` change breaks an unknown frontend upload field     | Phase 0 audit must enumerate every field name the FE sends (`photos[]`, `shots`, etc.) before tightening. |

## Open questions (resolve before Phase 1)

- Who owns the production DB credentials? Need them for Phase 4 codegen.
- Is `derzhanovska.com` still in production? If retired, tenant config simplifies.
- Hosting target — bare VPS, AWS, Fly.io, Railway? Determines Phase 8 specifics (Dockerfile is universal, but CI deploy steps differ).
- Budget for object storage? R2 is essentially free at this scale; S3 is ~$0.023/GB/mo.
