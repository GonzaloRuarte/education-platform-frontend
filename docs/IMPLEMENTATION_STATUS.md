# Implementation Status

Date: 2026-06-04

Scope: zero-dependency, runtime-discovered DB Admin frontend for the cleaned Retrobolt backend.

The active completion sequence lives in
[`DB_ADMIN_COMPLETION_PLAN.md`](DB_ADMIN_COMPLETION_PLAN.md).

## Done

- Built a new frontend from zero instead of modifying the old frontend.
- Removed all old route/module assumptions from the new app.
- Uses no compile-time resource/table/model list.
- Uses no compile-time field labels, localized labels/messages, field types, enum options, relation labels, or model-specific forms.
- Authenticates through `POST /api/token/`.
- Refreshes access tokens through `POST /api/token/refresh/`.
- Requires the backend-provided `access_db_admin` capability before exposing the admin shell.
- Discovers DB Admin resources through `GET /api/resources/?surface=db_admin`.
- Fetches each selected resource schema through `GET /api/resources/{resource_key}/?surface=db_admin`.
- Lists records through `GET /api/resources/{resource_key}/records/?surface=db_admin`.
- Uses backend-declared page size, visible list fields, primary key fields, searchability, sortability, and relation metadata.
- Sends quick search using the backend grid `filters` JSON convention.
- Provides a generic visual column filter builder using backend-declared filterable fields, `list_query_contract.filters.operators`, and operator `value_control` metadata; URL-tampered unsupported filters/sorts are dropped after schema load. The paired backend now uses a typed compiler for grid filters, direct query-param filters, and dependent relation-option filters in the DB Admin/resource regression subset.
- Sends sorting using the backend grid `sort` JSON convention.
- Renders generic create/edit/detail forms from backend field metadata, including safe `ui.section`, `ui.priority`, `ui.width`, `ui.placeholder`, validation hints, and `i18n` presentation/label hints.
- Supports generic field types currently published by the backend schema: string, text, rich text, integer, decimal, boolean, date, datetime, email, enum, foreign key, many-to-many, and JSON.
- Loads enum options from backend static option metadata.
- Loads relation options through `GET /api/resources/{resource_key}/options/{field_key}/?surface=db_admin`.
- Renders generic relation typeahead search when the backend relation schema declares `option_control: "typeahead"`.
- Orders form selectors by backend-declared relation priority when present.
- Cascades dependent FK/M2M selectors using backend-declared `relation.dependencies` and the generic grid `filters` query parameter; the paired backend now compiles FK equality with exact relation semantics for the reviewed DB Admin paths.
- Displays relation labels in lists when relation option lookup succeeds; otherwise falls back to raw IDs.
- Supports single-record create, update, and delete.
- Supports generic batch delete through backend-owned `resource_urls.batch_delete`, backend-issued opaque `__identity` values, and destructive action metadata.
- Uses backend-owned `resource_urls` for selected-schema/list/create/batch-delete/options and backend-owned `__resource_urls` for detail/update/delete; the frontend does not invent primary-key record routes or collection routes after discovery.
- Consumes backend-owned `model_ssot_contract` metadata to show that ordinary CRUD is generated from Django models/migrations and does not require model-specific frontend/backend CRUD code.
- Consumes backend-owned `record_payload_contract` metadata to keep the generic UI aligned with flat records, ID-only relation values, and related-list-only reverse navigation.
- Consumes backend-owned `validation_contract` metadata plus per-field validation hints for generic HTML validation attributes, visible validation guidance, pre-submit summaries, and JSON checks.
- Consumes backend-owned `authorization_contract` and `authorization_matrix` metadata for read-only operator visibility into DB Admin gates, roles, columns, row scope, and DB-role/RLS mirroring status.
- Consumes backend-owned `error_logging_contract` metadata to display sanitized-error/request-id/audit coverage without frontend policy guesses.
- Consumes backend-owned `ux_ui_contract` metadata to display the generic shell UX protocol without frontend resource/model assumptions.
- Consumes backend-owned `migration_safety_contract` metadata to display migration/query safety and DB-role/RLS mirroring status without frontend policy guesses.
- Uses backend-owned per-record `__label`/`display_label_field` metadata for generic record-facing labels.
- Resolves backend-owned `i18n` metadata generically for resource names/descriptions/help text, field labels/help text, placeholders/sections, related-list labels, and destructive action labels/messages; no resource-specific translation map is compiled.
- Renders backend-owned resource `description` and `admin_help_text` metadata on generic resource pages.
- Provides an English/Spanish language selector for backend-provided labels/messages.
- Provides a light/dark theme selector persisted locally; theme is generic shell state and the supported modes are published by backend `ux_ui_contract`.
- Avoids rendering unsafe HTML from `rich_text`; values are displayed as text.
- Includes a validation script that fails if legacy endpoint/capability fragments are accidentally compiled back into the new app.
- Provides a static build in `dist/`.
- Displays backend request ids from `request_id` error payloads or `X-Request-ID`
  headers in generic API error messages.
- Renders success/error feedback as lightweight toasts for generic CRUD and loading failures.
- Static validation passes for typecheck, build, and static dist checks.

## Not done

