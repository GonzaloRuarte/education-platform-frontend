# Implementation Status

Date: 2026-06-02

Scope: zero-dependency, runtime-discovered DB Admin frontend for the cleaned Retrobolt backend.

The active completion sequence lives in
[`DB_ADMIN_COMPLETION_PLAN.md`](DB_ADMIN_COMPLETION_PLAN.md).

## Done

- Built a new frontend from zero instead of modifying the old frontend.
- Removed all old route/module assumptions from the new app.
- Uses no compile-time resource/table/model list.
- Uses no compile-time field labels, field types, enum options, relation labels, or model-specific forms.
- Authenticates through `POST /api/token/`.
- Refreshes access tokens through `POST /api/token/refresh/`.
- Requires the backend-provided `access_db_admin` capability before exposing the admin shell.
- Discovers DB Admin resources through `GET /api/resources/?surface=db_admin`.
- Fetches each selected resource schema through `GET /api/resources/{resource_key}/?surface=db_admin`.
- Lists records through `GET /api/resources/{resource_key}/records/?surface=db_admin`.
- Uses backend-declared page size, visible list fields, primary key fields, searchability, sortability, and relation metadata.
- Sends quick search using the backend grid `filters` JSON convention.
- Sends sorting using the backend grid `sort` JSON convention.
- Renders generic create/edit/detail forms from backend field metadata.
- Supports generic field types currently published by the backend schema: string, text, rich text, integer, decimal, boolean, date, datetime, email, enum, foreign key, many-to-many, and JSON.
- Loads enum options from backend static option metadata.
- Loads relation options through `GET /api/resources/{resource_key}/options/{field_key}/?surface=db_admin`.
- Displays relation labels in lists when relation option lookup succeeds; otherwise falls back to raw IDs.
- Supports single-record create, update, and delete.
- Avoids rendering unsafe HTML from `rich_text`; values are displayed as text.
- Includes a validation script that fails if legacy endpoint/capability fragments are accidentally compiled back into the new app.
- Provides a static build in `dist/`.

## Not done

- No product/business dashboard yet. This is only the DB Admin generic CRUD shell.
- No explicit workflow frontend for appointments, resolutions, reports, evaluation authoring, imports, password recovery, or scoped business dashboards.
- No batch delete UI yet, even though the backend supports batch delete. Single-record delete is implemented first to keep the initial admin minimal and safer.
- No advanced filter builder UI yet. Quick search and column sort are implemented; a generic filter-builder can be added after confirming the backend wants to expose presentation-friendly operator labels.
- No export/import UI. Generic CRUD should not guess file workflow semantics.
- No optimistic updates/offline behavior. DB Admin CRUD should stay online and authoritative.
- No generated OpenAPI client. This is intentional for the first pass: the generic resource schema is the runtime source of truth.
- No automated browser smoke test against a live backend yet. TypeScript/build/static validation pass locally.

## Doubts / backend metadata needed before polishing

These are not frontend-hardcoding problems. They are cases where the frontend should stay generic and the backend should publish more metadata if the UX must improve.

1. Navigation order and grouping
   - Current frontend alphabetizes resources.
   - Better backend metadata: `navigation.group`, `navigation.order`, `navigation.hidden`, optional icon/token.

2. Large relation selectors
   - Current backend relation options endpoint returns all scoped options.
   - For large tables, the backend should publish searchable/paginated option endpoints or option query parameters.

3. Dependent relation selectors
   - Backend schema can declare `depends_on`, but the current relation options endpoint does not define how the frontend should send dependency values.
   - Needed backend metadata/protocol: dependency parameter names and whether selector values should reset/cascade.

4. Composite primary keys / composite foreign keys
   - Backend schema publishes `primary_key_fields`, but record detail/update/delete URLs currently accept one `record_pk` path segment.
   - The frontend disables detail/edit/delete when a resource declares more than one primary key field because it cannot safely invent a URL encoding.
   - Needed backend contract: opaque row id, canonical `record_url`, or explicit composite key encoding.

5. Field layout and priority
   - Current frontend lays out forms generically.
   - Better backend metadata: `ui.priority`, `ui.section`, `ui.width`, `ui.placeholder`, and `ui.description` when needed.

6. Record display labels
   - Relation options provide labels for selectors, but ordinary records do not publish a canonical display label.
   - Helpful backend metadata: resource-level `display_field` or per-record `__label` if records should appear in generic references elsewhere.

7. Risk/destructive operations
   - Generic delete exists, but some models may have important consequences.
   - Better backend metadata: `actions.delete.confirmation_label`, `destructive`, or `requires_confirmation_text`.

8. Validation hints
   - Backend validation is authoritative, but the UI could improve if the schema published min/max/regex/max_length for fields.

9. Write-only fields
   - The generic form supports write-only fields, skipping unchanged empty write-only values on edit.
   - For better UX, backend metadata could provide `write_only_behavior` such as `set_only`, `rotate_secret`, or `optional_on_update`.

10. Resource descriptions/help
    - Current frontend can show labels and keys only.
    - Helpful backend metadata: `description`, `admin_help_text`, and maybe per-action help text.

## Decision

This frontend should replace, not modify, the old admin/dashboard frontend for DB Admin CRUD.

The old frontend can remain a product-workflow reference only. It should not be merged into this admin shell because it contains stale endpoint, capability, and model assumptions.

## Deployment note

The static frontend works same-origin without CORS changes. If it is served from a different origin than the backend, the backend deployment must explicitly allow that origin and JWT authorization headers. This is deployment configuration, not a reason to add frontend compatibility code.
