import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
const root = new URL("../..", import.meta.url).pathname;
const app = readFileSync(join(root, "src/app.ts"), "utf8");
function readTypeScriptSource(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return readTypeScriptSource(path);
    if (entry.isFile() && entry.name.endsWith(".ts")) return [readFileSync(path, "utf8")];
    return [];
  });
}
const source = readTypeScriptSource(join(root, "src")).join("\n");
const typesSource = readFileSync(join(root, "src/core/types.ts"), "utf8");
const i18nSource = readFileSync(join(root, "src/core/i18n.ts"), "utf8");
const domSource = readFileSync(join(root, "src/core/dom.ts"), "utf8");
const html = readFileSync(join(root, "public/index.html"), "utf8");
const css = readFileSync(join(root, "public/styles.css"), "utf8");

const smoke = readFileSync(join(root, "scripts/runtime/docker-smoke.mjs"), "utf8");
const smokeContract = readFileSync(join(root, "scripts/contracts/frontend-browser-smoke-contract.mjs"), "utf8");

function contains(label, haystack, needle) {
  assert.ok(haystack.includes(needle), `${label} should include ${needle}`);
}

function notContains(label, haystack, needle) {
  assert.ok(!haystack.includes(needle), `${label} should not include ${needle}`);
}


contains("frontend app split", app, 'from "./core/types"');
contains("frontend localization split", source, 'from "./i18n"');
contains("frontend app split", app, 'from "./core/dom"');
contains("frontend types module", typesSource, "export type JsonValue");
contains("frontend i18n module", i18nSource, "export const UI_TEXT");
contains("frontend dom module", domSource, "export function el");
notContains("frontend app split", app, "export type JsonPrimitive");
notContains("frontend app split", app, "const UI_TEXT: Record");
notContains("frontend app split", app, "function el<K extends keyof HTMLElementTagNameMap>");
contains("frontend source", source, "__identity");
contains("frontend source", source, "key: String(resource.alias || \"\")");
contains("frontend source", source, "key: String(field.alias || \"\")");
contains("frontend source", source, "encodeURIComponent(schema.alias || schema.key)");
contains("frontend source", source, "recordDetailPath(schema, identity)");
contains("frontend source", source, "sanitizeFilterModel(schema, parseFilterModel");
contains("frontend source", source, "renderFilterBuilder(view");
contains("frontend source", source, "sanitizeSortState(schema, parseSortState");
contains("frontend source", source, "relation?.option_control");
contains("frontend source", source, "relation?.dependencies");
contains("frontend source", source, "params.q = search.trim()");
contains("frontend source", source, "destructive_actions");
contains("frontend source", source, "target_resource_alias");
contains("frontend source", source, "canResourceAction(schema");
contains("frontend source", source, "SETUP_WORKBOOK_HASH");
contains("frontend source", source, "/api/setup-workbook/dry-run/");
contains("frontend source", source, "/api/setup-workbook/commit-plan/");
contains("frontend source", source, "runtime.setupWorkbook.omittedRows");
contains("frontend source", source, "runtime.setupWorkbook.confirmedWarningCodes");
contains("frontend source", source, "runtime.setupWorkbook.cellCorrections");
contains("frontend source", source, "appendSetupWorkbookCellCorrections(formData)");
contains("frontend source", source, "corrected_values");
contains("frontend source", source, "MATRIX_EDITOR_HASH");
contains("frontend source", source, "/api/matrix-editor/universe/");
contains("frontend source", source, "/api/matrix-editor/validate/");
contains("frontend source", source, "/api/matrix-editor/preview/");
contains("frontend source", source, "/api/matrix-editor/apply/");
contains("frontend source", source, "runtime.matrixEditor.resourceProposals");
contains("frontend source", source, "runtime.matrixEditor.rowScopeValues");
contains("frontend source", source, "runtime.matrixEditor.columnGrantSelections");
contains("frontend source", source, "column_grant_universe");
contains("frontend source", source, "column_grants");
contains("frontend source", source, "matrixEditorColumnGrantPayload()");
contains("frontend source", source, "runtime.matrixEditor.confirmDangerous");
contains("frontend source", source, "matrixEditorPayload()");
contains("frontend source", source, "AUDIT_VIEW_HASH");
contains("frontend source", source, "RESOURCE_EXPOSURE_HASH");
contains("frontend source", source, "/api/db-admin-resource-exposure/manifest/");
contains("frontend source", source, "state.resourceExposure.manifest");
contains("frontend source", source, "renderResourceExposurePage(resourceExposureViewRuntime())");
contains("frontend source", source, "resource_exposure_platform_only");
contains("frontend source", source, "resource_exposure_legend");
contains("frontend source", source, "MANUAL_SCORING_HASH");
contains("frontend source", source, "renderManualScoringPage(manualScoringViewRuntime())");
contains("frontend source", source, "/api/resolutions/manual-scoring-queue/");
contains("frontend source", source, "/api/resolutions/manual-score/");
contains("frontend source", source, "manual_scoring_pending");
contains("frontend source", source, "manual_scoring_subtitle");
contains("frontend source", source, "/api/db-admin-audit/${state.auditView.kind}/");
contains("frontend source", source, "auditViewListPath()");
contains("frontend source", source, "auditViewDetailPath(id)");
contains("frontend source", source, "state.auditView.kind");
contains("frontend source", source, "audit_redacted_notice");
contains("frontend source", source, "hasJsonRequestBody(init.body)");
contains("frontend source", source, "publicErrorMessage(error, t(\"login_failed\"))");
contains("frontend source", source, "publicErrorMessage(error, t(\"load_resources_failed\"))");
contains("frontend source", source, "Request ID: ${requestId}");
contains("frontend source", source, "STORAGE_LOCALE");
contains("frontend source", source, "STORAGE_THEME");
contains("frontend source", source, "STORAGE_COLLAPSED_RESOURCE_GROUPS");
contains("frontend source", source, "toggleResourceGroup(group)");
contains("frontend source", source, "formatText(\"min_chars\"");
contains("frontend source", source, "new Set<string>()");
contains("frontend styles", css, ".resource-group__toggle");
contains("frontend styles", css, ".setup-workbook__issue");
contains("frontend styles", css, ".setup-workbook__cell-input--changed");
contains("frontend styles", css, ".matrix-editor .card h3");
contains("frontend styles", css, ".audit-view .card h3");
contains("frontend styles", css, ".audit-view__detail .cell-json");
contains("frontend styles", css, ".resource-exposure .records-table td");
contains("frontend styles", css, ".manual-scoring");
contains("frontend styles", css, ".summary-grid");
contains("frontend styles", css, ".main { min-width: 0; height: 100vh; overflow: auto;");
contains("frontend styles", css, ".sidebar { background: var(--sidebar-bg, #101828); color: white; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; height: 100vh;");