- No product/business dashboard yet. This is only the DB Admin generic CRUD shell.
- No explicit workflow frontend for appointments, resolutions, reports, evaluation authoring, imports, password recovery, or scoped business dashboards.
- No export/import UI. Generic CRUD should not guess file workflow semantics.
- No optimistic updates/offline behavior. DB Admin CRUD should stay online and authoritative.
- No generated OpenAPI client. This is intentional for the first pass: the generic resource schema is the runtime source of truth.
- No full browser-driven CRUD test yet; the committed Docker smoke is HTTP-level and covers the frontend shell plus authenticated backend discovery/schema/list.
- Docker compose validation cannot be proven inside environments without Docker and the required `RETROBOLT_ADMIN_USERNAME` / `RETROBOLT_ADMIN_PASSWORD` credentials. Run `npm run test:docker-smoke` in a Docker-enabled environment before release.
- The paired backend DB Admin target is still not fully complete only because Docker/browser smoke is not proven. The reviewed FK filter, report-scope, required-field metadata, dependency reproducibility, permission/setup, and resource surface-policy gaps were addressed, and the paired backend suite is green locally. The frontend can be static-contract green while the product target remains partial until smoke is run.
- DB-role/RLS mirroring is adopted by backend metadata for PostgreSQL; frontend displays that status, treats institutions as valid direct tenants, and treats Organization as optional multi-institution tenancy only when exposed by backend SSOT. Backend/API/DB enforcement remains authoritative.

## Doubts / backend metadata needed before polishing

These are not frontend-hardcoding problems. They are cases where the frontend should stay generic and the backend should publish more metadata if the UX must improve.

1. Navigation order and grouping
   - Current frontend alphabetizes resources.
   - Better backend metadata: `navigation.group`, `navigation.order`, `navigation.hidden`, optional icon/token.

2. Large relation selectors
   - Backend relation option endpoints are searchable and paginated, and the frontend uses backend-declared page-size and `option_control` metadata.
   - Implemented for current protocol: relation schemas can opt into a generic typeahead search box that reloads options through the same backend endpoint.

3. Dependent relation selectors
   - Implemented for the current backend protocol: the schema declares `relation.dependencies` with `source_field`, `target_field`, and `operator`; the frontend sends those constraints through the generic grid `filters` parameter.
   - Remaining backend metadata need: add dependency declarations for any future parent/child selector pairs that need cascading behavior.

4. Composite primary keys / composite foreign keys
   - Complete for the current generic protocol: backend record responses include opaque `__identity` values and canonical `__resource_urls`; batch delete uses `identities`.
   - The frontend no longer builds record action URLs from primary-key fields and therefore does not need to know composite-key encodings.

5. Field layout and priority
   - Implemented for current backend protocol: the frontend consumes `ui.priority`, `ui.section`, `ui.width`, and `ui.placeholder` generically.
   - Remaining backend metadata need: optional `ui.description` or richer layout tokens only if future forms need them.

6. Record display labels
   - Implemented for the current backend protocol: schemas publish `display_label_field`, record responses publish `__label`, and the frontend uses those values for generic record-facing labels.
   - Remaining backend need: richer display templates only if future resources need labels that cannot come from one safe public field.

7. Risk/destructive operations
   - Generic delete and batch delete consume backend destructive-action metadata.
   - Remaining backend metadata need: stronger per-resource confirmation text only if specific models need more than the current generic confirmation message.

8. Validation hints
   - Complete for current protocol: backend validation is authoritative; schemas publish `validation_contract` plus required/nullability/max-length/min/max/step/pattern/format/choice hints; the frontend consumes them for HTML validation attributes, visible guidance, pre-submit summaries, and JSON checks.
   - Remaining future work should be treated as UX polish only if backend metadata adds new validation rules, not as a validation-contract gap.

9. Write-only fields
   - The generic form supports write-only fields, skipping unchanged empty write-only values on edit.
   - For better UX, backend metadata could provide `write_only_behavior` such as `set_only`, `rotate_secret`, or `optional_on_update`.

10. Resource descriptions/help and translations
    - Complete for current protocol: current frontend shows backend-owned labels, localized label/message metadata, keys, resource descriptions/admin help text, field help text, and action messages.
    - Remaining future backend metadata need: richer per-action help text only if future actions require it beyond current resource/field/action metadata.

13. Theme and responsive shell
    - Complete for current protocol: the backend publishes `ux_ui_contract` with supported light/dark theme modes and English/Spanish locales; the frontend provides a persisted generic theme selector and responsive layout without model-specific assumptions.

12. Model/migration SSOT contract
    - Implemented for current backend protocol: schemas publish `model_ssot_contract`, and the frontend displays that ordinary CRUD is Django-model/migration driven and forbids model-specific CRUD routes/endpoints/serializers.

11. Error toasts / request ids / audit contract
    - Complete for current protocol: API errors append backend request ids when the error payload or response header provides one; generic success/error feedback uses lightweight toasts; schemas publish `error_logging_contract` metadata for sanitized errors, durable audit coverage, and request correlation.

## Decision

This frontend should replace, not modify, the old admin/dashboard frontend for DB Admin CRUD.

The old frontend can remain a product-workflow reference only. It should not be merged into this admin shell because it contains stale endpoint, capability, and model assumptions.

## Deployment note

The static frontend works same-origin without CORS changes. If it is served from a different origin than the backend, the backend deployment must explicitly allow that origin and JWT authorization headers. This is deployment configuration, not a reason to add frontend compatibility code.



## DB Admin testing contract

Partially complete for the paired package reviewed on 2026-06-04. The frontend consumes backend `testing_contract` metadata, `npm run test:frontend-contracts` checks the runtime-admin contract, and `npm run validate` covers typecheck/build/dist. `npm test` passed in the review environment, and the paired backend suite is green locally. The authenticated Docker smoke remains the only product-target release gate because it requires Docker plus `RETROBOLT_ADMIN_USERNAME` and `RETROBOLT_ADMIN_PASSWORD`.
