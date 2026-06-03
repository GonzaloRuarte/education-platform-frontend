# Backend Metadata Requests

The current backend contract is enough for a minimal DB Admin CRUD frontend.
The following additions would make the admin safer and more usable without violating SSOT.

Implementation sequencing lives in
[`DB_ADMIN_COMPLETION_PLAN.md`](DB_ADMIN_COMPLETION_PLAN.md) and
`../meta-backend/docs/DB_ADMIN_MINIMAL_COMPLETION_PLAN.md`.

## High priority

1. Opaque record identity — partially complete

```json
{
  "record_identity": {
    "kind": "opaque_pk",
    "field": "id"
  }
}
```

or include per-record URLs:

```json
{
  "id": 1,
  "__resource_urls": {
    "detail": "/api/resources/example/records/1/?surface=db_admin"
  }
}
```

Status: backend schemas now publish `resource_urls` for collection actions, record responses publish `__resource_urls.detail/update/delete`, and the frontend consumes those URLs before falling back to generic single-key routes. Remaining need: true composite/opaque identity resolution if non-single-key resources are exposed.

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

4. Filter operator and value-control metadata — complete

The backend now includes `list_query_contract.filters.operators` with stable
operator keys, localized labels, compatible admin field types, value kind
(`single`, `multiple`, or `none`), and `value_control` hints. The frontend uses
that metadata plus field option/relation metadata to render generic text,
number, date/datetime, boolean, enum, relation, and multiple-value filter
controls without compiling model-specific filter rules.

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

7. Validation hints — partially complete

Examples: `max_length`, `min`, `max`, `pattern`, `step`.

Status: backend exposes required/nullability/max-length/min/max/pattern-style hints where inferable, and the frontend maps them to HTML validation attributes. Remaining need: broader validator coverage and polished inline validation UX.

8. Destructive action metadata — mostly complete

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

Status: backend exposes delete and batch-delete metadata, including localized label/message metadata; frontend consumes both. Remaining need: stronger confirmation text only for future resources that need more than the generic defaults.

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

If the admin frontend is served from a different origin than the API, backend deployment must allow the admin origin and `Authorization` header through CORS. The preferred production setup is still same-origin or reverse-proxy routing so the frontend can keep `apiBaseUrl` blank.

## Error correlation

Implemented: frontend displays backend `request_id` / `X-Request-ID` values in generic API errors. Remaining polish should stay generic and backend-owned where metadata is needed.

11. Migration/query safety contract — complete for current protocol

Status: backend schemas publish `migration_safety_contract`, including Django-migration ownership, structured ORM filter/query safety, permission manifest review discipline, and explicit `not_adopted` DB-role/RLS status. The frontend displays that metadata generically and does not compile permission or SQL policy assumptions.

