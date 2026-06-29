import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
const DEFAULT_PAGE_OBJECT_CONTRACT_PATH = "../backend/docs/generated/e2e_page_object_selector_contract/e2e_page_object_selector_contract_manifest.json";

export const REQUIRED_DATABASE_ADMIN_TEST_IDS = Object.freeze([
  "rb-login-page",
  "rb-login-form",
  "rb-login-username",
  "rb-login-password",
  "rb-login-submit",
  "rb-app-shell",
  "rb-sidebar",
  "rb-main",
  "rb-toast-region",
  "rb-workflow-nav",
  "rb-resource-nav",
  "rb-resource-filter",
  "rb-refresh-resources",
  "rb-sign-out",
  "rb-resource-page",
  "rb-resource-create",
  "rb-resource-batch-delete",
  "rb-resource-refresh",
  "rb-resource-quick-search",
  "rb-resource-page-size",
]);

export const REQUIRED_FUTURE_STUDENT_EXAM_TEST_IDS = Object.freeze([
  "rb-student-exam-entry-page",
  "rb-student-exam-authorize-form",
  "rb-student-exam-personal-id",
  "rb-student-exam-passkey",
  "rb-student-exam-authorize-submit",
  "rb-student-exam-shell",
  "rb-student-exam-content",
  "rb-student-exam-question-navigation",
  "rb-student-exam-question-prompt",
  "rb-student-exam-answer-area",
  "rb-student-exam-autosave-status",
  "rb-student-exam-submit",
  "rb-student-self-service-support-drawer",
  "rb-student-accessibility-controls",
  "rb-student-download-controls",
  "rb-student-support-controls",
  "rb-student-exam-focus-target",
]);

export const REQUIRED_BUSINESS_WORKFLOW_TEST_IDS = Object.freeze([
  "rb-workflow-setup-workbook-nav",
  "rb-setup-workbook-page",
  "rb-setup-workbook-template",
  "rb-setup-workbook-file",
  "rb-setup-workbook-dry-run",
  "rb-setup-workbook-preview",
  "rb-setup-workbook-audit-stage",
  "rb-setup-workbook-runtime-commit",
  "rb-setup-workbook-reason",
  "rb-setup-workbook-manifest",
  "rb-setup-workbook-dry-run-result",
  "rb-setup-workbook-commit-plan",
  "rb-setup-workbook-audit-stage-result",
  "rb-setup-workbook-runtime-commit-result",
  "rb-workflow-matrix-editor-nav",
  "rb-matrix-editor-page",
  "rb-matrix-domain-select",
  "rb-matrix-load-universe",
  "rb-matrix-validate",
  "rb-matrix-preview",
  "rb-matrix-apply",
  "rb-workflow-audit-nav",
  "rb-audit-page",
  "rb-workflow-manual-scoring-nav",
  "rb-manual-scoring-page",
  "rb-manual-scoring-reload",
  "rb-manual-scoring-state-filter",
  "rb-manual-scoring-queue",
  "rb-manual-scoring-form",
  "rb-manual-scoring-submit",
  "rb-manual-scoring-text-annotation-editor",
  "rb-manual-scoring-release-correction",
]);

export function pageObjectSelectorContractPath() {
  return resolve(process.env.RETROBOLT_PAGE_OBJECT_SELECTOR_CONTRACT_PATH || DEFAULT_PAGE_OBJECT_CONTRACT_PATH);
}

export function loadPageObjectSelectorContract(path = pageObjectSelectorContractPath()) {
  if (!existsSync(path)) {
    throw new Error(
      `Backend page-object selector contract not found at ${path}. ` +
      "Set RETROBOLT_PAGE_OBJECT_SELECTOR_CONTRACT_PATH to backend/docs/generated/e2e_page_object_selector_contract/e2e_page_object_selector_contract_manifest.json.",
    );
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function flattenIds(value) {
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (entry && typeof entry === "object") return flattenIds(entry);
    return [];
  });
}

function assertIncludesEvery(label, actual, expected) {
  const actualSet = new Set(actual || []);
  for (const key of expected) {
    assert.ok(actualSet.has(key), `${label} should include ${key}`);
  }
}

export function assertPageObjectSelectorContract(contract) {
  assert.equal(contract?.status, "student_exam_selector_contract_personal_id_plus_optional_passkey_ready");
  assert.equal(contract?.policy?.backend_docs_are_ssot, true);
  assert.equal(contract?.policy?.db_admin_is_base_layer, true);
  assert.equal(contract?.policy?.business_workflows_extend_db_admin_base, true);
  assert.equal(contract?.policy?.selectors_are_stable_handles_only, true);
  assert.equal(contract?.policy?.selectors_must_not_encode_business_policy, true);
  assert.equal(contract?.policy?.frontend_must_not_invent_business_policy, true);
  assert.equal(contract?.policy?.production_data_allowed, false);
  assert.equal(contract?.policy?.student_support_self_service_required, true);
  assert.equal(contract?.policy?.student_support_surface, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);

  assertIncludesEvery("DB Admin base test IDs", Object.values(contract?.db_admin_base_test_ids || {}), REQUIRED_DATABASE_ADMIN_TEST_IDS);
  assertIncludesEvery("business workflow test IDs", flattenIds(contract?.business_workflow_test_ids), REQUIRED_BUSINESS_WORKFLOW_TEST_IDS);

  const layerKeys = new Set((contract?.page_object_layers || []).map((entry) => entry?.key));
  assert.ok(layerKeys.has("db_admin_base"), "DB Admin base page-object layer should exist");
  assert.ok(layerKeys.has("business_workflow_overlays"), "business workflow overlay layer should exist");

  const studentExamIds = new Set(Object.values(contract?.future_external_frontend_test_ids?.student_exam?.required_when_package_exists || {}));
  for (const testId of REQUIRED_FUTURE_STUDENT_EXAM_TEST_IDS) {
    assert.ok(studentExamIds.has(testId), `student exam selector contract should include ${testId}`);
  }
}

export function assertLoadedPageObjectSelectorContract(path = pageObjectSelectorContractPath()) {
  const contract = loadPageObjectSelectorContract(path);
  assertPageObjectSelectorContract(contract);
  return contract;
}

