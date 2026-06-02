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
- quick search, sorting, pagination, and generic error display.

## Smallest Remaining Frontend Work

1. Add browser smoke tests against a live backend.
2. Add batch delete UI once backend/frontend smoke tests are stable.
3. Consume backend `record_identity` or per-record URLs when added.
4. Consume searchable/paginated relation options when added.
5. Consume relation dependency query metadata when added.
6. Consume backend navigation group/order metadata when added.
7. Consume validation hints and destructive-action metadata when added.

Do not add model-specific maps while waiting for those backend metadata
features. Keep alphabetic navigation, full relation option loading, and
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
- it can create, update, and delete a representative `school` row;
- it can create a `user` row without exposing password hashes;
- it can load relation options for at least one FK and one many-to-many field;
- it does not contain compile-time resource lists, field labels, enum values,
  relation maps, or model-specific CRUD URLs.

