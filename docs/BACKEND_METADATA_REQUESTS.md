# Backend Metadata Requests

The current backend contract is enough for the runtime DB Admin CRUD frontend.
The frontend consumes only metadata it actually renders or uses for requests;
backend-only SSOT, authorization, migration, logging, and testing contract prose
belongs in backend docs, permission manifests, and database-policy exports, not
in every resource schema payload.

## Current frontend-used schema payload

The DB Admin frontend currently uses these schema areas:

- resource labels, plural labels, descriptions, admin help text, and their
  localized `i18n` values;
- complete field labels through `field.i18n.label.en` and
  `field.i18n.label.es` for every visible field in every discovered resource;
- field type/control metadata, required/nullability flags, read-only/write-only
  flags, list visibility, PII flags, safe UI hints, and public validation hints;
- static option values and localized option labels when rendered;
- relation dependency, priority, page-size, and `option_control` metadata plus
  the generic relation options endpoint;
- backend-owned resource URLs, per-record `__resource_urls`, opaque
  `__identity`, record `__label`, `display_label_field`, and related-list row
  actions;
- navigation group/order metadata for the collapsible left menu;
- destructive-action labels/messages/confirmation metadata;
- `list_query_contract` operator metadata for generic filters.

Removed from the public generic CRUD schema because the frontend does not use it at runtime:
`model_ssot_contract`, `record_payload_contract`, `validation_contract`,
`authorization_contract`, `authorization_matrix`, `migration_safety_contract`,
`error_logging_contract`, `ux_ui_contract`, `testing_contract`, per-resource
`capabilities`, `business_actions`, `visible_capability`, and `default_sort`.
Instead, the backend publishes only frontend-used action booleans for the current
resource/surface. Structured role/matrix editing is not added to resource schemas;
it stays behind `/api/matrix-editor/**` so the backend remains the SSOT for the
editable universe, column-grant universe, row-scope types, preview, validation,
and audit-first apply.

## Completed metadata items

1. **Opaque record identity — complete.** Record actions use backend-issued
   `__identity` and backend-owned URLs. The frontend does not construct primary
   key URLs.

2. **Relation option typeahead — complete for current protocol.** Relation
   fields can publish `option_control: "typeahead"`; the frontend reloads options
   through the generic options endpoint with search/page/page-size parameters.

3. **Dependent selector coverage — complete for declared dependencies.** The
   frontend reads `relation.dependencies` and sends the declared constraints
   through the generic grid `filters` query parameter.

4. **Filter operator/value-control metadata — complete for current protocol.**
   The frontend builds generic visual filters from `list_query_contract` plus
   field option/relation metadata.

5. **Navigation metadata — complete for current shell.** The frontend groups and
   orders resources from backend `navigation` metadata. Resource groups in the
   left menu are collapsible and the collapse state is persisted locally.

6. **Field presentation hints — complete for current shell.** The frontend uses
   backend `ui.section`, `ui.priority`, `ui.width`, and `ui.placeholder`
   generically.

7. **Validation hints — complete for current shell.** The backend exposes
   machine-readable field validation hints only. The frontend renders localized
   English/Spanish guidance from its own chrome dictionary, deduplicates repeated
   hints, and treats frontend validation as advisory. Backend validation remains
   authoritative.

8. **Destructive action metadata — complete for current protocol.** Delete and
   batch-delete UI use backend destructive-action metadata and localized labels
   or messages when provided.

9. **Localized labels/messages — mechanically complete.** Every public field in
   every discovered resource must expose `i18n.label.en` and `i18n.label.es`;
   backend tests enforce this. Some wording may still deserve product-copy
   review, because fallback translations are intentionally generic.

10. **Resource descriptions/help text — complete for current shell.** The
    frontend renders backend resource descriptions and admin help text
    generically.

11. **Record display label — complete for current shell.** The backend publishes
    `display_label_field`; record responses publish `__label`; the frontend uses
    them for generic record-facing labels.

## Remaining metadata requests

- Add richer backend-owned copy only where product owners want better labels,
  descriptions, help text, destructive-action wording, or option wording than
  the generic fallback translations.
- Add new backend metadata only when the frontend truly needs it at runtime. Do
  not re-add backend-only contract blocks to the API payload for documentation
  display alone.
- Run authenticated Docker/browser smoke in a Docker-enabled environment with
  `RETROBOLT_ADMIN_USERNAME` and `RETROBOLT_ADMIN_PASSWORD` before release.

## Deployment/configuration note

If the admin frontend is served from a different origin than the API, backend
deployment must allow the admin origin and `Authorization` header through CORS.
The preferred production setup is same-origin or reverse-proxy routing so runtime
config can keep `apiBaseUrl` blank. Deployment config must not become a
user-facing login field.

## Capability-name privacy

Complete. The frontend must not receive or store the current user's capability
list from login. It must not render backend internal capability names such as
field `visible_capability`. The backend should keep capability strings in
server-side manifests/docs and translate them to public endpoint results and
resource `actions` booleans for the generic UI.
