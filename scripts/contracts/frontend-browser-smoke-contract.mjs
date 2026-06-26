import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER, STUDENT_SUPPORT_DRAWER_SELF_SERVICE } from "./backend-contract-policy.mjs";
const DEFAULT_BACKEND_CONTRACT_PATH = "../backend/docs/generated/frontend_browser_smoke_runtime_gates/frontend_browser_smoke_runtime_gate_manifest.json";

export const REQUIRED_FRONTEND_BROWSER_SMOKE_JOURNEYS = Object.freeze([
  "authenticated_customer_resource_discovery",
  "generic_crud_list_detail_mutation_and_relation_options",
  "cross_organization_leakage_denials",
  "institution_setup_workbook_commit_chain",
  "matrix_role_grant_preview_apply_and_self_lockout_denial",
  "appointment_participation_absence_offline_scoring_repair",
  "evaluation_authoring_immutability_and_revision_copy",
  "report_snapshot_readiness_and_export_audit",
  STUDENT_SUPPORT_DRAWER_SELF_SERVICE,
]);

export const REQUIRED_FRONTEND_BROWSER_SMOKE_NEGATIVE_PROBES = Object.freeze([
  "alpha_user_cannot_discover_beta_resources_or_rows",
  "workflow_only_targets_are_not_generic_crud_discoverable",
  "viewer_without_export_permission_cannot_download_report",
  "snapshot_readiness_state_controls_current_presentation",
  "student_support_drawer_opens_and_returns_focus",
  "accessibility_controls_open_from_student_exam_surface",
  "download_button_has_deliberate_action_but_self_service",
  "role_editor_rejects_self_lockout_before_apply",
]);

export function backendSmokeContractPath() {
  return resolve(process.env.RETROBOLT_FRONTEND_SMOKE_CONTRACT_PATH || DEFAULT_BACKEND_CONTRACT_PATH);
}

export function loadBackendSmokeContract(path = backendSmokeContractPath()) {
  if (!existsSync(path)) {
    throw new Error(
      `Backend frontend-browser smoke contract not found at ${path}. ` +
      "Set RETROBOLT_FRONTEND_SMOKE_CONTRACT_PATH to docs/generated/frontend_browser_smoke_runtime_gates/frontend_browser_smoke_runtime_gate_manifest.json.",
    );
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function keys(items) {
  return new Set((items || []).map((item) => item?.key).filter(Boolean));
}

function assertIncludesEvery(label, actualKeys, requiredKeys) {
  for (const key of requiredKeys) {
    assert.ok(actualKeys.has(key), `${label} should include ${key}`);
  }
}

export function assertFrontendBrowserSmokeContract(contract) {
  assert.equal(contract?.script_owner, "frontend/scripts/runtime/docker-smoke.mjs", "backend contract should name the frontend smoke script owner");
  assert.equal(contract?.release_gate?.blocking, true, "frontend browser smoke should remain release-blocking");
  assert.equal(contract?.release_gate?.runtime_environment_required, true, "frontend browser smoke requires a provisioned runtime");
  assert.equal(contract?.fixture_policy?.fake_only, true, "frontend smoke should use fake-only fixture data");
  assert.equal(contract?.fixture_policy?.requires_two_organizations, true, "frontend smoke should require two Organizations");
  assert.equal(contract?.fixture_policy?.production_data_allowed, false, "frontend smoke must not allow production data");
  assert.deepEqual(contract?.fixture_policy?.organizations, ["org_alpha", "org_beta"], "frontend smoke should use the canonical two-Organization fixture");

  assert.equal(contract?.student_exam_support_controls?.student_self_service_required, true, "student support drawer exposes self-service controls");
  assert.equal(contract?.student_exam_support_controls?.access_owner, "student", "student support controls are student-owned");
  assert.equal(contract?.student_exam_support_controls?.access_pattern, STUDENT_SELF_SERVICE_SUPPORT_DRAWER, "support controls use the student self-service drawer");

  assertIncludesEvery("frontend browser smoke journeys", keys(contract?.journeys), REQUIRED_FRONTEND_BROWSER_SMOKE_JOURNEYS);
  assertIncludesEvery("frontend browser smoke negative probes", keys(contract?.negative_probes), REQUIRED_FRONTEND_BROWSER_SMOKE_NEGATIVE_PROBES);

  const backendContractKeys = keys(contract?.backend_contracts_consumed);
  assertIncludesEvery("backend contracts consumed by frontend smoke", backendContractKeys, [
    "representative_fixture_manifest",
    "generic_crud_runtime_gate",
    "appointment_participation_runtime_gate",
    "evaluation_authoring_runtime_gate",
    "report_snapshot_export_runtime_gate",
    "student_exam_support_controls",
  ]);
}

export function assertLoadedFrontendBrowserSmokeContract(path = backendSmokeContractPath()) {
  const contract = loadBackendSmokeContract(path);
  assertFrontendBrowserSmokeContract(contract);
  return contract;
}
