# Backend Metadata Requests

The current backend contract is enough for a minimal DB Admin CRUD frontend.
The following additions would make the admin safer and more usable without violating SSOT.

Implementation sequencing lives in
[`DB_ADMIN_COMPLETION_PLAN.md`](DB_ADMIN_COMPLETION_PLAN.md) and
`../meta-backend/docs/DB_ADMIN_MINIMAL_COMPLETION_PLAN.md`.

## High priority

1. Opaque record identity — complete

```json
{
  "record_identity": {
    "kind": "opaque",
    "metadata_field": "__identity",
    "transport": "backend_signed_urlsafe_token",
    "record_urls": "required"
  },
  "record_payload_contract": {
    "batch_delete_shape": {"identities": "backend_issued___identity_array"}
  }
}
```

Status: backend schemas publish opaque identity metadata, record responses publish backend-issued `__identity` plus `__resource_urls.detail/update/delete`, batch delete accepts `identities`, and the frontend consumes only those backend-owned values/URLs for record actions. No generic primary-key or collection-route URL fallback remains after runtime discovery.

2. Relation option typeahead metadata — complete for current protocol

The backend now supports searchable/paginated relation options:

```text
GET /api/resources/{resource_key}/options/{field_key}/?surface=db_admin&search=abc&page=1&page_size=25
```

Status: relation schemas can now publish `option_control: "typeahead"`, and the frontend renders a generic search box that reloads relation options through the same backend option endpoint. Remaining need: add that metadata to future relation fields that need typeahead UX.

3. Additional dependent selector coverage

The backend now defines the dependent selector protocol with `relation.dependencies`:

```json
{
  "relation": {
    "depends_on": ["school"],
    "dependencies": [
      {"source_field": "school", "target_field": "school", "operator": "equals"}
    ]
  }
}
```

The frontend sends those constraints through the generic grid `filters` query parameter. Remaining need: add these declarations to any future relation fields that require cascading option scopes.

## Medium priority

4. Filter operator and value-control metadata — complete for current paired backend gap

The backend includes `list_query_contract.filters.operators` with stable
operator keys, localized labels, compatible admin field types, value kind
(`single`, `multiple`, or `none`), and `value_control` hints. The frontend uses
that metadata plus field option/relation metadata to render generic text,
number, date/datetime, boolean, enum, relation, and multiple-value filter
controls without compiling model-specific filter rules. The paired backend now
uses typed filter compilation for list filters, direct query-param filters, and
dependent FK/relation option filters in the reviewed DB Admin/resource subset.

5. Admin navigation metadata — complete for current shell

```json
{
  "navigation": {
    "group": "Identity",
    "order": 20,
    "hidden": false
  }
}
```

Status: backend schemas expose navigation group/order metadata and the frontend consumes it for sidebar grouping/sorting. Remaining need: richer permission/admin grouping only if future resources need it.

6. Field presentation hints — complete for current shell

```json
{
  "ui": {
    "section": "Identity",
    "priority": 10,
    "width": "half",
    "placeholder": "example@example.com"
  }
}
```

Status: backend schemas publish safe field `ui` metadata and the frontend consumes `section`, `priority`, `width`, and `placeholder` generically. Remaining need: optional `ui.description` or richer layout tokens only if future forms need them.

7. Validation hints — complete for current paired backend gap

Examples: `max_length`, `min`, `max`, `pattern`, `step`.

Status: backend exposes `validation_contract` plus required/nullability/max-length/min/max/step/pattern/format/choice hints where inferable from Django fields/validators, and the frontend maps them to HTML attributes, visible guidance, pre-submit summaries, and JSON checks. Backend validation remains authoritative. The paired backend keeps global required inference default-aware and marks the `School.district` admin exception explicitly in model-owned field metadata.

8. Destructive action metadata — complete for current protocol

```json
{
  "actions": {
    "delete": {
      "destructive": true,
      "confirmation_text": "DELETE"
    }
  }
}
```

Status: backend exposes delete and batch-delete metadata, including localized label/message metadata; frontend consumes both. Future resources that need stronger confirmation text must add backend-owned metadata rather than frontend-specific rules.

