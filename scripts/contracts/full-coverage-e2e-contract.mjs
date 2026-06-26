import assert from "node:assert/strict";

export const FULL_COVERAGE_E2E_ACTORS = Object.freeze([
  "organization_owner@alpha.example.invalid",
  "organization_admin@alpha.example.invalid",
  "organization_analyst@alpha.example.invalid",
  "alpha.primary+principal.example.invalid",
  "alpha.primary+teacher.example.invalid",
  "alpha.primary+grader.example.invalid",
  "alpha.primary+coordinator.example.invalid",
  "alpha.primary+evaluation_author.example.invalid",
  "alpha.primary+viewer.example.invalid",
  "alpha.secondary+teacher.example.invalid",
  "teacher@alpha.example.invalid",
  "teacher@beta.example.invalid",
]);

export const FULL_COVERAGE_E2E_JOURNEYS = Object.freeze([
  {
    key: "organization_owner_can_manage_org_users_and_cannot_see_beta_rows",
    actorEmail: "organization_owner@alpha.example.invalid",
    allowed: ["open_matrix_editor", "apply_org_user_bundle", "read_alpha_resources"],
    denied: ["read_beta_resources"],
  },
  {
    key: "principal_can_manage_institution_setup_and_users",
    actorEmail: "alpha.primary+principal.example.invalid",
    allowed: ["setup_workbook_draft_validate_preview", "matrix_role_grant_preview", "appointment_fix_flag"],
    denied: ["beta_setup_commit"],
  },
  {
    key: "teacher_can_author_evaluations_manage_appointments_and_score_assigned_scope",
    actorEmail: "alpha.primary+teacher.example.invalid",
    allowed: ["create_evaluation", "reschedule_scoped_appointment", "manual_score_scoped_answer"],
    denied: ["manual_score_beta_answer", "reschedule_unscoped_appointment"],
  },
  {
    key: "grader_can_score_but_not_manage_appointments_or_evaluations",
    actorEmail: "alpha.primary+grader.example.invalid",
    allowed: ["manual_score_scoped_answer", "view_assigned_results"],
    denied: ["create_evaluation", "reschedule_scoped_appointment"],
  },
  {
    key: "viewer_can_view_reports_only",
    actorEmail: "alpha.primary+viewer.example.invalid",
    allowed: ["view_institution_reports"],
    denied: ["create_evaluation", "manual_score_scoped_answer", "setup_workbook_commit"],
  },
]);

export function assertFullCoverageE2eContract() {
  assert.ok(FULL_COVERAGE_E2E_ACTORS.length >= 10, "full-coverage E2E should include seeded role actors");
  assert.ok(FULL_COVERAGE_E2E_JOURNEYS.length >= 5, "full-coverage E2E should include allowed and denied journeys");
  for (const actor of FULL_COVERAGE_E2E_ACTORS) {
    assert.ok(actor.endsWith(".example.invalid"), `${actor} must use fake seed domain`);
  }
  for (const journey of FULL_COVERAGE_E2E_JOURNEYS) {
    assert.ok(journey.allowed.length > 0, `${journey.key} must declare allowed UX actions`);
    assert.ok(journey.denied.length > 0, `${journey.key} must declare denied UX actions`);
    assert.ok(FULL_COVERAGE_E2E_ACTORS.includes(journey.actorEmail), `${journey.key} actor must be seeded`);
  }
  return {
    status: "full_coverage_e2e_contract_ready_runtime_not_executed",
    actors: FULL_COVERAGE_E2E_ACTORS,
    journeys: FULL_COVERAGE_E2E_JOURNEYS,
  };
}
