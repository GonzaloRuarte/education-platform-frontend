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

contains("frontend app", app, "type TestingContract");
contains("frontend app", app, "testing_contract?: TestingContract");
contains("frontend app", app, "testingContractLabel(schema.testing_contract)");
contains("frontend app", app, "testingContractNotice(schema.testing_contract)");
contains("frontend app", app, "schema.resource_urls?.[key]");
contains("frontend app", app, 'requireResourceUrl(schema, "batch_delete")');
contains("frontend app", app, "__identity");
contains("frontend app", app, "authorization_contract");
contains("frontend app", app, "ux_ui_contract");
contains("frontend app", app, "migration_safety_contract");
contains("frontend app", app, "list_query_contract");
contains("frontend app", app, "sanitizeFilterModel(schema, parseFilterModel");
contains("frontend app", app, "sanitizeSortState(schema, parseSortState");
contains("frontend app", app, "relation?.option_control");
contains("frontend app", app, "relation?.dependencies");
contains("frontend app", app, "destructive_actions");
contains("frontend app", app, "STORAGE_LOCALE");
contains("frontend app", app, "STORAGE_THEME");
contains("frontend app", app, "RESOURCE_HASH_PREFIX");

assert.ok(!app.includes("/api/resources/${schema.key}/records/${"), "frontend must not build record action URLs from primary keys");
assert.ok(!app.includes("primary_key_fields[0]"), "frontend must not depend on a single primary key fallback");
assert.ok(/data-theme/.test(css), "styles should include theme selectors");
assert.ok(/@media \(max-width:/.test(css), "styles should include responsive rules");
assert.ok(html.includes('id="app"'), "public shell should include the runtime app root");

console.log("DB Admin frontend contract tests passed.");
