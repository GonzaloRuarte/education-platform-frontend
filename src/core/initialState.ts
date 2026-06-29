import type {
  AppointmentEntryGateState,
  AuditViewState,
  Locale,
  MatrixEditorResourceDraft,
  MatrixEditorRoleGrantForm,
  MatrixEditorState,
  ManualScoringState,
  SetupWorkbookCellCorrection,
  SetupWorkbookState,
  ThemeMode,
} from "./types.js";
import { STORAGE_COLLAPSED_RESOURCE_GROUPS, STORAGE_LOCALE, STORAGE_THEME } from "./constants.js";

export function emptySetupWorkbookState(): SetupWorkbookState {
  return {
    selectedStage: "institution",
    organizationContextId: "",
    institutionContextId: "",
    contextOptions: [],
    contextOptionsLoading: false,
    contextOptionsError: null,
    wizard: {
      enabled: false,
      discoveryStatus: "idle",
      discoveryError: null,
      organizationOptionCount: null,
      institutionOptionCount: null,
      organizationAutoSelected: false,
      institutionAutoSelected: false,
      organizationCommittedAt: null,
      institutionCommittedAt: null,
      organizationAuditBatchId: null,
      institutionAuditBatchId: null,
    },
    manifest: null,
    selectedFile: null,
    dryRunResult: null,
    commitPlan: null,
    auditStageResult: null,
    runtimeCommitResult: null,
    omittedRows: new Set<string>(),
    confirmedWarningCodes: new Set<string>(),
    cellCorrections: new Map<string, SetupWorkbookCellCorrection>(),
    reason: "",
    loading: false,
    error: null,
  };
}

export function emptyMatrixEditorResourceDraft(): MatrixEditorResourceDraft {
  return {
    resource_key: "",
    action: "create",
    record_identity: "",
    after_json: "{}",
    error: null,
  };
}

export function emptyMatrixEditorRoleGrantForm(): MatrixEditorRoleGrantForm {
  return {
    action: "create",
    record_identity: "",
    user: "",
    role: "",
    organization: "",
    institution: "",
    status: "active",
    starts_on: "",
    ends_on: "",
    grant_reason: "",
    support_reason: "",
    scope_target: "",
    scope_ids: "",
    error: null,
  };
}

export function emptyMatrixEditorState(): MatrixEditorState {
  return {
    domain: "organization",
    universeByDomain: {},
    resourceDraft: emptyMatrixEditorResourceDraft(),
    resourceProposals: [],
    apiEntrypointDraft: "",
    apiEntrypoints: [],
    roleGrantDraft: JSON.stringify({ action: "create", after: { user: 0, role: 0, institution: 0, grant_reason: "" } }, null, 2),
    roleGrantForm: emptyMatrixEditorRoleGrantForm(),
    roleGrantProposals: [],
    rowScopeValues: new Map<string, string>(),
    columnGrantSelections: new Map<string, Set<string>>(),
    validation: null,
    preview: null,
    applyResult: null,
    reason: "",
    confirmDangerous: false,
    loading: false,
    error: null,
  };
}

export function emptyAuditViewState(): AuditViewState {
  return {
    kind: "batches",
    filters: {
      status: "",
      source: "",
      domain: "",
      eventType: "",
      limit: "50",
      offset: "0",
    },
    list: null,
    detail: null,
    selectedId: null,
    loading: false,
    error: null,
  };
}

export function emptyManualScoringState(): ManualScoringState {
  return {
    scoringState: "manual_scoring_pending",
    queue: null,
    selectedQuestionResolutionId: null,
    isRight: "",
    manualScore: "",
    manualScoreMax: "",
    reason: "",
    loading: false,
    error: null,
  };
}

export function emptyAppointmentEntryGateState(): AppointmentEntryGateState {
  return {
    appointmentId: "",
    passkeyRequired: false,
    generateNewPasskey: false,
    customPasskey: "",
    loading: false,
    error: null,
    result: null,
  };
}

export function loadCollapsedResourceGroups(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_COLLAPSED_RESOURCE_GROUPS) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

export function loadLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_LOCALE);
  if (stored === "en" || stored === "es") return stored;
  return "es";
}

export function loadTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_THEME);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}
