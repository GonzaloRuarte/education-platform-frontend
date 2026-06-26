import assert from "node:assert/strict";
import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER, STUDENT_SUPPORT_DRAWER_SELF_SERVICE } from "./backend-contract-policy.mjs";
import {
  REQUIRED_FRONTEND_BROWSER_SMOKE_JOURNEYS,
  REQUIRED_FRONTEND_BROWSER_SMOKE_NEGATIVE_PROBES,
  assertFrontendBrowserSmokeContract,
} from "./frontend-browser-smoke-contract.mjs";
const validContract = {
  script_owner: "frontend/scripts/runtime/docker-smoke.mjs",
  status: "test_contract_fixture",
  backend_contracts_consumed: [
    { key: "representative_fixture_manifest" },
    { key: "generic_crud_runtime_gate" },
    { key: "appointment_participation_runtime_gate" },
    { key: "evaluation_authoring_runtime_gate" },
    { key: "report_snapshot_export_runtime_gate" },
    { key: "student_exam_support_controls" },
  ],
  fixture_policy: {
    fake_only: true,
    requires_two_organizations: true,
    production_data_allowed: false,
    organizations: ["org_alpha", "org_beta"],
  },
  journeys: REQUIRED_FRONTEND_BROWSER_SMOKE_JOURNEYS.map((key) => ({ key })),
  negative_probes: REQUIRED_FRONTEND_BROWSER_SMOKE_NEGATIVE_PROBES.map((key) => ({ key })),
  release_gate: {
    blocking: true,
    runtime_environment_required: true,
  },
  student_exam_support_controls: {
    access_pattern: STUDENT_SELF_SERVICE_SUPPORT_DRAWER,
    student_self_service_required: true,
    access_owner: "student",
  },
};

assertFrontendBrowserSmokeContract(validContract);

for (const bad of [
  { label: "self-service disabled", patch: { student_exam_support_controls: { ...validContract.student_exam_support_controls, student_self_service_required: false } } },
  { label: "production data", patch: { fixture_policy: { ...validContract.fixture_policy, production_data_allowed: true } } },
  { label: "missing drawer journey", patch: { journeys: validContract.journeys.filter((journey) => journey.key !== STUDENT_SUPPORT_DRAWER_SELF_SERVICE) } },
]) {
  assert.throws(
    () => assertFrontendBrowserSmokeContract({ ...validContract, ...bad.patch }),
    undefined,
    `${bad.label} should fail the frontend browser smoke contract`,
  );
}

console.log("Frontend browser smoke contract tests passed.");
