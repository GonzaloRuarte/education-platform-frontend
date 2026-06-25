import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
const FRONTEND_ROOT = new URL("..", import.meta.url).pathname;
const DEFAULT_BACKEND_SSOT_CONTRACT_PATH = "../backend/docs/generated/frontend_backend_ssot_compliance/frontend_backend_ssot_compliance_manifest.json";

function backendSsotContractPath() {
  return resolve(process.env.RETROBOLT_FRONTEND_BACKEND_SSOT_CONTRACT_PATH || DEFAULT_BACKEND_SSOT_CONTRACT_PATH);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readFilesRecursively(root, extensions) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return readFilesRecursively(path, extensions);
    if (entry.isFile() && extensions.some((extension) => path.endsWith(extension))) {
      return [readFileSync(path, "utf8")];
    }
    return [];
  });
}

function readProductionSource() {
  return [
    ...readFilesRecursively(join(FRONTEND_ROOT, "src"), [".ts"]),
    ...readFilesRecursively(join(FRONTEND_ROOT, "public"), [".js", ".html", ".css"]),
  ].join("\n");
}

function readScriptSource() {
  return readFilesRecursively(join(FRONTEND_ROOT, "scripts"), [".mjs"]).join("\n");
}

const contractPath = backendSsotContractPath();
assert.ok(
  existsSync(contractPath),
  `Backend SSOT compliance contract missing at ${contractPath}. Set RETROBOLT_FRONTEND_BACKEND_SSOT_CONTRACT_PATH to backend/docs/generated/frontend_backend_ssot_compliance/frontend_backend_ssot_compliance_manifest.json.`,
);
const contract = readJson(contractPath);

assert.equal(contract.status, "v165_student_exam_surface_frontend_compliance");
assert.equal(contract.policy?.backend_docs_are_ssot, true, "backend docs should be frontend SSOT");
assert.equal(contract.policy?.frontend_repo_may_not_override_backend_contracts, true);
assert.equal(contract.policy?.frontend_business_logic_allowed, false);
assert.equal(contract.policy?.frontend_local_policy_hiding_allowed, false);
assert.equal(contract.policy?.production_data_allowed_in_static_or_smoke_fixtures, false);
assert.equal(contract.policy?.second_exam_support_pin_required, false);
assert.equal(contract.policy?.student_support_controls, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);

for (const relPath of contract.required_frontend_files ?? []) {
  assert.ok(existsSync(join(FRONTEND_ROOT, relPath)), `frontend file named by backend SSOT is missing: ${relPath}`);
}

const packageJson = readJson(join(FRONTEND_ROOT, "package.json"));
for (const scriptName of contract.required_frontend_package_scripts ?? []) {
  assert.ok(packageJson.scripts?.[scriptName], `package.json script missing: ${scriptName}`);
}
assert.match(packageJson.scripts["test:frontend-contracts"], /test:backend-ssot-compliance/);
assert.match(packageJson.scripts["test:frontend-contracts"], /test:e2e-contract/);
assert.match(packageJson.scripts["test:frontend-contracts"], /test:page-object-contract/);
assert.match(packageJson.scripts["test:frontend-contracts"], /test:e2e-payload-contract/);
assert.ok(packageJson.scripts["test:e2e:browser"], "package.json should expose the provisioned browser E2E command");
for (const removedScript of contract.forbidden_frontend_script_fragments?.filter((fragment) => fragment.startsWith("test:e2e:")) ?? []) {
  assert.ok(!packageJson.scripts[removedScript], `package.json must not expose removed browser E2E alias: ${removedScript}`);
}

const productionSource = readProductionSource();
const scriptSource = readScriptSource();
const allSource = `${productionSource}\n${scriptSource}`;

for (const fragment of contract.required_frontend_source_fragments ?? []) {
  assert.ok(productionSource.includes(fragment), `frontend production source should include backend-driven fragment: ${fragment}`);
}
for (const fragment of contract.required_frontend_script_fragments ?? []) {
  assert.ok(scriptSource.includes(fragment), `frontend scripts should include backend-contract fragment: ${fragment}`);
}
for (const fragment of contract.forbidden_frontend_production_fragments ?? []) {
  assert.ok(!productionSource.includes(fragment), `frontend production code must not reintroduce backend-forbidden fragment: ${fragment}`);
}
for (const fragment of contract.forbidden_frontend_script_fragments ?? []) {
  assert.ok(!scriptSource.includes(fragment), `frontend scripts must not reintroduce removed browser alias fragment: ${fragment}`);
}

assert.ok(allSource.includes("frontend_backend_ssot_compliance_manifest.json"));
assert.ok(allSource.includes("frontend-browser-smoke-contract.mjs"));
assert.ok(allSource.includes("e2e_browser_runtime_plan_manifest.json"));
assert.ok(allSource.includes("e2e_page_object_selector_contract_manifest.json"));
assert.ok(allSource.includes("page-object-contract.mjs"));
assert.ok(allSource.includes("e2e_seeded_payload_contract_manifest.json"));
assert.ok(allSource.includes("e2e-payload-contract.mjs"));
assert.ok(allSource.includes("RETROBOLT_RUN_BROWSER_E2E"));
assert.ok(allSource.includes(STUDENT_SELF_SERVICE_SUPPORT_DRAWER));

console.log("Backend-doc SSOT compliance contract tests passed.");
