# Frontend SSOT Guardrails

## Mandatory rules

- The frontend must not compile a list of DB tables, models, resources, or fields.
- The frontend must not define ordinary CRUD schemas.
- The frontend must not duplicate backend labels, localized labels/messages, required flags, nullability, enum values, relation option sources, list visibility, filterability, searchability, sortability, or PII flags.
- The frontend must not call legacy explicit endpoints for ordinary admin CRUD.
- The frontend must not keep compatibility wrappers for removed backend endpoints.
- The frontend must not introduce role/capability names except shell-level guards that are truly frontend-shell specific. This app compiles only `access_db_admin` because it is the entry gate for the DB Admin surface.
- The frontend must not infer hidden fields or relation scopes. If the backend does not expose a field or option, the frontend must not reconstruct it.
- Missing UX metadata should be recorded as a backend metadata need, not solved by model-specific frontend maps.

## Allowed frontend ownership

The frontend may own:

- static layout shell;
- authentication token storage;
- generic table mechanics;
- generic form rendering mechanics;
- loading, error, and empty states;
- modal/dialog behavior;
- local page/search/sort UI state;
- visual density and responsive behavior.

## Backend-owned truth

The backend owns:

- resources available to this user and surface;
- field definitions;
- labels and localized labels/messages;
- relation options and scopes;
- enum options;
- row scope;
- capability enforcement;
- validation;
- write policies;
- PII/visibility;
- CRUD action effects;
- pagination/filter/sort semantics.

## Deletion rule

If a frontend file starts reintroducing model-specific ordinary CRUD assumptions, delete it or move the needed information into backend metadata. Do not preserve it as a compatibility layer.


## DB Admin testing contract

Frontend static coverage is complete for the paired package reviewed on 2026-06-04: `npm run validate` and `npm run test:frontend-contracts` are covered by `npm test`. The paired backend target and tests are green locally. The authenticated Docker smoke is still a release gate that requires Docker plus `RETROBOLT_ADMIN_USERNAME` and `RETROBOLT_ADMIN_PASSWORD`, so the whole DB Admin target must not be marked complete until that smoke passes.
