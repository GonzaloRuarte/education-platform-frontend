# DB Admin Completion Plan

Scope: finish the runtime-discovered DB Admin with the least frontend code.
Business workflows are intentionally out of scope.

Backend source of truth:

- `../meta-backend/docs/GENERIC_RESOURCE_RECORDS_API.md`
- `../meta-backend/docs/GRID_LIST_API_CONTRACT.md`
- `../meta-backend/docs/SSOT_MODEL_GUIDELINES.md`
- `../meta-backend/docs/DB_ADMIN_TARGET_REQUIREMENTS.md`

## Current state

This frontend supports the current DB Admin shell:

- login through `POST /api/token/` and refresh through
  `POST /api/token/refresh/`;
- no frontend capability-name gate; DB Admin access is decided by backend resource discovery status and action booleans;
- runtime resource discovery through `surface=db_admin`;
- generic list/create/detail/edit/delete/batch-delete through backend-owned
  resource URLs, backend-provided action booleans, opaque record identities, and per-record URLs;
- enum/static options from backend metadata;
- relation options through backend option endpoints, including typeahead,
  priority, page-size, and dependency filters when declared;
- quick search, visual column filters, sorting, pagination, URL-backed list
  state, and generic request-id-aware error display;
- backend-owned related-list row actions;
- backend-owned field UI hints for form sections, priority, width, and
  placeholders;
- backend-owned English/Spanish resource, field, option, and action labels where
  rendered;
- frontend-owned English/Spanish chrome labels and localized, deduplicated
  validation hint text;
- independent desktop scrolling for the left menu and main content;
- collapsible/persisted resource groups in the left menu;
- responsive layout for narrow screens;
- light/dark theme selector persisted locally.

The frontend no longer types, displays, or expects backend-only API contract
blocks such as model SSOT, record payload, validation, authorization, migration,
logging, UX, testing contracts, capability names, or current-user capability
lists. Those rules remain in backend docs/manifests/tests. The frontend only
uses public booleans such as `schema.actions.create`/`update`/`delete` and HTTP
403/404 responses to decide what the backend allowed.

## Smallest remaining frontend work

1. Run authenticated Docker/browser smoke in a Docker-enabled release
   environment with `RETROBOLT_ADMIN_USERNAME` and
   `RETROBOLT_ADMIN_PASSWORD`.
2. Add optional browser-driven CRUD smoke coverage against a live backend.
3. Add richer product copy only through backend metadata when current fallback
   labels or generic validation wording are not good enough.

Do not add model-specific maps while waiting for backend metadata. Keep generic
navigation, backend-driven relation option loading, and backend-owned record URLs
as the only record-action path.

## Done criteria

The DB Admin frontend is release-done when:

- `npm test` passes;
- a smoke test logs in and opens the DB Admin shell;
- representative create, update, delete, and batch-delete flows work;
- relation options load for FK and many-to-many fields;
- at least one generic visual column filter works using backend operator
  metadata;
- the left menu and main content scroll independently on desktop and remain
  responsive on narrow screens;
- resource groups are collapsible without compile-time resource lists;
- every rendered backend field label is available in English and Spanish;
- the frontend contains no compile-time resource lists, field labels, enum
  values, relation maps, or model-specific CRUD URLs.

## Current completion status

Locally complete for the code paths covered by tests: `npm test` passed for the
reviewed package, and the paired backend suite is green locally. Whole-product
release completion still requires authenticated Docker/browser smoke with real
credentials.
