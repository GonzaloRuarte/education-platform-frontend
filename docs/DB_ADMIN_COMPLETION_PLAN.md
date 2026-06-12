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
- yearly setup workbook shell for the backend-owned Phase 5 workflow: template
  download, dry-run upload, grouped error/warning review, backend-owned
  `corrected_values` cell corrections, duplicate-row omission controls,
  dangerous-warning confirmations, audit reason text, and final commit-plan
  preview. The shell uses backend setup-workbook endpoints and does not guess
  workbook semantics in generic CRUD.
- scoped audit-view workflow for mutation batches and audit events through the
  dedicated `/api/db-admin-audit/` APIs. The UI shows backend-redacted
  projections and applied scope metadata, while keeping raw audit tables out of
  generic CRUD.
- platform resource-exposure inspection through
  `/api/db-admin-resource-exposure/manifest/`. The UI filters the redacted
  `ResourceMeta.exposure` manifest and does not add a raw internal-resource CRUD
  surface.

The frontend no longer types, displays, or expects backend-only API contract
blocks such as model SSOT, record payload, validation, authorization, migration,
logging, UX, testing contracts, capability names, or current-user capability
lists. Those rules remain in backend docs/manifests/tests. The frontend only
uses public booleans such as `schema.actions.create`/`update`/`delete` and HTTP
403/404 responses to decide what the backend allowed.

## Smallest remaining frontend work

1. Runtime-smoke the setup workbook workflow against a configured backend,
   including authorized/unauthorized template download, dry-run upload,
   warning confirmation, safe in-app cell corrections, duplicate omission,
   and final preview generation.
2. Runtime-smoke the audit-view workflow against a configured backend for
   platform, organization, and institution principals, including list/detail
   scope and redaction behavior.
3. Runtime-smoke the resource-exposure inspection workflow with a platform
   principal and prove non-platform principals cannot call the manifest API.
4. Run authenticated Docker/browser smoke in a Docker-enabled release
   environment with `RETROBOLT_ADMIN_USERNAME` and
   `RETROBOLT_ADMIN_PASSWORD`.
5. Add optional browser-driven CRUD smoke coverage against a live backend.
6. Add richer product copy only through backend metadata when current fallback
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
- setup workbook import/preview smoke proves the workflow shell can consume the
  backend manifest, dry-run result, backend-owned cell correction contract, and
  commit-plan result without business-row writes from the frontend.
- audit-view smoke proves the workflow shell can consume scoped batch/event
  list and detail responses without exposing raw audit resources as CRUD.
- resource-exposure smoke proves the platform-only manifest workflow can inspect
  redacted internal classification metadata without exposing hidden resources as
  generic CRUD.

## Current completion status

Locally complete for the code paths covered by tests: `npm test` passed for the
reviewed package, and the paired backend suite is green locally. Whole-product
release completion still requires authenticated Docker/browser smoke with real
credentials.
