# Connect Postgres to backend

Backend package (`packages/backend`) already wired for Postgres (`pg` in deps, `db/index.js` exports pool). Plan finish hookup, not start zero.

## 1. Provision Postgres

- Local (brew): `brew install postgresql@16` then `brew services start postgresql@16`.
- Local (Docker): `docker run --name klim-pg -e POSTGRES_PASSWORD=... -p 5432:5432 -d postgres:16`.
- Create DB + user:
  ```sql
  CREATE DATABASE klim;
  CREATE USER klim_app WITH PASSWORD '...';
  GRANT ALL ON DATABASE klim TO klim_app;
  ```

## 2. Env vars

`packages/backend/db/index.js` (lines 4–8) expect these keys. Create `packages/backend/.env`:

```
IS_PROD=0
DB_LOCAL_USER=klim_app
DB_LOCAL_PASSWORD=...
DB_LOCAL_HOST=127.0.0.1
DB_LOCAL_PORT=5432
DB_LOCAL_DBNAME=klim
DB_PROD_USER=...
DB_PROD_PASSWORD=...
DB_PROD_HOST=...
DB_PROD_PORT=5432
DB_PROD_DBNAME=...
```

Add `.env` to `.gitignore` if missing. Monorepo root `npm run backend` proxy to `packages/backend` dev script — env load from package `.env`.

## 3. Bootstrap schema

- Apply existing SQL: `psql -U klim_app -d klim -f packages/backend/db/database.sql`.
- Verify tables: `psql -U klim_app -d klim -c '\dt'`.

## 4. Harden pool (`packages/backend/db/index.js`)

- Coerce port to int: `parseInt(process.env.DB_LOCAL_PORT, 10)`.
- Add `ssl: { rejectUnauthorized: false }` when `IS_PROD=1` (prod DB often need TLS).
- Add `pool.on('error', err => console.error('pg pool error', err))`.
- Optional helper export:
  ```js
  module.exports = {
    pool,
    query: (text, params) => pool.query(text, params),
  };
  ```

## 5. Smoke test connection

In `packages/backend/index.js` on boot:

```js
require('./db').query('SELECT 1')
  .then(() => console.log('✅ DB connected'))
  .catch(err => console.error('❌ DB connect fail', err));
```

Run `npm run backend` from monorepo root, hit route that touch DB (e.g. auth login), confirm rows return.

## 6. Use in controllers

- Audit `packages/backend/controllers/` — each `require('../db')`, then `pool.query('SELECT ... WHERE id=$1', [id])`.
- Always parametrize (`$1`, `$2`). No string concat — SQL injection.
- Multi-statement writes wrap in transaction:
  ```js
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // ...
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  ```

## 7. Prod deploy

- Managed PG (RDS / DO / Supabase) or self-host.
- Open port 5432 only to backend host (firewall / security group).
- Set `IS_PROD=1` + prod env vars on server.
- Run schema migration once.
- Backups: `pg_dump` cron or managed snapshots.

## 8. Optional next

- Migration tool (`node-pg-migrate` or `knex`) replace raw `.sql` file.
- Pool tuning: `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`.
- Read replicas if read-heavy.
- Hoist `pg` to monorepo root only if frontend need shared types — currently backend-only, skip.
