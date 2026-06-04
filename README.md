# Retrobolt Runtime DB Admin Frontend

This is a clean frontend implementation for the cleaned Retrobolt backend DB Admin surface.

It is intentionally small and generic:

- no React, Next, MUI, or generated client dependency;
- no compile-time table/model/resource list;
- no compiled field labels, field types, enum values, relation labels, or CRUD URLs per resource;
- no legacy dashboard routes or old capability vocabulary;
- ordinary CRUD is discovered from the backend at runtime through `surface=db_admin`.

## Runtime contract

The frontend uses only these backend contracts:

```text
POST /api/token/
POST /api/token/refresh/
GET /api/resources/?surface=db_admin
GET /api/resources/{resource_key}/?surface=db_admin
GET /api/resources/{resource_key}/records/?surface=db_admin
POST /api/resources/{resource_key}/records/?surface=db_admin
GET /api/resources/{resource_key}/records/{record_pk}/?surface=db_admin
PATCH /api/resources/{resource_key}/records/{record_pk}/?surface=db_admin
DELETE /api/resources/{resource_key}/records/{record_pk}/?surface=db_admin
GET /api/resources/{resource_key}/options/{field_key}/?surface=db_admin
```

The only capability name compiled into the frontend is `access_db_admin`, because this app is only the DB Admin shell.
Resource/action/field truth still comes from backend metadata.

## Local commands

```bash
npm run typecheck
npm run build
npm run validate
```

`npm run build` compiles `src/app.ts` into `dist/assets/app.js` and copies `public/*` into `dist/`.

The built app is static. Serve `dist/` from any static server. Configure the backend origin through runtime config:

```js
window.__RETROBOLT_ADMIN_CONFIG__ = { apiBaseUrl: "https://backend.example.com/api" };
```

The Docker runner writes `dist/config.js` from `NEXT_PUBLIC_API_BASE_PATH` when the container starts. Leave it blank only when the frontend and backend are served from the same origin. Users do not set the API URL on the login screen.

## Design constraints

The admin does not know what tables/resources exist at compile time. It discovers them from `/api/resources/?surface=db_admin` after login.

The admin does not define forms per model. It renders fields based on backend schema metadata:

- `type`
- `label`
- `required`
- `nullable`
- `editable`
- `readonly_on_update`
- `write_only`
- `visible_in_list`
- `pii`
- `option_source`
- `relation`
- `sortable`, `filterable`, `searchable`

The admin does not create product workflows. It is for ordinary DB Admin CRUD only.
Appointments, resolution workflows, reports, evaluation authoring, imports, password recovery, and other product commands should remain explicit future apps/pages fed by backend workflow metadata.

## Completion plan

The smallest remaining work is tracked in
[`docs/DB_ADMIN_COMPLETION_PLAN.md`](docs/DB_ADMIN_COMPLETION_PLAN.md).