## Low priority

9. Backend-owned localized labels/messages — complete for current protocol

Status: backend schemas publish `i18n` metadata for resource labels, field labels/help/UI text, related-list labels, and destructive action labels/messages; frontend resolves them generically through the language selector. Remaining need: complete translation coverage for resources whose Django/model defaults are not enough.

10. Resource descriptions and help text — complete for current shell

Status: backend schemas now expose resource-level `description` and `admin_help_text`, including localized `i18n.description` and `i18n.admin_help_text`; the frontend renders them generically in resource pages. Remaining need: richer per-action help only if future actions require it.

11. Record display label — complete for current shell

Status: backend schemas publish `display_label_field`, record responses publish `__label`, and the frontend consumes those values for generic record-facing labels. Remaining need: optional display templates only if future resources need labels that cannot come from one safe public field.

12. User/session bootstrap endpoint

The token response currently carries enough user/capability data after login. A read-only `/api/session/` endpoint could let static frontend tabs revalidate without relying only on stored token payload.

## Deployment/configuration note

If the admin frontend is served from a different origin than the API, backend deployment must allow the admin origin and `Authorization` header through CORS. The preferred production setup is still same-origin or reverse-proxy routing so runtime config can keep `apiBaseUrl` blank. If origins differ, `apiBaseUrl` is deployment-owned config, not a login-screen user choice.

## Error correlation

Implemented: frontend displays backend `request_id` / `X-Request-ID` values in generic API errors. Remaining polish should stay generic and backend-owned where metadata is needed.

11. Migration/query safety contract — partially complete for paired package

Status: backend schemas publish `migration_safety_contract`, including Django-migration ownership, structured ORM filter/query safety, permission manifest review discipline, and generated PostgreSQL role/RLS status, direct institution tenancy, and optional Organization/multi-institution tenancy when exposed by backend SSOT. The frontend displays that metadata generically and displays backend-published PostgreSQL role/RLS policy metadata without compiling resource-specific SQL policy assumptions. The paired backend now closes the reviewed typed-filter compiler gap for FK/dependent relation filters, centralizes the resource surface/action policy, and has a green backend suite locally; whole-product completion remains gated by Docker/browser smoke.
12. Model/migration SSOT contract — complete for current protocol

Status: backend schemas publish `model_ssot_contract`, including Django model/migration ownership, inferred serializer ownership, ResourceMeta exposure, and the prohibition on model-specific CRUD serializers/endpoints/frontend routes. The frontend displays this generically and does not compile resource-specific model assumptions.



## Error/logging contract

Status: backend schemas publish `error_logging_contract` for sanitized user errors, request-id correlation, durable audit event coverage, secret redaction policy, and toast feedback. The frontend consumes this generically and does not hardcode audit policies or resource-specific messages.

## UX/UI contract

Status: complete for the current DB Admin shell. Backend schemas publish `ux_ui_contract` for runtime navigation, modal CRUD, URL-backed list state, backend-driven field/relation/destructive controls, light/dark theme modes, English/Spanish locale support, responsive layout, and toast feedback. The frontend consumes that contract generically and provides a persisted light/dark theme selector without compiling resource-specific UX rules.


## Authorization matrix metadata

Status: backend schemas publish `authorization_contract` and per-resource `authorization_matrix` metadata. The frontend displays it read-only so operators can see the current app-owned DB Admin authorization scope and generated PostgreSQL role/RLS mirroring status without hardcoding capabilities beyond the shell entry gate.

Status: backend declares PostgreSQL DB-role/RLS mirroring as adopted for the current model set. The frontend displays backend-published policy metadata without compiling resource-specific SQL policy logic.


## DB Admin testing contract

Partially complete for the paired package reviewed on 2026-06-04. The frontend consumes backend `testing_contract` metadata, `npm run test:frontend-contracts` checks the runtime-admin contract, and `npm run validate` covers typecheck/build/dist. `npm test` passed in the review environment, and the paired backend suite is green locally. The authenticated Docker smoke remains the only product-target release gate because it requires Docker plus `RETROBOLT_ADMIN_USERNAME` and `RETROBOLT_ADMIN_PASSWORD`.
