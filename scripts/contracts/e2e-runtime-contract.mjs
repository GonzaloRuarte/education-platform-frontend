import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER, STUDENT_SUPPORT_DRAWER_SELF_SERVICE } from "./backend-contract-policy.mjs";
const DEFAULT_E2E_CONTRACT_PATH = "../backend/docs/generated/e2e_browser_runtime_plan/e2e_browser_runtime_plan_manifest.json";

export const REQUIRED_E2E_JOURNEYS = Object.freeze([
  "authenticated_customer_resource_discovery",
  "generic_crud_list_detail_mutation_and_relation_options",
  "cross_organization_leakage_denials",
  "institution_setup_workbook_commit_chain",
  "matrix_role_grant_preview_apply_and_self_lockout_denial",
  "appointment_participation_absence_offline_scoring_repair",
  "evaluation_authoring_immutability_and_revision_copy",
  "report_snapshot_readiness_and_export_audit",
  STUDENT_SUPPORT_DRAWER_SELF_SERVICE,
  "setup_workbook_upload_dry_run_commit_and_reject_unsupported_ops",
  "matrix_role_editor_transaction_rollback_and_self_lockout_denial",
  "guest_preview_session_reset_and_demo_export_watermark",
]);

export const REQUIRED_E2E_NEGATIVE_PROBES = Object.freeze([
  "alpha_user_cannot_discover_beta_resources_or_rows",
  "workflow_only_targets_are_not_generic_crud_discoverable",
  "viewer_without_export_permission_cannot_download_report",
  "snapshot_readiness_state_controls_current_presentation",
  "student_support_drawer_opens_and_returns_focus",
  "accessibility_controls_open_from_student_exam_surface",
  "download_button_has_deliberate_action_but_self_service",
  "role_editor_rejects_self_lockout_before_apply",
  "beta_fixture_cannot_be_selected_from_alpha_workflow_forms",
  "guest_preview_cannot_create_production_rows",
  "manual_scoring_pending_snapshot_cannot_export_as_current",
]);

export function e2eRuntimeContractPath() {
  return resolve(process.env.RETROBOLT_E2E_RUNTIME_CONTRACT_PATH || DEFAULT_E2E_CONTRACT_PATH);
}

export function loadE2eRuntimeContract(path = e2eRuntimeContractPath()) {
  if (!existsSync(path)) {
    throw new Error(
      `Backend E2E/browser runtime contract not found at ${path}. ` +
      "Set RETROBOLT_E2E_RUNTIME_CONTRACT_PATH to backend/docs/generated/e2e_browser_runtime_plan/e2e_browser_runtime_plan_manifest.json.",
    );
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertIncludesEvery(label, actual, expected) {
  const actualSet = new Set(actual || []);
  for (const key of expected) {
    assert.ok(actualSet.has(key), `${label} should include ${key}`);
  }
}

export function assertE2eRuntimeContract(contract) {
  assert.equal(contract?.status, "browser_only_runner_ready_runtime_not_executed");
  assert.equal(contract?.runtime_environment_required, true, "E2E should require a provisioned runtime");
  assert.equal(contract?.browser_automation_required, true, "browser automation should be required");
  assert.equal(contract?.browser_stack_available_in_this_sandbox, false, "static contract should not claim browser execution in this sandbox");
  assert.equal(contract?.production_data_allowed, false, "E2E must use fake/demo data only");
  assert.equal(contract?.requires_fake_realistic_seed_data, true, "E2E should require fake realistic seed data");
  assert.equal(contract?.requires_two_organizations, true, "E2E should require two Organizations");
  assert.equal(contract?.student_support_self_service_required, true, "student support drawer must expose self-service support controls");
  assert.equal(contract?.student_support_surface, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);
  assert.equal(contract?.frontend_runner_owner, "frontend/scripts/runtime/browser-e2e.mjs");
  assert.equal(contract?.frontend_runtime_command, "npm run test:e2e:browser");
  assert.equal(contract?.release_gate?.blocking, true);
  assert.equal(contract?.release_gate?.cannot_be_claimed_by_static_tests, true);

  assertIncludesEvery("E2E journeys", contract?.required_journeys, REQUIRED_E2E_JOURNEYS);
  assertIncludesEvery("E2E negative probes", contract?.required_negative_probes, REQUIRED_E2E_NEGATIVE_PROBES);

  const contractKeys = new Set((contract?.backend_contracts_consumed || []).map((item) => item?.key));
  for (const key of [
    "provisioned_runtime_api_contract",
    "frontend_backend_ssot_compliance",
    "frontend_browser_smoke_runtime_gates",
    "cold_start_seed_plan",
    "e2e_page_object_selector_contract",
    "e2e_seeded_payload_contract",
  ]) {
    assert.ok(contractKeys.has(key), `E2E contract should consume backend contract ${key}`);
  }
}

export function assertLoadedE2eRuntimeContract(path = e2eRuntimeContractPath()) {
  const contract = loadE2eRuntimeContract(path);
  assertE2eRuntimeContract(contract);
  return contract;
}
