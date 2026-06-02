# Backend Metadata Requests

The current backend contract is enough for a minimal DB Admin CRUD frontend.
The following additions would make the admin safer and more usable without violating SSOT.

Implementation sequencing lives in
[`DB_ADMIN_COMPLETION_PLAN.md`](DB_ADMIN_COMPLETION_PLAN.md) and
`../meta-backend/docs/DB_ADMIN_MINIMAL_COMPLETION_PLAN.md`.

## High priority

1. Opaque record identity

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

Reason: the schema already publishes `primary_key_fields`, but detail/update/delete URLs accept one `record_pk`. If composite keys or non-trivial identifiers appear, the frontend needs an opaque identity rather than guessing.

2. Paginated/searchable relation options

```text
GET /api/resources/{resource_key}/options/{field_key}/?surface=db_admin&search=abc&page=1&page_size=25
```

Reason: a generic admin cannot know which related tables are small enough for full select boxes.

3. Dependent selector protocol

If a field declares `depends_on`, the backend should define how dependency values are sent:

```json
{
  "relation": {
    "depends_on": ["school"],
    "dependency_query_params": { "school": "school_id" }
  }
}
```

Reason: the current frontend can detect dependency metadata but cannot safely invent request parameters.

## Medium priority

4. Admin navigation metadata

```json
{
  "navigation": {
    "group": "Identity",
    "order": 20,
    "hidden": false
  }
}
```

Reason: alphabetic fallback is generic but not ideal.

5. Field presentation hints

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

Reason: forms can remain generic while still being usable.

6. Validation hints

Examples: `max_length`, `min`, `max`, `pattern`, `step`.

Reason: backend validation remains authoritative, but frontend can prevent obvious mistakes.

7. Destructive action metadata

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

Reason: generic delete should know when stronger confirmation is warranted.

## Low priority

8. Resource descriptions and help text

Examples: `description`, `admin_help_text`, per-action help.

9. Record display label

Examples: `display_field`, `display_template`, or response-level `__label`.

10. User/session bootstrap endpoint

The token response currently carries enough user/capability data after login. A read-only `/api/session/` endpoint could let static frontend tabs revalidate without relying only on stored token payload.

## Deployment/configuration note

If the admin frontend is served from a different origin than the API, backend deployment must allow the admin origin and `Authorization` header through CORS. The preferred production setup is still same-origin or reverse-proxy routing so the frontend can keep `apiBaseUrl` blank.
