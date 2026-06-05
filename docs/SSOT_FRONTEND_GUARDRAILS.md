# Frontend SSOT Guardrails

## Mandatory rules

- The frontend must not compile a list of DB tables, models, resources, or
  fields.
- The frontend must not define ordinary CRUD schemas.
- The frontend must not duplicate backend resource labels, localized field
  labels, localized option labels, required flags, nullability, enum values,
  relation option sources, list visibility, filterability, searchability,
  sortability, PII flags, validation metadata, or CRUD URLs.
- The frontend must not request or display backend-only contract prose just to
  mirror documentation. Public schema payload should contain runtime metadata the
  frontend actually uses.
- The frontend must not call legacy explicit endpoints for ordinary admin CRUD.
- The frontend must not keep compatibility wrappers for removed backend
  endpoints.
- The frontend must not introduce role/capability names. It must not receive,
  store, check, display, or branch on capability strings from login/session
  payloads. Surface/action access is enforced by backend endpoint responses and
  backend-provided boolean action metadata.
- The frontend must not infer hidden fields, relation scopes, or database table
  names. If the backend does not expose a field or option, the frontend must not
  reconstruct it.
- Missing UX metadata should be recorded as a backend metadata need, not solved
  by model-specific frontend maps.

## Allowed frontend ownership

The frontend may own:

- static layout shell;
- authentication token storage;
- generic table mechanics;
- generic form rendering mechanics;
- localized chrome text for frontend-owned UI;
- deduplicated localized wording for generic validation hints;
- collapsible resource groups and independent menu/main scrolling;
- loading, error, empty, modal/dialog, toast, and responsive behavior;
- local page/search/sort/filter UI state;
- visual density, light/dark theme, and language preference.

## Backend-owned truth

The backend owns:

- resources available to this user and surface;
- field definitions and public field aliases;
- resource/field/action/option labels and localized labels for backend-owned
  data;
- relation options and scopes;
- enum/static options;
- row scope;
- capability enforcement and the mapping from internal capabilities to public action booleans;
- validation enforcement and machine-readable validation metadata;
- write policies;
- PII/visibility;
- CRUD action effects;
- pagination/filter/sort semantics.

## Deletion rule

If a frontend file starts reintroducing model-specific ordinary CRUD
assumptions, delete it or move the needed information into backend metadata. Do
not preserve it as a compatibility layer.

## Testing gate

Frontend static coverage is green for the reviewed package through `npm test`.
Whole-product release completion still requires authenticated Docker/browser
smoke with Docker plus `RETROBOLT_ADMIN_USERNAME` and
`RETROBOLT_ADMIN_PASSWORD`.
