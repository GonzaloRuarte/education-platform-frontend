# Implementation Status

## Done in the current package

- Runtime DB Admin resource discovery through backend `surface=db_admin`.
- Generic list/create/detail/edit/delete/batch-delete without compile-time
  resource, table, model, field, enum, or relation maps.
- Record actions use backend-owned `__identity` and `__resource_urls`; the
  frontend does not build primary-key URLs.
- Public API schema consumption is trimmed to data the frontend actually uses.
  Backend-only contract blocks are no longer typed or displayed by the
  frontend.
- Every backend field label used by the DB Admin schema is expected to include
  `i18n.label.en` and `i18n.label.es`; the frontend resolves labels globally
  through the language selector.
- Frontend-owned chrome text is localized in English and Spanish.
- Validation hints are localized in the frontend, deduplicated before display,
  and based only on public machine-readable validation metadata. Backend
  validation remains authoritative.
- Generic visual filters use backend `list_query_contract` operator metadata.
- Relation selectors use backend option endpoints and declared dependency,
  priority, page-size, and typeahead metadata.
- Resource descriptions, admin help text, destructive-action metadata, related
  lists, and display labels are rendered generically from backend metadata.
- The left menu and main panel scroll independently on desktop.
- Resource/table groups in the left menu are collapsible and persisted locally.
- Narrow screens use a stacked responsive layout with bounded menu height.
- Light/dark theme and English/Spanish language selectors are persisted locally.
- Request-id-aware generic errors and toast feedback are implemented.
- Static yearly setup workbook shell is implemented: template download,
  XLSX upload to dry-run, grouped workbook errors/warnings, safe in-app
  cell corrections that are sent back to the backend as `corrected_values`,
  duplicate-row omission decisions, dangerous-warning confirmations, and
  final commit-plan preview. Business-row writes are still backend/runtime-gated.
- Static audit-view workflow is implemented: scoped mutation-batch and audit-event
  list/detail views call `/api/db-admin-audit/batches/` and
  `/api/db-admin-audit/events/` only, display backend redaction metadata, and
  do not expose generic/raw audit table CRUD.
- Static platform resource-exposure inspection workflow is implemented: the UI
  calls `/api/db-admin-resource-exposure/manifest/`, displays platform-only
  exposure counts, redacted hidden/internal resource metadata, filters by
  exposure/search, and does not expose hidden resources as generic CRUD.

## Not done / not proven

- Authenticated Docker/browser smoke was not run in this environment; it needs
  Docker plus `RETROBOLT_ADMIN_USERNAME` and `RETROBOLT_ADMIN_PASSWORD`.
- Product-copy review may still improve some generated English/Spanish labels.
  Mechanical bilingual coverage is enforced, but fallback wording is generic.
- No product/business dashboard yet. This package is only the DB Admin generic
  CRUD shell.
- No explicit workflow frontend for appointments, resolutions, reports,
  evaluation authoring, password recovery, or scoped business dashboards.
- Setup workbook import UI is static-checked only here; authenticated
  browser/API smoke and real runtime commit remain pending.
- Audit-view UI is static-checked only here; authenticated browser/API smoke for
  platform, organization, and institution audit scopes remains pending.
- Resource-exposure inspection UI is static-checked only here; authenticated
  platform API/browser smoke remains pending.
- No optimistic updates/offline behavior. DB Admin CRUD remains online and
  backend-authoritative.
- No generated OpenAPI client. The generic resource schema is the runtime source
  of truth.

## Backend metadata policy

The frontend may ask the backend for more runtime metadata when a real UI need
appears, but it must not reintroduce model-specific frontend maps. Backend-only
policy/testing/migration/auth documentation should stay out of public schema
payloads unless the frontend starts actually using it for runtime behavior.

## Action access / capability privacy

Complete for the reviewed package. Login/session data contains tokens plus user
identity only; the frontend does not store or inspect capability strings. The
generic DB Admin UI uses backend-provided resource `actions` booleans and
endpoint status codes instead.
