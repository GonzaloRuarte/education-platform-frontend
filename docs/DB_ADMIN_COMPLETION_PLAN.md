# DB Admin Completion Plan

Scope: finish the runtime-discovered DB Admin with the least frontend code.
Business workflows are intentionally out of scope.

Backend source of truth:

- `../meta-backend/docs/DB_ADMIN_MINIMAL_COMPLETION_PLAN.md`
- `../meta-backend/docs/GENERIC_RESOURCE_RECORDS_API.md`
- `../meta-backend/docs/GRID_LIST_API_CONTRACT.md`
- `../meta-backend/docs/SSOT_MODEL_GUIDELINES.md`

## Current State

This frontend already supports the minimal DB Admin shell:

- login through `POST /api/token/`;
- token refresh through `POST /api/token/refresh/`;
- `access_db_admin` gate;
- runtime resource discovery through `surface=db_admin`;
- generic list/create/detail/edit/delete for single-primary-key resources;
- enum options from backend metadata;
- relation options through the backend options endpoint;
- backend-declared relation `option_control` metadata for generic typeahead selectors;
- quick search, generic visual column filters with backend-declared value controls, sorting, pagination, and generic error display;
- URL-backed selected-resource/list state for filters, sorting, page, and page size;
- backend-declared related-list row actions that open child resources with generic grid filters;
- backend-declared relation priority/dependency metadata for cascading selectors;
- backend-owned field presentation hints for generic form sections, priority, width, and placeholders;
- backend-owned `i18n` labels/messages/descriptions/help text resolved generically by an English/Spanish selector;
- backend-owned resource collection URLs and per-record detail/update/delete URLs when present, with generic single-key fallback;
- backend-owned record payload contract metadata for flat ID-based record shapes;
- backend-owned migration/query safety contract metadata;
- generic batch-delete UI using backend-owned batch-delete URL and destructive action metadata.

## Smallest Remaining Frontend Work

1. Add browser smoke tests against a live backend.
2. Consume true composite/opaque record identity resolution if the backend adds non-single-key records.
3. Extend translation and per-action help coverage only through backend metadata when Django/model defaults are not enough.

Do not add model-specific maps while waiting for those backend metadata
features. Keep generic navigation, backend-driven relation option loading, and
single-record delete as the fallback behavior.

## AIDA Lessons To Keep

`../aida26b-ARI` is a useful small-admin reference:

- table-first layout;
- modal add/edit;
- FK selects;
- URL-state grids;
- simple migration discipline.

Do not copy AIDA's model-specific endpoints or frontend table definitions.
Retrobolt gets table/resource truth from backend resource metadata at runtime.

## Done Criteria

The DB Admin frontend is done when:

- `npm run validate` passes;
- a smoke test logs in and opens the DB Admin shell;
- it can create, update, delete, and batch-delete representative `school` rows;
- it can create a `user` row without exposing password hashes;
- it can load relation options for at least one FK and one many-to-many field;
- it can apply at least one generic visual column filter using backend operator metadata;
- it does not contain compile-time resource lists, field labels, enum values,
  relation maps, or model-specific CRUD URLs.

