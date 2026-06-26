import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER } from "./backend-contract-policy.mjs";
import {
  assertE2ePayloadContract,
  assertLoadedE2ePayloadContract,
  materializeE2ePayloadArtifactPlans,
} from "./e2e-payload-contract.mjs";
const validContract = {
  status: "seeded_credentials_payload_builders_ready_runtime_not_executed",
  policy: {
    backend_docs_are_ssot: true,
    fake_only: true,
    production_data_allowed: false,
    requires_two_organizations: true,
    payload_builders_query_django: false,
    payload_builders_read_production_files: false,
    student_support_self_service_required: true,
    student_support_surface: STUDENT_SELF_SERVICE_SUPPORT_DRAWER,
  },
  frontend_helper: "frontend/scripts/contracts/e2e-payload-contract.mjs",
  frontend_contract_command: "npm run test:e2e-payload-contract",
  release_gate: { blocking: true, requires_browser_runtime_execution: true },
  seeded_staff_actors: [
    { key: "alpha_principal", email: "principal@alpha.example.invalid", fake_only: true },
    { key: "alpha_teacher", email: "teacher@alpha.example.invalid", fake_only: true },
    { key: "beta_principal", email: "principal@beta.example.invalid", fake_only: true },
    { key: "beta_teacher", email: "teacher@beta.example.invalid", fake_only: true },
  ],
  seeded_student_actors: [
    { key: "alpha_student_01", student_support_self_service_required: true, support_surface: STUDENT_SELF_SERVICE_SUPPORT_DRAWER },
  ],
  payload_case_groups: {
    setup_workbook: ["alpha_valid_full_setup_workbook", "beta_reference_inside_alpha_commit", "unsupported_delete_operation_rejected"],
    offline_upload: ["alpha_late_offline_upload_review_pending"],
    report_export_expectation: ["alpha_complete_snapshot_pdf_download", "alpha_stale_snapshot_export_rejected", "guest_preview_demo_export_watermarked"],
  },
  runtime_environment_template: {
    RETROBOLT_E2E_PAYLOAD_ARTIFACT_DIR: "/tmp/retrobolt-e2e-payloads",
    RETROBOLT_COLD_START_SEED_SUMMARY_JSON: "/tmp/cold_start_seed_summary.json",
  },
};

assertE2ePayloadContract(validContract);
const loaded = assertLoadedE2ePayloadContract();
assert.equal(loaded.policy.student_support_self_service_required, true);

const tmp = mkdtempSync(join(tmpdir(), "retrobolt-e2e-payload-contract-"));
try {
  const outputs = materializeE2ePayloadArtifactPlans(loaded, tmp);
  assert.ok(outputs.length >= 3);
  const combined = outputs.map((path) => readFileSync(path, "utf8")).join("\n");
  assert.match(combined, /alpha_valid_full_setup_workbook/);
  assert.match(combined, /fake_only/);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

for (const bad of [
  { label: "production data", patch: { policy: { ...validContract.policy, production_data_allowed: true } } },
  { label: "self-service disabled", patch: { policy: { ...validContract.policy, student_support_self_service_required: false } } },
  { label: "missing cross-org workbook", patch: { payload_case_groups: { ...validContract.payload_case_groups, setup_workbook: ["alpha_valid_full_setup_workbook"] } } },
]) {
  assert.throws(
    () => assertE2ePayloadContract({ ...validContract, ...bad.patch }),
    undefined,
    `${bad.label} should fail the payload contract`,
  );
}

console.log("E2E seeded payload contract tests passed.");
