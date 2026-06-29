import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const source = readFileSync(join(ROOT, "src/resources/setupWorkbookView.ts"), "utf8");
const statusPath = join(ROOT, "docs/generated/setup_workbook_single_institution_wizard/setup_workbook_single_institution_wizard_status.json");
assert.ok(existsSync(statusPath), "single-institution wizard status artifact should exist");
const status = JSON.parse(readFileSync(statusPath, "utf8"));

assert.equal(status.status, "completed_pending_runtime_validation");
assert.equal(status.runtime_checks_pending, true);
assert.equal(status.production_data_allowed, false);
assert.deepEqual(status.missing_static_blockers, []);

assert.match(source, /renderSetupWorkbookSingleInstitutionWizard/, "guided wizard should be rendered by the setup workbook view");
assert.match(source, /setupWorkbookEndpointForStage\("organization", "manifest\/"\)/, "wizard should load the Organization stage manifest through the existing setup-workbook stage surface");
assert.match(source, /setupWorkbookEndpointForStage\("institution", "manifest\/"\)/, "wizard should load the Institution stage manifest through the existing setup-workbook stage surface");
assert.match(source, /fetchSetupWorkbookContextOptions\(organizationManifest\)/, "wizard should derive Organization options through the shared context-option helper");
assert.match(source, /fetchSetupWorkbookContextOptions\(institutionManifest\)/, "wizard should derive Institution options through the shared context-option helper");
assert.match(source, /resourceSchemaPath\(selector\.resource_alias\)/, "context option loading should use backend-owned resource aliases");
assert.match(source, /params\.filters = JSON\.stringify\(selector\.filters\)/, "context option loading should pass backend-owned selector filters");
assert.match(source, /renderSetupWorkbookWizardStep\(\s*"organization"/, "wizard should open Organization Setup without creating a merged backend endpoint");
assert.match(source, /renderSetupWorkbookWizardStep\(\s*"institution"/, "wizard should open Institution Setup without creating a merged backend endpoint");
assert.match(source, /recordSetupWorkbookRuntimeCommitResult/, "wizard should persist partial stage completion from runtime commit results");
assert.match(source, /organizationCommittedAt/, "wizard should display/persist Stage A partial completion");
assert.match(source, /institutionCommittedAt/, "wizard should display/persist Stage B completion");

assert.doesNotMatch(source, /\/api\/setup-workbook\/(?:merged|single|wizard)[^"'`]*/, "wizard must not add a merged/specialized setup-workbook API path");
assert.doesNotMatch(source, /subscription_status\s*[=:]/, "wizard must not hardcode Organization subscription filters");
assert.doesNotMatch(source, /lifecycle_status\s*[=:]/, "wizard must not hardcode Institution lifecycle filters");
assert.doesNotMatch(source, /role_key\s*[=:]/, "wizard must not hardcode role keys");

console.log("Setup workbook single-institution wizard contract passed.");
