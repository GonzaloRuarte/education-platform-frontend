import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const app = readFileSync(join(root, "src/app.ts"), "utf8");
const html = readFileSync(join(root, "public/index.html"), "utf8");
const css = readFileSync(join(root, "public/styles.css"), "utf8");

const smoke = readFileSync(join(root, "scripts/docker-smoke.mjs"), "utf8");

function contains(label, haystack, needle) {
  assert.ok(haystack.includes(needle), `${label} should include ${needle}`);
}

function notContains(label, haystack, needle) {
  assert.ok(!haystack.includes(needle), `${label} should not include ${needle}`);
}

contains("frontend app", app, "__identity");
contains("frontend app", app, "key: String(resource.alias || \"\")");
contains("frontend app", app, "key: String(field.alias || \"\")");
contains("frontend app", app, "encodeURIComponent(schema.key)");
contains("frontend app", app, "recordDetailPath(schema, identity)");
contains("frontend app", app, "sanitizeFilterModel(schema, parseFilterModel");
contains("frontend app", app, "sanitizeSortState(schema, parseSortState");
contains("frontend app", app, "relation?.option_control");
contains("frontend app", app, "relation?.dependencies");
contains("frontend app", app, "params.q = search.trim()");
contains("frontend app", app, "destructive_actions");
contains("frontend app", app, "target_resource_alias");
contains("frontend app", app, "canResourceAction(schema");
contains("frontend app", app, "SETUP_WORKBOOK_HASH");
contains("frontend app", app, "/api/setup-workbook/dry-run/");
contains("frontend app", app, "/api/setup-workbook/commit-plan/");
contains("frontend app", app, "state.setupWorkbook.omittedRows");
contains("frontend app", app, "state.setupWorkbook.confirmedWarningCodes");
contains("frontend app", app, "state.setupWorkbook.cellCorrections");
contains("frontend app", app, "appendSetupWorkbookCellCorrections(formData)");
contains("frontend app", app, "corrected_values");
contains("frontend app", app, "MATRIX_EDITOR_HASH");
contains("frontend app", app, "/api/matrix-editor/universe/");
contains("frontend app", app, "/api/matrix-editor/validate/");
contains("frontend app", app, "/api/matrix-editor/preview/");
contains("frontend app", app, "/api/matrix-editor/apply/");
contains("frontend app", app, "state.matrixEditor.resourceProposals");
contains("frontend app", app, "state.matrixEditor.rowScopeValues");
contains("frontend app", app, "state.matrixEditor.columnGrantSelections");
contains("frontend app", app, "column_grant_universe");
contains("frontend app", app, "column_grants");
contains("frontend app", app, "matrixEditorColumnGrantPayload()");
contains("frontend app", app, "state.matrixEditor.confirmDangerous");
contains("frontend app", app, "matrixEditorPayload()");
contains("frontend app", app, "AUDIT_VIEW_HASH");
contains("frontend app", app, "RESOURCE_EXPOSURE_HASH");
contains("frontend app", app, "/api/db-admin-resource-exposure/manifest/");
contains("frontend app", app, "state.resourceExposure.manifest");
contains("frontend app", app, "renderResourceExposurePage()");
contains("frontend app", app, "resource_exposure_platform_only");
contains("frontend app", app, "/api/db-admin-audit/${state.auditView.kind}/");
contains("frontend app", app, "auditViewListPath()");
contains("frontend app", app, "auditViewDetailPath(id)");
contains("frontend app", app, "state.auditView.kind");
contains("frontend app", app, "audit_redacted_notice");
contains("frontend app", app, "hasJsonRequestBody(init.body)");
contains("frontend app", app, "STORAGE_LOCALE");
contains("frontend app", app, "STORAGE_THEME");
contains("frontend app", app, "STORAGE_COLLAPSED_RESOURCE_GROUPS");
contains("frontend app", app, "toggleResourceGroup(group)");
contains("frontend app", app, "formatText(\"min_chars\"");
contains("frontend app", app, "new Set<string>()");
contains("frontend styles", css, ".resource-group__toggle");
contains("frontend styles", css, ".setup-workbook__issue");
contains("frontend styles", css, ".setup-workbook__cell-input--changed");
contains("frontend styles", css, ".matrix-editor .card h3");
contains("frontend styles", css, ".audit-view .card h3");
contains("frontend styles", css, ".audit-view__detail .cell-json");
contains("frontend styles", css, ".resource-exposure .records-table td");
contains("frontend styles", css, ".summary-grid");
contains("frontend styles", css, ".main { min-width: 0; height: 100vh; overflow: auto;");
contains("frontend styles", css, ".sidebar { background: var(--sidebar-bg, #101828); color: white; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; height: 100vh;");