contains("docker smoke", smoke, "REQUIRED_GENERIC_DB_ADMIN_SMOKE_COVERAGE");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_SETUP_CHAIN_ALIASES");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_WRITABLE_RESOURCE_ALIAS");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_CREATE_PAYLOAD");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_UPDATE_PAYLOAD");
contains("docker smoke", smoke, "RETROBOLT_SMOKE_FILTERS_JSON");
contains("docker smoke", smoke, "resourceDetailUrl(schema.alias");
contains("docker smoke", smoke, "resourceOptionsUrl(schema.alias");
contains("docker smoke", smoke, `method: "POST"`);
contains("docker smoke", smoke, `method: "PATCH"`);
contains("docker smoke", smoke, `method: "DELETE"`);
contains("docker smoke", smoke, "identities: [batchOne.__identity, batchTwo.__identity]");
contains("docker smoke", smoke, `page_size: "1"`);
contains("docker smoke", smoke, "sort: JSON.stringify");
contains("docker smoke", smoke, "filters: JSON.stringify(filters)");
contains("docker smoke", smoke, "setupChainAliases()");
contains("docker smoke", smoke, "Temporary admin cleanup remains owned by the caller/test fixture");

contains("docker smoke", smoke, "assertLoadedFrontendBrowserSmokeContract");
contains("frontend browser smoke contract", smokeContract, "RETROBOLT_FRONTEND_SMOKE_CONTRACT_PATH");
contains("frontend browser smoke contract", smokeContract, "STUDENT_SELF_SERVICE_SUPPORT_DRAWER");
notContains("frontend browser smoke contract", smokeContract, "support_self_service");
notContains("frontend browser smoke contract", smokeContract, "accessibility_self_service");

notContains("frontend source", source, "type TestingContract");
notContains("frontend source", source, "testing_contract?:");
notContains("frontend source", source, "authorization_contract?:");
notContains("frontend source", source, "ux_ui_contract?:");
notContains("frontend source", source, "migration_safety_contract?:");
notContains("frontend source", source, "model_ssot_contract?:");
notContains("frontend source", source, "record_payload_contract?:");
notContains("frontend source", source, "validation_contract?:");
notContains("frontend source", source, "schema.capabilities");
notContains("frontend source", source, "visible_capability");
notContains("frontend source", source, "access_db_admin");
notContains("frontend source", source, "capabilities:");
notContains("frontend source", source, "capabilities.includes");
notContains("frontend source", source, "schema.business_actions");
notContains("frontend source", source, "author_raw_sql_or_predicates");
notContains("frontend source", source, "disable_audit");
notContains("frontend source", source, "grant_platform_domain");
notContains("frontend source", source, "AuditEvent.objects");
notContains("frontend source", source, "DbAdminMutationBatch.objects");
notContains("frontend source", source, "field.validation?.messages");
notContains("frontend source", source, "schema.resource_urls");
notContains("frontend source", source, "requireResourceUrl");
notContains("frontend source", source, "__resource_urls");
notContains("frontend source", source, "__label");
notContains("frontend source", source, "display_label_field");
notContains("frontend source", source, "list_query_contract");
notContains("frontend source", source, "target_resource_key");
notContains("frontend source", source, "primary_key_fields");
notContains("frontend source", source, "params.search");
notContains("frontend source", source, "search: search.trim()");
notContains("frontend source", source, "error instanceof Error ? error.message : t(");

assert.ok(source.includes("/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}"), "frontend should build generic record URLs from resource alias and backend identity");
assert.ok(!source.includes("/api/resources/${schema.alias}/records/${"), "frontend must encode public aliases and identities");
assert.ok(!source.includes("primary_key_fields[0]"), "frontend must consume declared identity fields");
assert.ok(/data-theme/.test(css), "styles should include theme selectors");
assert.ok(/@media \(max-width:/.test(css), "styles should include responsive rules");
assert.ok(html.includes('id="app"'), "public shell should include the runtime app root");

console.log("DB Admin frontend contract tests passed.");
