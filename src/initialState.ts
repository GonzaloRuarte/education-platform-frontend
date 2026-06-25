import type {
  AuditViewState,
  Locale,
  MatrixEditorResourceDraft,
  MatrixEditorState,
  ResourceExposureState,
  ManualScoringState,
  SetupWorkbookCellCorrection,
  SetupWorkbookState,
  ThemeMode,
} from "./types";
import { STORAGE_COLLAPSED_RESOURCE_GROUPS, STORAGE_LOCALE, STORAGE_THEME } from "./constants";

export function emptySetupWorkbookState(): SetupWorkbookState {
  return {
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

export function emptyMatrixEditorState(): MatrixEditorState {
  return {
    domain: "organization",
    universeByDomain: {},
    resourceDraft: emptyMatrixEditorResourceDraft(),
    resourceProposals: [],
    apiEntrypointDraft: "",
    apiEntrypoints: [],
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

export function emptyResourceExposureState(): ResourceExposureState {
  return {
    manifest: null,
    exposureFilter: "",
    query: "",
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
