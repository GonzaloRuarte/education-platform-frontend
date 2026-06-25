import assert from "node:assert/strict";
import { STUDENT_SELF_SERVICE_SUPPORT_DRAWER, STUDENT_SUPPORT_DRAWER_WITHOUT_SECOND_PIN } from "./backend-contract-policy.mjs";
import {
  REQUIRED_E2E_JOURNEYS,
  REQUIRED_E2E_NEGATIVE_PROBES,
  assertE2eRuntimeContract,
  assertLoadedE2eRuntimeContract,
} from "./e2e-runtime-contract.mjs";
const validContract = {
  status: "v128_browser_only_runner_ready_runtime_not_executed",
  runtime_environment_required: true,
  browser_automation_required: true,
  browser_compatibility_aliases_deleted: true,
  browser_stack_available_in_this_sandbox: false,
  production_data_allowed: false,
  requires_fake_realistic_seed_data: true,
  requires_two_organizations: true,
  second_exam_support_pin_required: false,
  student_support_surface: STUDENT_SELF_SERVICE_SUPPORT_DRAWER,
  frontend_runner_owner: "frontend/scripts/browser-e2e.mjs",
  frontend_runtime_command: "npm run test:e2e:browser",
  release_gate: {
    blocking: true,
    cannot_be_claimed_by_static_tests: true,
  },
  required_journeys: [...REQUIRED_E2E_JOURNEYS],
  required_negative_probes: [...REQUIRED_E2E_NEGATIVE_PROBES],
  backend_contracts_consumed: [
    { key: "provisioned_runtime_api_contract" },
    { key: "frontend_backend_ssot_compliance" },
    { key: "frontend_browser_smoke_runtime_gates" },
    { key: "cold_start_seed_plan" },
    { key: "e2e_page_object_selector_contract" },
    { key: "e2e_seeded_payload_contract" },
  ],
};

assertE2eRuntimeContract(validContract);
assertLoadedE2eRuntimeContract();

for (const bad of [
  { label: "production data", patch: { production_data_allowed: true } },
  { label: "second PIN", patch: { second_exam_support_pin_required: true } },
  { label: "missing browser automation", patch: { browser_automation_required: false } },
  { label: "browser alias reintroduced", patch: { browser_compatibility_aliases_deleted: false } },
  { label: "missing drawer journey", patch: { required_journeys: validContract.required_journeys.filter((journey) => journey !== STUDENT_SUPPORT_DRAWER_WITHOUT_SECOND_PIN) } },
]) {
  assert.throws(
    () => assertE2eRuntimeContract({ ...validContract, ...bad.patch }),
    undefined,
    `${bad.label} should fail the E2E runtime contract`,
  );
}

console.log("E2E/browser runtime contract tests passed.");
