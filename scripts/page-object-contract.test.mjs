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
const FRONTEND_ROOT = new URL("..", import.meta.url).pathname;

const validContract = {
  status: "v165_student_exam_selector_contract_personal_id_only_ready",
  policy: {
    backend_docs_are_ssot: true,
    db_admin_is_base_layer: true,
    business_workflows_extend_db_admin_base: true,
    selectors_are_stable_handles_only: true,
    selectors_must_not_encode_business_policy: true,
    frontend_must_not_invent_business_policy: true,
    production_data_allowed: false,
    second_exam_support_pin_required: false,
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
  forbidden_selector_patterns: ["support_pin", "accessibility_pin", "student_pin", "teacher_support_unlock", "second_exam_support_pin", "ReporteAurora", "ReporteSlideContent", "reportes-aurora", "rb-setup-workbook-organization-select", "/api/setup-workbook/commit-organizations/"],
};

assertPageObjectSelectorContract(validContract);
assertLoadedPageObjectSelectorContract();

const testIdSource = readFileSync(join(FRONTEND_ROOT, "src", "testIds.ts"), "utf8");
for (const testId of [...REQUIRED_DB_ADMIN_TEST_IDS, ...REQUIRED_BUSINESS_WORKFLOW_TEST_IDS, ...REQUIRED_FUTURE_STUDENT_EXAM_TEST_IDS]) {
  assert.ok(testIdSource.includes(testId), `src/testIds.ts should export ${testId}`);
}

const productionSource = [
  readFileSync(join(FRONTEND_ROOT, "src", "app.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "setupWorkbookView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "matrixEditorView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "auditView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "resourceExposureView.ts"), "utf8"),
  readFileSync(join(FRONTEND_ROOT, "src", "manualScoringView.ts"), "utf8"),
].join("\n");
for (const testId of [...REQUIRED_DB_ADMIN_TEST_IDS, ...REQUIRED_BUSINESS_WORKFLOW_TEST_IDS]) {
  assert.ok(productionSource.includes(testId) || productionSource.includes("DB_ADMIN_TEST_IDS") || productionSource.includes("BUSINESS_WORKFLOW_TEST_IDS"), `production source should wire selector ${testId}`);
}
for (const bad of ["support_pin", "accessibility_pin", "student_pin", "teacher_support_unlock", "second_exam_support_pin", "reportes-aurora", "rb-setup-workbook-organization-select", "/api/setup-workbook/commit-organizations/"]) {
  assert.ok(!productionSource.includes(bad), `production source must not contain ${bad}`);
}

for (const bad of [
  { label: "second PIN", patch: { policy: { ...validContract.policy, second_exam_support_pin_required: true } } },
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
