import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
import {
  REQUIRED_BUSINESS_WORKFLOW_TEST_IDS,
  REQUIRED_DB_ADMIN_TEST_IDS,
  REQUIRED_FUTURE_STUDENT_EXAM_TEST_IDS,
  assertLoadedPageObjectSelectorContract,
  assertPageObjectSelectorContract,
} from "./page-object-contract.mjs";
const FRONTEND_ROOT = new URL("../..", import.meta.url).pathname;

const validContract = {
  status: "student_exam_selector_contract_personal_id_only_ready",
  policy: {
    backend_docs_are_ssot: true,
    db_admin_is_base_layer: true,
    business_workflows_extend_db_admin_base: true,
    selectors_are_stable_handles_only: true,
    selectors_must_not_encode_business_policy: true,
    frontend_must_not_invent_business_policy: true,
    production_data_allowed: false,
    student_support_self_service_required: true,
    student_support_surface: STUDENT_SELF_SERVICE_SUPPORT_DRAWER,
  },
  page_object_layers: [
    { key: "db_admin_base" },
    { key: "business_workflow_overlays" },
  ],
  db_admin_base_test_ids: Object.fromEntries(REQUIRED_DB_ADMIN_TEST_IDS.map((testId) => [testId, testId])),
  business_workflow_test_ids: {
    available: Object.fromEntries(REQUIRED_BUSINESS_WORKFLOW_TEST_IDS.map((testId) => [testId, testId])),
  },
  future_external_frontend_test_ids: {
    student_exam: {
      required_when_package_exists: Object.fromEntries(REQUIRED_FUTURE_STUDENT_EXAM_TEST_IDS.map((testId) => [testId, testId])),
    },
  },
};

assertPageObjectSelectorContract(validContract);
assertLoadedPageObjectSelectorContract();

const testIdSource = readFileSync(join(FRONTEND_ROOT, "src", "core", "testIds.ts"), "utf8");
for (const testId of [...REQUIRED_DB_ADMIN_TEST_IDS, ...REQUIRED_BUSINESS_WORKFLOW_TEST_IDS, ...REQUIRED_FUTURE_STUDENT_EXAM_TEST_IDS]) {
  assert.ok(testIdSource.includes(testId), `src/core/testIds.ts should export ${testId}`);
}

const productionSource = [
  readFileSync(join(FRONTEND_ROOT, "src", "app.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "resources", "setupWorkbookView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "resources", "matrixEditorView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "reports", "auditView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "reports", "manualScoringView.ts"), "utf8"),
].join("\n");
for (const testId of [...REQUIRED_DB_ADMIN_TEST_IDS, ...REQUIRED_BUSINESS_WORKFLOW_TEST_IDS]) {
  assert.ok(productionSource.includes(testId) || productionSource.includes("DB_ADMIN_TEST_IDS") || productionSource.includes("BUSINESS_WORKFLOW_TEST_IDS"), `production source should wire selector ${testId}`);
}

for (const bad of [
  { label: "student self-service disabled", patch: { policy: { ...validContract.policy, student_support_self_service_required: false } } },
  { label: "frontend policy", patch: { policy: { ...validContract.policy, selectors_must_not_encode_business_policy: false } } },
  { label: "missing base", patch: { page_object_layers: [{ key: "business_workflow_overlays" }] } },
]) {
  assert.throws(
    () => assertPageObjectSelectorContract({ ...validContract, ...bad.patch }),
    undefined,
    `${bad.label} should fail the page-object selector contract`,
  );
}

console.log("E2E page-object selector contract tests passed.");

