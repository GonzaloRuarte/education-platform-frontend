# DB Admin Completion Plan


## 2026-06-04 Functionality Iteration Status

The paired backend now closes the reviewed DB Admin functionality gaps for typed
FK/dependent relation filters, explicit `School.district` required metadata,
normalized report/readiness school queries, DB Admin/resource regression tests,
and dependency reproducibility for the local venv. The whole DB Admin target is
still not complete only because authenticated Docker/browser smoke is not proven;
the paired backend suite is now green locally.


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
- generic list/create/detail/edit/delete through backend-owned opaque record URLs;
- enum options from backend metadata;
- relation options through the backend options endpoint;
- backend-declared relation `option_control` metadata for generic typeahead selectors;
- quick search, generic visual column filters with backend-declared value controls, sorting, pagination, and generic error display;
- URL-backed selected-resource/list state for filters, sorting, page, and page size;
- backend-declared related-list row actions that open child resources with generic grid filters;
- backend-declared relation priority/dependency metadata for cascading selectors;
- backend-owned field presentation hints for generic form sections, priority, width, and placeholders;
- backend-owned `i18n` labels/messages/descriptions/help text resolved generically by an English/Spanish selector;
- backend-owned resource collection URLs and per-record opaque detail/update/delete URLs, with no frontend primary-key or collection-route fallback;
- backend-owned model/migration SSOT contract metadata;
- backend-owned record payload contract metadata for flat ID-based record shapes;
- backend-owned validation contract metadata and per-field validation hints for generic form guidance and pre-submit checks;
- backend-owned migration/query safety contract metadata;
- backend-owned error/logging contract metadata plus toast feedback for generic success/errors;
- backend-owned UX/UI contract metadata plus a generic light/dark theme selector;
- generic batch-delete UI using backend-owned batch-delete URL, opaque record identities, and destructive action metadata.

## Smallest Remaining Frontend Work

Model/migration SSOT is complete for the current generic shell: the frontend consumes backend `model_ssot_contract` metadata and still has no compile-time resource/table/model list.

2026-06-04 review status: `npm test` passes for this frontend package. Docker smoke and full product completion remain gated by a Docker-enabled environment, DB Admin credentials, and the paired backend target becoming green.

1. Run and keep authenticated Docker smoke green in release environments.
2. Add browser-driven CRUD smoke coverage against a live backend.
3. Extend per-action help coverage only through backend metadata when future actions need more than current resource/field/action metadata.

Do not add model-specific maps while waiting for backend metadata. Keep generic navigation, backend-driven relation option loading, and backend-owned record URLs as the only record-action path.

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

The DB Admin frontend is not fully release-done yet. It is done when:

- `npm run validate` passes;
- a smoke test logs in and opens the DB Admin shell;
- it can create, update, delete, and batch-delete representative `school` rows;
- it can create a `user` row without exposing password hashes;
- it can load relation options for at least one FK and one many-to-many field;
- it can apply at least one generic visual column filter using backend operator metadata;
- it does not contain compile-time resource lists, field labels, enum values,
  relation maps, or model-specific CRUD URLs.



## Authorization metadata update

The frontend now consumes backend `authorization_contract` and `authorization_matrix` metadata read-only, including the backend-published PostgreSQL DB-role/RLS mirroring status, including direct institution tenancy and optional Organization/multi-institution tenancy when the backend SSOT exposes that model.


## DB Admin testing contract

Partially complete for the paired package reviewed on 2026-06-04. The frontend consumes backend `testing_contract` metadata, `npm run test:frontend-contracts` checks the runtime-admin contract, and `npm run validate` covers typecheck/build/dist. The authenticated Docker smoke command exists but must be run with Docker plus `RETROBOLT_ADMIN_USERNAME` and `RETROBOLT_ADMIN_PASSWORD`. The whole DB Admin target remains incomplete until the paired backend target and tests are also green.
