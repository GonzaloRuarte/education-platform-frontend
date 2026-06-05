import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const app = readFileSync(join(root, "src/app.ts"), "utf8");
const html = readFileSync(join(root, "public/index.html"), "utf8");
const css = readFileSync(join(root, "public/styles.css"), "utf8");

function contains(label, haystack, needle) {
  assert.ok(haystack.includes(needle), `${label} should include ${needle}`);
}

function notContains(label, haystack, needle) {
  assert.ok(!haystack.includes(needle), `${label} should not include ${needle}`);
}

contains("frontend app", app, "__identity");
contains("frontend app", app, "key: String(resource.alias || \"\")");
contains("frontend app", app, "encodeURIComponent(schema.key)");
contains("frontend app", app, "recordDetailPath(schema, identity)");
contains("frontend app", app, "sanitizeFilterModel(schema, parseFilterModel");
contains("frontend app", app, "sanitizeSortState(schema, parseSortState");
contains("frontend app", app, "relation?.option_control");
contains("frontend app", app, "relation?.dependencies");
contains("frontend app", app, "destructive_actions");
contains("frontend app", app, "canResourceAction(schema");
contains("frontend app", app, "STORAGE_LOCALE");
contains("frontend app", app, "STORAGE_THEME");
contains("frontend app", app, "STORAGE_COLLAPSED_RESOURCE_GROUPS");
contains("frontend app", app, "toggleResourceGroup(group)");
contains("frontend app", app, "formatText(\"min_chars\"");
contains("frontend app", app, "new Set<string>()");
contains("frontend styles", css, ".resource-group__toggle");
contains("frontend styles", css, ".main { min-width: 0; height: 100vh; overflow: auto;");
contains("frontend styles", css, ".sidebar { background: var(--sidebar-bg, #101828); color: white; padding: 20px 16px; display: flex; flex-direction: column; gap: 16px; height: 100vh;");

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
notContains("frontend app", app, "field.validation?.messages");
notContains("frontend app", app, "schema.resource_urls");
notContains("frontend app", app, "requireResourceUrl");
notContains("frontend app", app, "__resource_urls");
notContains("frontend app", app, "__label");
notContains("frontend app", app, "display_label_field");
notContains("frontend app", app, "list_query_contract");
notContains("frontend app", app, "primary_key_fields");

assert.ok(app.includes("/api/resources/${encodeURIComponent(schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}"), "frontend should build generic record URLs from resource alias and backend identity");
assert.ok(!app.includes("/api/resources/${schema.key}/records/${"), "frontend must encode public aliases and identities");
assert.ok(!app.includes("primary_key_fields[0]"), "frontend must not depend on a single primary key fallback");
assert.ok(/data-theme/.test(css), "styles should include theme selectors");
assert.ok(/@media \(max-width:/.test(css), "styles should include responsive rules");
assert.ok(html.includes('id="app"'), "public shell should include the runtime app root");

console.log("DB Admin frontend contract tests passed.");