contains("docker smoke", smoke, "REQUIRED_GENERIC_DB_ADMIN_SMOKE_COVERAGE");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_SETUP_CHAIN_ALIASES");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_WRITABLE_RESOURCE_ALIAS");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_CREATE_PAYLOAD");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_UPDATE_PAYLOAD");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_FILTERS_JSON");
contains("docker smoke", smoke, "resourceDetailUrl(schema.key");
contains("docker smoke", smoke, "resourceOptionsUrl(schema.key");
contains("docker smoke", smoke, `method: "POST"`);
contains("docker smoke", smoke, `method: "PATCH"`);
contains("docker smoke", smoke, `method: "DELETE"`);
contains("docker smoke", smoke, "identities: [batchOne.__identity, batchTwo.__identity]");
contains("docker smoke", smoke, `page_size: "1"`);
contains("docker smoke", smoke, "sort: JSON.stringify");
contains("docker smoke", smoke, "filters: JSON.stringify(filters)");
contains("docker smoke", smoke, "setupChainAliases()");
contains("docker smoke", smoke, "Temporary admin cleanup remains owned by the caller/test fixture");

notContains("frontend app", app, "type TestingContract");
notContains("frontend app", app, "testing_contract?:");
notContains("frontend app", app, "authorization_contract?:");
notContains("frontend app", app, "ux_ui_contract?:");
notContains("frontend app", app, "migration_safety_contract?:");
notContains("frontend app", app, "model_ssot_contract?:");
notContains("frontend app", app, "record_payload_contract?:");
notContains("frontend app", app, "validation_contract?:");
notContains("frontend app", app, "schema.capabilities");
notContains("frontend app", app, "visible_capability");
notContains("frontend app", app, "access_db_admin");
notContains("frontend app", app, "capabilities:");
notContains("frontend app", app, "capabilities.includes");
notContains("frontend app", app, "schema.business_actions");
notContains("frontend app", app, "author_raw_sql_or_predicates");
notContains("frontend app", app, "disable_audit");
notContains("frontend app", app, "grant_platform_domain");
notContains("frontend app", app, "AuditEvent.objects");
notContains("frontend app", app, "DbAdminMutationBatch.objects");
notContains("frontend app", app, "field.validation?.messages");
notContains("frontend app", app, "schema.resource_urls");
notContains("frontend app", app, "requireResourceUrl");
notContains("frontend app", app, "__resource_urls");
notContains("frontend app", app, "__label");
notContains("frontend app", app, "display_label_field");
notContains("frontend app", app, "list_query_contract");
notContains("frontend app", app, "target_resource_key");
notContains("frontend app", app, "primary_key_fields");
notContains("frontend app", app, "params.search");
notContains("frontend app", app, "search: search.trim()");

assert.ok(app.includes("/api/resources/${encodeURIComponent(schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}"), "frontend should build generic record URLs from resource alias and backend identity");
assert.ok(!app.includes("/api/resources/${schema.key}/records/${"), "frontend must encode public aliases and identities");
assert.ok(!app.includes("primary_key_fields[0]"), "frontend must not depend on a single primary key fallback");
assert.ok(/data-theme/.test(css), "styles should include theme selectors");
assert.ok(/@media \(max-width:/.test(css), "styles should include responsive rules");
assert.ok(html.includes('id="app"'), "public shell should include the runtime app root");

console.log("DB Admin frontend contract tests passed.");
