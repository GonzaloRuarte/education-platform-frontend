import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
const DEFAULT_E2E_PAYLOAD_CONTRACT_PATH = "../backend/docs/generated/e2e_seeded_payload_contract/e2e_seeded_payload_contract_manifest.json";

export function e2ePayloadContractPath() {
  return resolve(process.env.RETROBOLT_E2E_PAYLOAD_CONTRACT_PATH || DEFAULT_E2E_PAYLOAD_CONTRACT_PATH);
}

export function loadE2ePayloadContract(path = e2ePayloadContractPath()) {
  if (!existsSync(path)) {
    throw new Error(
      `Backend E2E payload contract not found at ${path}. ` +
      "Set RETROBOLT_E2E_PAYLOAD_CONTRACT_PATH to backend/docs/generated/e2e_seeded_payload_contract/e2e_seeded_payload_contract_manifest.json.",
    );
  }
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertCaseGroup(contract, group, requiredCases) {
  const actual = new Set(contract?.payload_case_groups?.[group] || []);
  for (const key of requiredCases) {
    assert.ok(actual.has(key), `${group} should include ${key}`);
  }
}

export function assertE2ePayloadContract(contract) {
  assert.equal(contract?.status, "seeded_credentials_payload_builders_ready_runtime_not_executed");
  assert.equal(contract?.policy?.backend_docs_are_ssot, true);
  assert.equal(contract?.policy?.fake_only, true);
  assert.equal(contract?.policy?.production_data_allowed, false);
  assert.equal(contract?.policy?.requires_two_organizations, true);
  assert.equal(contract?.policy?.payload_builders_query_django, false);
  assert.equal(contract?.policy?.payload_builders_read_production_files, false);
  assert.equal(contract?.policy?.student_support_self_service_required, true);
  assert.equal(contract?.policy?.student_support_surface, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);
  assert.equal(contract?.frontend_helper, "frontend/scripts/contracts/e2e-payload-contract.mjs");
  assert.equal(contract?.frontend_contract_command, "npm run test:e2e-payload-contract");
  assert.equal(contract?.release_gate?.blocking, true);
  assert.equal(contract?.release_gate?.requires_browser_runtime_execution, true);

  const staffActors = new Set((contract?.seeded_staff_actors || []).map((actor) => actor.key));
  for (const key of ["alpha_principal", "alpha_teacher", "beta_principal", "beta_teacher"]) {
    assert.ok(staffActors.has(key), `seeded staff actor missing: ${key}`);
  }
  for (const actor of contract?.seeded_staff_actors || []) {
    assert.ok(String(actor.email || "").endsWith(".example.invalid"), `actor ${actor.key} must use fake email domain`);
    assert.equal(actor.fake_only, true, `actor ${actor.key} should be fake-only`);
  }
  for (const student of contract?.seeded_student_actors || []) {
    assert.equal(student.student_support_self_service_required, true, `${student.key} must expose self-service support controls`);
    assert.equal(student.support_surface, STUDENT_SELF_SERVICE_SUPPORT_DRAWER);
  }

  assertCaseGroup(contract, "setup_workbook", [
    "alpha_valid_full_setup_workbook",
    "beta_reference_inside_alpha_commit",
    "unsupported_delete_operation_rejected",
  ]);
  assertCaseGroup(contract, "offline_upload", ["alpha_late_offline_upload_review_pending"]);
  assertCaseGroup(contract, "report_export_expectation", [
    "alpha_complete_snapshot_pdf_download",
    "alpha_stale_snapshot_export_rejected",
    "guest_preview_demo_export_watermarked",
  ]);

  assert.ok(contract?.runtime_environment_template?.RETROBOLT_E2E_PAYLOAD_ARTIFACT_DIR);
  assert.ok(contract?.runtime_environment_template?.RETROBOLT_COLD_START_SEED_SUMMARY_JSON);
}

export function assertLoadedE2ePayloadContract(path = e2ePayloadContractPath()) {
  const contract = loadE2ePayloadContract(path);
  assertE2ePayloadContract(contract);
  return contract;
}

export function materializeE2ePayloadArtifactPlans(contract, artifactDir) {
  assertE2ePayloadContract(contract);
  const root = resolve(artifactDir || process.env.RETROBOLT_E2E_PAYLOAD_ARTIFACT_DIR || ".retrobolt-e2e-payloads");
  mkdirSync(root, { recursive: true });
  const outputs = [];
  for (const [group, cases] of Object.entries(contract.payload_case_groups || {})) {
    const payload = { group, cases, generated_from: "e2e_seeded_payload_contract_manifest.json", fake_only: true };
    const path = join(root, `${group}.payload-plan.json`);
    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    outputs.push(path);
  }
  return outputs;
}
