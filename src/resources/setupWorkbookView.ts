import type {
  JsonValue,
  SetupWorkbookColumnManifest,
  SetupWorkbookSheetManifest,
  SetupWorkbookIssue,
  SetupWorkbookStagedRow,
  SetupWorkbookCellCorrection,
  SetupWorkbookSheetResult,
  SetupWorkbookDryRunResult,
  SetupWorkbookCommitOperation,
  SetupWorkbookCommitPlan,
  SetupWorkbookAuditStageResult,
  SetupWorkbookRuntimeCommitResult,
  SetupWorkbookManifest,
  SetupWorkbookState,
  Toast,
  SetupWorkbookStageSlug,
  SetupWorkbookContextOption,
  PaginatedRecords,
  ResourceRecord,
  ResourceSchema,
} from "../core/types.js";
import { el } from "../core/dom.js";
import { apiFetch, apiFetchBlob, publicErrorMessage, withSurface } from "../api/api.js";
import { resourceListPath, resourceSchemaPath } from "../api/resourceEndpoints.js";
import { BUSINESS_WORKFLOW_TEST_IDS } from "../core/testIds.js";

export interface SetupWorkbookViewRuntime {
  setupWorkbook: SetupWorkbookState;
  t: (key: string) => string;
  render: () => void;
  notify: (tone: Toast["tone"], message: string) => void;
}

let runtime: SetupWorkbookViewRuntime;
const SETUP_WORKBOOK_DRAFT_KEY = "retrobolt.setupWorkbookDraft.v1";
const SETUP_WORKBOOK_REQUIRED_ENDPOINT_MARKERS = [
  "/api/setup-workbook/organization/dry-run/",
  "/api/setup-workbook/institution/dry-run/",
  "/api/setup-workbook/organization/draft/commit-plan/",
  "/api/setup-workbook/institution/draft/commit-plan/",
  "/api/setup-workbook/organization/draft/commit-audit-stage/",
  "/api/setup-workbook/institution/draft/runtime-commit/",
] as const;
void SETUP_WORKBOOK_REQUIRED_ENDPOINT_MARKERS;
let setupWorkbookDraftRestored = false;

type SetupWorkbookDraftWizard = {
  enabled?: boolean;
  discoveryStatus?: string;
  discoveryError?: string | null;
  organizationOptionCount?: number | null;
  institutionOptionCount?: number | null;
  organizationAutoSelected?: boolean;
  institutionAutoSelected?: boolean;
  organizationCommittedAt?: string | null;
  institutionCommittedAt?: string | null;
  organizationAuditBatchId?: string | number | null;
  institutionAuditBatchId?: string | number | null;
};

type SetupWorkbookDraft = {
  stage?: SetupWorkbookStageSlug;
  organizationContextId?: string;
  institutionContextId?: string;
  wizard?: SetupWorkbookDraftWizard;
  reason?: string;
  omittedRows?: string[];
  confirmedWarningCodes?: string[];
  cellCorrections?: SetupWorkbookCellCorrection[];
};

type SetupWorkbookDraftRowPayload = {
  row_number: number;
  values: Record<string, JsonValue>;
};

type SetupWorkbookDraftSheetPayload = {
  sheet: string;
  rows: SetupWorkbookDraftRowPayload[];
};

function restoreSetupWorkbookDraft(state: SetupWorkbookState): void {
  if (setupWorkbookDraftRestored) {
    return;
  }
  setupWorkbookDraftRestored = true;
  try {
    const raw = localStorage.getItem(SETUP_WORKBOOK_DRAFT_KEY);
    if (!raw) {
      return;
    }
    const draft = JSON.parse(raw) as SetupWorkbookDraft;
    state.selectedStage = draft.stage === "organization" || draft.stage === "institution" ? draft.stage : state.selectedStage;
    state.organizationContextId = typeof draft.organizationContextId === "string" ? draft.organizationContextId : state.organizationContextId;
    state.institutionContextId = typeof draft.institutionContextId === "string" ? draft.institutionContextId : state.institutionContextId;
    restoreSetupWorkbookWizardDraft(state, draft.wizard);
    state.reason = typeof draft.reason === "string" ? draft.reason : state.reason;
    state.omittedRows = new Set((draft.omittedRows ?? []).map(String).filter(Boolean));
    state.confirmedWarningCodes = new Set((draft.confirmedWarningCodes ?? []).map(String).filter(Boolean));
    state.cellCorrections = new Map((draft.cellCorrections ?? [])
      .filter((correction) => correction && correction.sheet && correction.row_number && correction.column)
      .map((correction) => [setupWorkbookCellCorrectionKey(correction.sheet, correction.row_number, correction.column), correction]));
  } catch {
    // A corrupt local draft should not block yearly setup.
  }
}

function restoreSetupWorkbookWizardDraft(state: SetupWorkbookState, draft: SetupWorkbookDraftWizard | undefined): void {
  if (!draft) {
    return;
  }
  state.wizard.enabled = draft.enabled === true;
  state.wizard.discoveryStatus = draft.discoveryStatus === "ready" || draft.discoveryStatus === "unavailable" ? draft.discoveryStatus : "idle";
  state.wizard.discoveryError = typeof draft.discoveryError === "string" ? draft.discoveryError : null;
  state.wizard.organizationOptionCount = typeof draft.organizationOptionCount === "number" ? draft.organizationOptionCount : null;
  state.wizard.institutionOptionCount = typeof draft.institutionOptionCount === "number" ? draft.institutionOptionCount : null;
  state.wizard.organizationAutoSelected = draft.organizationAutoSelected === true;
  state.wizard.institutionAutoSelected = draft.institutionAutoSelected === true;
  state.wizard.organizationCommittedAt = typeof draft.organizationCommittedAt === "string" ? draft.organizationCommittedAt : null;
  state.wizard.institutionCommittedAt = typeof draft.institutionCommittedAt === "string" ? draft.institutionCommittedAt : null;
  state.wizard.organizationAuditBatchId = typeof draft.organizationAuditBatchId === "string" || typeof draft.organizationAuditBatchId === "number" ? draft.organizationAuditBatchId : null;
  state.wizard.institutionAuditBatchId = typeof draft.institutionAuditBatchId === "string" || typeof draft.institutionAuditBatchId === "number" ? draft.institutionAuditBatchId : null;
}

function clearSetupWorkbookDraft(): void {
  try {
    localStorage.removeItem(SETUP_WORKBOOK_DRAFT_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}

function resetSetupWorkbookWizardState(): void {
  runtime.setupWorkbook.wizard.enabled = false;
  runtime.setupWorkbook.wizard.discoveryStatus = "idle";
  runtime.setupWorkbook.wizard.discoveryError = null;
  runtime.setupWorkbook.wizard.organizationOptionCount = null;
  runtime.setupWorkbook.wizard.institutionOptionCount = null;
  runtime.setupWorkbook.wizard.organizationAutoSelected = false;
  runtime.setupWorkbook.wizard.institutionAutoSelected = false;
  runtime.setupWorkbook.wizard.organizationCommittedAt = null;
  runtime.setupWorkbook.wizard.institutionCommittedAt = null;
  runtime.setupWorkbook.wizard.organizationAuditBatchId = null;
  runtime.setupWorkbook.wizard.institutionAuditBatchId = null;
}

function resetSetupWorkbookLocalDraftState(): void {
  runtime.setupWorkbook.reason = "";
  runtime.setupWorkbook.omittedRows.clear();
  runtime.setupWorkbook.confirmedWarningCodes.clear();
  runtime.setupWorkbook.cellCorrections.clear();
  runtime.setupWorkbook.commitPlan = null;
  runtime.setupWorkbook.auditStageResult = null;
  runtime.setupWorkbook.runtimeCommitResult = null;
  runtime.setupWorkbook.error = null;
  resetSetupWorkbookWizardState();
}

function discardSetupWorkbookLocalDraft(): void {
  clearSetupWorkbookDraft();
  resetSetupWorkbookLocalDraftState();
  runtime.notify("info", runtime.t("workbook_draft_cleared"));
  runtime.render();
}

function setupWorkbookHasLocalDraft(): boolean {
  return Boolean(
    runtime.setupWorkbook.reason.trim() ||
    runtime.setupWorkbook.omittedRows.size ||
    runtime.setupWorkbook.confirmedWarningCodes.size ||
    runtime.setupWorkbook.cellCorrections.size
  );
}

function installSetupWorkbookBeforeUnloadGuard(): void {
  if ((window as unknown as { __setupWorkbookDraftGuard?: boolean }).__setupWorkbookDraftGuard) {
    return;
  }
  (window as unknown as { __setupWorkbookDraftGuard?: boolean }).__setupWorkbookDraftGuard = true;
  window.addEventListener("beforeunload", (event) => {
    if (!runtime || !setupWorkbookHasLocalDraft()) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  });
}

function persistSetupWorkbookDraft(): void {
  try {
    const draft: SetupWorkbookDraft = {
      stage: runtime.setupWorkbook.selectedStage,
      organizationContextId: runtime.setupWorkbook.organizationContextId,
      institutionContextId: runtime.setupWorkbook.institutionContextId,
      wizard: {
        enabled: runtime.setupWorkbook.wizard.enabled,
        discoveryStatus: runtime.setupWorkbook.wizard.discoveryStatus,
        discoveryError: runtime.setupWorkbook.wizard.discoveryError,
        organizationOptionCount: runtime.setupWorkbook.wizard.organizationOptionCount,
        institutionOptionCount: runtime.setupWorkbook.wizard.institutionOptionCount,
        organizationAutoSelected: runtime.setupWorkbook.wizard.organizationAutoSelected,
        institutionAutoSelected: runtime.setupWorkbook.wizard.institutionAutoSelected,
        organizationCommittedAt: runtime.setupWorkbook.wizard.organizationCommittedAt,
        institutionCommittedAt: runtime.setupWorkbook.wizard.institutionCommittedAt,
        organizationAuditBatchId: runtime.setupWorkbook.wizard.organizationAuditBatchId,
        institutionAuditBatchId: runtime.setupWorkbook.wizard.institutionAuditBatchId,
      },
      reason: runtime.setupWorkbook.reason,
      omittedRows: [...runtime.setupWorkbook.omittedRows],
      confirmedWarningCodes: [...runtime.setupWorkbook.confirmedWarningCodes],
      cellCorrections: setupWorkbookCellCorrections(),
    };
    localStorage.setItem(SETUP_WORKBOOK_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage may be unavailable/private; the workflow should still work.
  }
}


function setupWorkbookStageSlug(): SetupWorkbookStageSlug {
  return runtime.setupWorkbook.selectedStage === "organization" ? "organization" : "institution";
}

function setupWorkbookEndpointForStage(stage: SetupWorkbookStageSlug, path: string): string {
  return `/api/setup-workbook/${stage}/${path}`;
}

function setupWorkbookEndpoint(path: string): string {
  return setupWorkbookEndpointForStage(setupWorkbookStageSlug(), path);
}

function setupWorkbookContextIdForStage(stage: SetupWorkbookStageSlug): string {
  return stage === "organization"
    ? runtime.setupWorkbook.organizationContextId.trim()
    : runtime.setupWorkbook.institutionContextId.trim();
}

function setupWorkbookContextId(): string {
  return setupWorkbookContextIdForStage(setupWorkbookStageSlug());
}

function setupWorkbookContextFieldNameForStage(stage: SetupWorkbookStageSlug): "organization_id" | "institution_id" {
  return stage === "organization" ? "organization_id" : "institution_id";
}

function setupWorkbookContextFieldName(): "organization_id" | "institution_id" {
  return setupWorkbookContextFieldNameForStage(setupWorkbookStageSlug());
}

function setupWorkbookEndpointWithContext(path: string): string {
  const contextId = setupWorkbookContextId();
  if (!contextId) {
    return setupWorkbookEndpoint(path);
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${setupWorkbookEndpoint(path)}${separator}${setupWorkbookContextFieldName()}=${encodeURIComponent(contextId)}`;
}

function setupWorkbookTemplateFilename(): string {
  return setupWorkbookStageSlug() === "organization" ? "organization-setup-template.xlsx" : "institution-setup-template.xlsx";
}

function resetSetupWorkbookStageData(): void {
  runtime.setupWorkbook.manifest = null;
  runtime.setupWorkbook.contextOptions = [];
  runtime.setupWorkbook.contextOptionsError = null;
  runtime.setupWorkbook.selectedFile = null;
  runtime.setupWorkbook.dryRunResult = null;
  runtime.setupWorkbook.commitPlan = null;
  runtime.setupWorkbook.auditStageResult = null;
  runtime.setupWorkbook.runtimeCommitResult = null;
  runtime.setupWorkbook.omittedRows.clear();
  runtime.setupWorkbook.confirmedWarningCodes.clear();
  runtime.setupWorkbook.cellCorrections.clear();
  runtime.setupWorkbook.error = null;
}

function selectSetupWorkbookStage(stage: SetupWorkbookStageSlug): void {
  if (runtime.setupWorkbook.selectedStage === stage) {
    runtime.render();
    return;
  }
  runtime.setupWorkbook.selectedStage = stage;
  resetSetupWorkbookStageData();
  persistSetupWorkbookDraft();
  void loadSetupWorkbookManifest();
}

function setupWorkbookDraftSourceLabel(): string {
  if (runtime.setupWorkbook.selectedFile) {
    return runtime.t("workbook_source_excel");
  }
  if (setupWorkbookHasDraftRows()) {
    return runtime.t("workbook_source_current");
  }
  return runtime.t("workbook_select_file");
}

function renderSetupWorkbookDraftStatus(): HTMLElement {
  const changedCells = runtime.setupWorkbook.cellCorrections.size;
  const omittedRows = runtime.setupWorkbook.omittedRows.size;
  const confirmedWarnings = runtime.setupWorkbook.confirmedWarningCodes.size;
  const clearButton = el("button", { class: "button", type: "button", disabled: setupWorkbookHasLocalDraft() ? null : true }, [runtime.t("workbook_clear_draft")]);
  clearButton.addEventListener("click", () => discardSetupWorkbookLocalDraft());
  return el("div", { class: "setup-workbook__draft-status" }, [
    el("div", {}, [
      el("strong", {}, [runtime.t("workbook_draft_status")]),
      el("p", { class: "cell-muted" }, [runtime.t("workbook_draft_saved")]),
    ]),
    el("div", { class: "meta-line" }, [
      el("span", { class: "badge" }, [setupWorkbookDraftSourceLabel()]),
      el("span", { class: "badge" }, [`${changedCells} ${runtime.t("workbook_changed_cells")}`]),
      el("span", { class: "badge" }, [`${omittedRows} ${runtime.t("workbook_omit_row")}`]),
      el("span", { class: "badge" }, [`${confirmedWarnings} ${runtime.t("workbook_confirm_warning")}`]),
      clearButton,
    ]),
  ]);
}

function fieldShell(label: string, input: HTMLElement, helpText?: string): HTMLElement {
  return el("div", { class: "field" }, [
    el("label", {}, [label]),
    input,
    helpText ? el("p", { class: "field__help" }, [helpText]) : null,
  ]);
}

function setupWorkbookContextOptions(): SetupWorkbookContextOption[] {
  return runtime.setupWorkbook.contextOptions ?? [];
}

function setupWorkbookContextHelp(): string {
  const selectorHelp = runtime.setupWorkbook.manifest?.context_selector?.help_text;
  if (typeof selectorHelp === "string" && selectorHelp.trim()) {
    return selectorHelp;
  }
  return runtime.t("setup_workbook_context_help");
}

function renderSetupWorkbookContextSelector(): HTMLElement {
  const contextLabel = setupWorkbookStageSlug() === "organization"
    ? runtime.t("setup_workbook_organization_context")
    : runtime.t("setup_workbook_institution_context");
  const options = setupWorkbookContextOptions();
  const currentValue = setupWorkbookContextId();

  if (runtime.setupWorkbook.manifest?.context_selector && options.length > 0) {
    const select = el("select", {
      class: "input",
      "aria-label": contextLabel,
      disabled: runtime.setupWorkbook.contextOptionsLoading ? true : null,
    }, [
      el("option", { value: "" }, [runtime.t("setup_workbook_context_infer")]),
      ...options.map((option) => el("option", {
        value: option.value,
        selected: option.value === currentValue ? "selected" : null,
      }, [option.label])),
    ]) as HTMLSelectElement;
    select.addEventListener("change", () => updateSetupWorkbookContextId(select.value));
    return fieldShell(contextLabel, select, setupWorkbookContextHelp());
  }

  const input = el("input", {
    class: "input",
    type: "number",
    min: "1",
    value: currentValue,
    "aria-label": contextLabel,
  }) as HTMLInputElement;
  input.addEventListener("change", () => updateSetupWorkbookContextId(input.value.trim()));
  const help = runtime.setupWorkbook.contextOptionsError
    ? `${setupWorkbookContextHelp()} ${runtime.setupWorkbook.contextOptionsError}`
    : setupWorkbookContextHelp();
  return fieldShell(contextLabel, input, help);
}

function updateSetupWorkbookContextId(value: string): void {
  if (setupWorkbookStageSlug() === "organization") {
    runtime.setupWorkbook.organizationContextId = value.trim();
  } else {
    runtime.setupWorkbook.institutionContextId = value.trim();
  }
  runtime.setupWorkbook.dryRunResult = null;
  runtime.setupWorkbook.commitPlan = null;
  runtime.setupWorkbook.auditStageResult = null;
  runtime.setupWorkbook.runtimeCommitResult = null;
  runtime.setupWorkbook.error = null;
  persistSetupWorkbookDraft();
  runtime.render();
}

function renderSetupWorkbookLoading(message: string): HTMLElement {
  return el("section", { class: "card" }, [
    el("div", { class: "card__body" }, [message]),
  ]);
}

export function renderSetupWorkbookPage(nextRuntime: SetupWorkbookViewRuntime): HTMLElement {
  runtime = nextRuntime;
  restoreSetupWorkbookDraft(runtime.setupWorkbook);
  installSetupWorkbookBeforeUnloadGuard();
  if (!runtime.setupWorkbook.manifest && !runtime.setupWorkbook.loading) {
    void loadSetupWorkbookManifest();
  }
  const stageSelect = el("select", { class: "input", "aria-label": runtime.t("setup_workbook_stage") }, [
    el("option", { value: "institution", selected: setupWorkbookStageSlug() === "institution" ? "selected" : null }, [runtime.t("setup_workbook_stage_institution")]),
    el("option", { value: "organization", selected: setupWorkbookStageSlug() === "organization" ? "selected" : null }, [runtime.t("setup_workbook_stage_organization")]),
  ]) as HTMLSelectElement;
  stageSelect.addEventListener("change", () => {
    selectSetupWorkbookStage(stageSelect.value === "organization" ? "organization" : "institution");
  });
  const contextField = renderSetupWorkbookContextSelector();
  const templateButton = el("button", { class: "button", type: "button", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.templateButton }, [runtime.t("download_template")]);
  templateButton.addEventListener("click", () => {
    void downloadSetupWorkbookTemplate();
  });

  const draftButton = el("button", { class: "button", type: "button", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.draftButton }, [runtime.t("load_current_setup")]);
  draftButton.addEventListener("click", () => {
    void loadSetupWorkbookDraft();
  });

  const fileInput = el("input", {
    class: "input",
    type: "file",
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "aria-label": runtime.t("choose_workbook"),
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.fileInput,
  }) as HTMLInputElement;
  fileInput.addEventListener("change", () => {
    runtime.setupWorkbook.selectedFile = fileInput.files?.[0] ?? null;
    runtime.setupWorkbook.dryRunResult = null;
    runtime.setupWorkbook.commitPlan = null;
    runtime.setupWorkbook.auditStageResult = null;
    runtime.setupWorkbook.runtimeCommitResult = null;
    runtime.setupWorkbook.omittedRows.clear();
    runtime.setupWorkbook.confirmedWarningCodes.clear();
    runtime.setupWorkbook.cellCorrections.clear();
    persistSetupWorkbookDraft();
    runtime.setupWorkbook.error = null;
    persistSetupWorkbookDraft();
    runtime.render();
  });

  const dryRunButton = el("button", {
    class: "button primary",
    type: "button",
    disabled: (runtime.setupWorkbook.selectedFile || runtime.setupWorkbook.dryRunResult) && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.dryRunButton,
  }, [runtime.t("run_dry_run")]);
  dryRunButton.addEventListener("click", () => {
    void runSetupWorkbookDryRun();
  });

  const previewButton = el("button", {
    class: "button",
    type: "button",
    disabled: runtime.setupWorkbook.dryRunResult && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.previewButton,
  }, [runtime.t("build_preview")]);
  previewButton.addEventListener("click", () => {
    void buildSetupWorkbookCommitPlan();
  });

  const auditStageButton = el("button", {
    class: "button primary",
    type: "button",
    disabled: runtime.setupWorkbook.dryRunResult && runtime.setupWorkbook.commitPlan?.commit_allowed && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.auditStageButton,
  }, [runtime.t("stage_workbook_audit")]);
  auditStageButton.addEventListener("click", () => {
    void stageSetupWorkbookAuditBatch();
  });

  const runtimeCommitButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: runtime.setupWorkbook.dryRunResult && runtime.setupWorkbook.commitPlan?.commit_allowed && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.runtimeCommitButton,
  }, [runtime.t("commit_workbook_runtime")]);
  runtimeCommitButton.addEventListener("click", () => {
    void commitSetupWorkbookRuntime();
  });

  const reasonInput = el("textarea", {
    class: "textarea",
    placeholder: runtime.t("workbook_reason"),
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.reasonInput,
  }, [runtime.setupWorkbook.reason]);
  reasonInput.addEventListener("change", () => {
    runtime.setupWorkbook.reason = reasonInput.value;
    persistSetupWorkbookDraft();
  });

  const notices: Node[] = [];
  if (runtime.setupWorkbook.error) {
    notices.push(el("div", { class: "error" }, [runtime.setupWorkbook.error]));
  }
  notices.push(el("div", { class: "notice" }, [runtime.t("workbook_no_business_writes")]));

  return el("section", { class: "stack setup-workbook", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.page }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [runtime.t("setup_workbook_title")]),
        el("p", { class: "page-subtitle" }, [runtime.t("setup_workbook_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [templateButton, draftButton]),
    ]),
    renderSetupWorkbookSingleInstitutionWizard(),
    fieldShell(runtime.t("setup_workbook_stage"), stageSelect, runtime.t("setup_workbook_stage_help")),
    contextField,
    ...notices,
    el("section", { class: "card" }, [
      el("div", { class: "card__body stack" }, [
        renderSetupWorkbookDraftStatus(),
        el("div", { class: "toolbar" }, [fileInput, dryRunButton, previewButton, auditStageButton, runtimeCommitButton]),
        fieldShell(runtime.t("workbook_reason"), reasonInput),
        runtime.setupWorkbook.selectedFile
          ? el("p", { class: "meta-line" }, [runtime.setupWorkbook.selectedFile.name])
          : runtime.setupWorkbook.dryRunResult
            ? el("p", { class: "meta-line" }, [runtime.t("workbook_current_draft")])
            : el("p", { class: "cell-muted" }, [runtime.t("workbook_select_file")]),
      ]),
    ]),
    renderSetupWorkbookManifestCard(),
    renderSetupWorkbookDryRunResult(),
    renderSetupWorkbookCommitPlan(),
    renderSetupWorkbookAuditStageResult(),
    renderSetupWorkbookRuntimeCommitResult(),
  ]);
}


function renderSetupWorkbookManifestCard(): HTMLElement {
  const manifest = runtime.setupWorkbook.manifest;
  if (runtime.setupWorkbook.loading && !manifest) {
    return renderSetupWorkbookLoading(runtime.t("loading_resource"));
  }
  if (!manifest) {
    return el("section", { class: "card" }, [
      el("div", { class: "card__body cell-muted" }, [runtime.t("workbook_manifest_failed")]),
    ]);
  }
  const sheets = manifest.sheets ?? [];
  const sheetList = el("div", { class: "setup-workbook__sheet-grid" });
  for (const sheet of sheets) {
    const requiredColumns = (sheet.columns ?? []).filter((column) => column.required).length;
    sheetList.append(el("div", { class: "setup-workbook__sheet-card" }, [
      el("strong", {}, [sheet.title || sheet.key]),
      el("span", { class: "cell-muted" }, [sheet.description || sheet.resource_key || ""]),
      el("span", { class: "badge" }, [`${(sheet.columns ?? []).length} columns`]),
      requiredColumns ? el("span", { class: "badge" }, [`${requiredColumns} required`]) : null,
    ]));
  }
  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.manifestCard }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("workbook_summary")]),
      sheetList,
    ]),
  ]);
}

function renderSetupWorkbookDryRunResult(): HTMLElement {
  const result = runtime.setupWorkbook.dryRunResult;
  if (!result) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.dryRunResult }, [el("div", { class: "card__body cell-muted" }, [runtime.t("workbook_no_preview")])]);
  }
  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.dryRunResult }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [runtime.t("workbook_summary")]),
        el("span", { class: `badge badge--${result.status === "valid" ? "success" : "danger"}` }, [result.status]),
      ]),
      renderSummaryGrid(result.summary ?? {}),
      renderSetupWorkbookIssueGroups(result),
      renderSetupWorkbookRows(result),
    ]),
  ]);
}

function renderSetupWorkbookIssueGroups(result: SetupWorkbookDryRunResult): HTMLElement {
  const issues = [
    ...(result.errors ?? []).map((issue) => ({ ...issue, severity: issue.severity ?? "error" })),
    ...(result.warnings ?? []).map((issue) => ({ ...issue, severity: issue.severity ?? "warning" })),
  ];
  if (issues.length === 0) {
    return el("section", { class: "stack" }, [
      el("h3", {}, [runtime.t("workbook_issues")]),
      el("div", { class: "success" }, [runtime.t("workbook_no_issues")]),
    ]);
  }

  const groups = new Map<string, SetupWorkbookIssue[]>();
  for (const issue of issues) {
    const key = issue.sheet || "general";
    groups.set(key, [...(groups.get(key) ?? []), issue]);
  }
  const container = el("section", { class: "stack" }, [el("h3", {}, [runtime.t("workbook_issues")])]);
  for (const [sheet, sheetIssues] of groups) {
    container.append(el("details", { class: "contract-details", open: true }, [
      el("summary", {}, [`${sheet} (${sheetIssues.length})`]),
      el("div", { class: "contract-details__body" }, sheetIssues.map(renderSetupWorkbookIssue)),
    ]));
  }
  return container;
}

function renderSetupWorkbookIssue(issue: SetupWorkbookIssue): HTMLElement {
  const rowKey = setupWorkbookIssueRowKey(issue);
  const controls: Node[] = [];
  if (issue.omittable && rowKey) {
    const omit = el("input", {
      type: "checkbox",
      checked: runtime.setupWorkbook.omittedRows.has(rowKey),
      "aria-label": runtime.t("workbook_omit_row"),
    }) as HTMLInputElement;
    omit.addEventListener("change", () => {
      if (omit.checked) {
        runtime.setupWorkbook.omittedRows.add(rowKey);
      } else {
        runtime.setupWorkbook.omittedRows.delete(rowKey);
      }
      runtime.setupWorkbook.commitPlan = null;
      persistSetupWorkbookDraft();
      runtime.render();
    });
    controls.push(el("label", { class: "checkbox-row" }, [omit, runtime.t("workbook_omit_row")]));
  }
  if (issue.requires_confirmation) {
    const confirm = el("input", {
      type: "checkbox",
      checked: runtime.setupWorkbook.confirmedWarningCodes.has(issue.code),
      "aria-label": `${runtime.t("workbook_confirm_warning")} ${issue.code}`,
    }) as HTMLInputElement;
    confirm.addEventListener("change", () => {
      if (confirm.checked) {
        runtime.setupWorkbook.confirmedWarningCodes.add(issue.code);
      } else {
        runtime.setupWorkbook.confirmedWarningCodes.delete(issue.code);
      }
      runtime.setupWorkbook.commitPlan = null;
      persistSetupWorkbookDraft();
      runtime.render();
    });
    controls.push(el("label", { class: "checkbox-row" }, [confirm, `${runtime.t("workbook_confirm_warning")}: ${issue.code}`]));
  }
  const location = [
    issue.row ? `row ${issue.row}` : "",
    issue.column ? `column ${issue.column}` : "",
  ].filter(Boolean).join(" · ");
  return el("div", { class: `setup-workbook__issue setup-workbook__issue--${issue.severity === "error" ? "error" : "warning"}` }, [
    el("div", {}, [
      el("strong", {}, [issue.code]),
      location ? el("span", { class: "cell-muted" }, [` ${location}`]) : null,
      el("p", {}, [issue.message]),
    ]),
    controls.length ? el("div", { class: "stack" }, controls) : null,
  ]);
}

function renderSetupWorkbookRows(result: SetupWorkbookDryRunResult): HTMLElement {
  const sheets = result.sheets ?? [];
  if (sheets.length === 0) {
    return el("section", { class: "stack" }, [el("h3", {}, [runtime.t("workbook_rows")]), el("div", { class: "empty" }, [runtime.t("no_records_returned")])]);
  }
  const table = el("table");
  table.append(el("thead", {}, [el("tr", {}, [
    el("th", {}, ["Sheet"]),
    el("th", {}, ["Resource"]),
    el("th", {}, ["Rows"]),
    el("th", {}, ["Operations"]),
  ])]));
  const body = el("tbody");
  for (const sheet of sheets) {
    const operationCounts = new Map<string, number>();
    for (const row of sheet.rows ?? []) {
      const operation = row.operation || "create_or_update";
      operationCounts.set(operation, (operationCounts.get(operation) ?? 0) + 1);
    }
    body.append(el("tr", {}, [
      el("td", {}, [sheet.title || sheet.sheet]),
      el("td", {}, [sheet.resource_key || "—"]),
      el("td", {}, [String((sheet.rows ?? []).length)]),
      el("td", {}, [[...operationCounts.entries()].map(([key, count]) => `${key}: ${count}`).join(", ") || "—"]),
    ]));
  }
  table.append(body);
  return el("section", { class: "stack" }, [
    el("h3", {}, [runtime.t("workbook_rows")]),
    el("div", { class: "table-wrap" }, [table]),
    renderSetupWorkbookCellFixes(sheets),
  ]);
}

function renderSetupWorkbookCellFixes(sheets: SetupWorkbookSheetResult[]): HTMLElement {
  const details = el("section", { class: "stack" }, [
    el("h3", {}, [runtime.t("workbook_cell_fixes")]),
    el("p", { class: "cell-muted" }, [runtime.t("workbook_cell_fixes_help")]),
    el("span", { class: "badge" }, [`${runtime.setupWorkbook.cellCorrections.size} ${runtime.t("workbook_changed_cells")}`]),
  ]);
  const sheetManifestByKey = new Map((runtime.setupWorkbook.manifest?.sheets ?? []).map((sheet) => [sheet.key, sheet]));
  for (const sheet of sheets) {
    const manifestSheet = sheetManifestByKey.get(sheet.sheet);
    const rows = sheet.rows ?? [];
    if (!manifestSheet || rows.length === 0) {
      continue;
    }
    const editableColumns = manifestSheet.columns ?? [];
    const table = el("table", { class: "setup-workbook__fix-table" });
    table.append(el("thead", {}, [el("tr", {}, [
      el("th", {}, ["Row"]),
      el("th", {}, ["Operation"]),
      ...editableColumns.map((column) => el("th", {}, [column.label || column.key])),
    ])]));
    const body = el("tbody");
    for (const row of rows) {
      body.append(el("tr", {}, [
        el("td", {}, [String(row.row_number)]),
        el("td", {}, [row.operation || "create_or_update"]),
        ...editableColumns.map((column) => el("td", {}, [renderSetupWorkbookCellInput(sheet.sheet, row, column)])),
      ]));
    }
    table.append(body);
    details.append(el("details", { class: "contract-details" }, [
      el("summary", {}, [`${sheet.title || sheet.sheet} (${rows.length})`]),
      el("div", { class: "contract-details__body" }, [el("div", { class: "table-wrap" }, [table])]),
    ]));
  }
  return details;
}

function renderSetupWorkbookCellInput(
  sheet: string,
  row: SetupWorkbookStagedRow,
  column: SetupWorkbookColumnManifest,
): HTMLElement {
  const key = setupWorkbookCellCorrectionKey(sheet, row.row_number, column.key);
  const originalValue = row.values?.[column.key];
  const currentValue = runtime.setupWorkbook.cellCorrections.get(key)?.value ?? row.corrected_values?.[column.key] ?? originalValue;
  const input = el("input", {
    class: runtime.setupWorkbook.cellCorrections.has(key) ? "input setup-workbook__cell-input setup-workbook__cell-input--changed" : "input setup-workbook__cell-input",
    type: "text",
    "aria-label": `${sheet} row ${row.row_number} ${column.key}`,
  }) as HTMLInputElement;
  input.value = formatWorkbookCellInputValue(currentValue);
  input.addEventListener("change", () => {
    updateSetupWorkbookCellCorrection(sheet, row, column, input.value);
  });
  return input;
}

function updateSetupWorkbookCellCorrection(
  sheet: string,
  row: SetupWorkbookStagedRow,
  column: SetupWorkbookColumnManifest,
  rawValue: string,
): void {
  const key = setupWorkbookCellCorrectionKey(sheet, row.row_number, column.key);
  const originalValue = formatWorkbookCellInputValue(row.values?.[column.key]);
  if (rawValue === originalValue) {
    runtime.setupWorkbook.cellCorrections.delete(key);
  } else {
    runtime.setupWorkbook.cellCorrections.set(key, {
      sheet,
      row_number: row.row_number,
      column: column.key,
      value: rawValue === "" ? null : rawValue,
    });
  }
  runtime.setupWorkbook.commitPlan = null;
  runtime.setupWorkbook.auditStageResult = null;
  persistSetupWorkbookDraft();
  runtime.setupWorkbook.runtimeCommitResult = null;
  runtime.render();
}


function renderSetupWorkbookCommitPlan(): HTMLElement {
  const plan = runtime.setupWorkbook.commitPlan;
  if (!plan) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.commitPlan }, [
      el("div", { class: "card__body cell-muted" }, [runtime.t("workbook_no_preview")]),
    ]);
  }
  const notice = plan.commit_allowed
    ? el("div", { class: "success" }, [runtime.t("workbook_plan_ready")])
    : el("div", { class: "error" }, [runtime.t("workbook_plan_blocked")]);
  const rejected = plan.rejected_reasons?.length
    ? el("div", { class: "stack" }, plan.rejected_reasons.map((reason) => el("div", { class: "notice" }, [
        el("strong", {}, [String(reason.code ?? "blocked")]),
        el("p", {}, [String(reason.message ?? "")]),
      ])))
    : null;
  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.commitPlan }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("workbook_preview")]),
      notice,
      rejected,
      renderSummaryGrid(plan.summary ?? {}),
      renderSetupWorkbookOperations(plan.operations ?? []),
      plan.commit_allowed
        ? el("div", { class: "notice" }, [runtime.t("workbook_no_business_writes")])
        : null,
    ]),
  ]);
}

function renderSetupWorkbookAuditStageResult(): HTMLElement {
  const result = runtime.setupWorkbook.auditStageResult;
  if (!result) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.auditStageResult }, [
      el("div", { class: "card__body cell-muted" }, [runtime.t("workbook_no_preview")]),
    ]);
  }
  const success = result.audit_batch_created === true;
  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.auditStageResult }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("stage_workbook_audit")]),
      success
        ? el("div", { class: "success" }, [runtime.t("workbook_audit_stage_ready")])
        : el("div", { class: "error" }, [runtime.t("workbook_audit_stage_not_ready")]),
      renderSummaryGrid({
        audit_batch_created: result.audit_batch_created ?? null,
        audit_batch_id: result.audit_batch_id ?? null,
        audit_batch_status: result.audit_batch_status ?? null,
        operation_count: result.operation_count ?? null,
        commit_allowed: result.commit_allowed ?? null,
        business_writes_performed: result.business_writes_performed ?? null,
      }),
    ]),
  ]);
}

function renderSetupWorkbookRuntimeCommitResult(): HTMLElement {
  const result = runtime.setupWorkbook.runtimeCommitResult;
  if (!result) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.runtimeCommitResult }, [
      el("div", { class: "card__body cell-muted" }, [runtime.t("workbook_no_preview")]),
    ]);
  }
  const success = result.business_writes_performed === true && result.audit_batch_status === "committed";
  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.runtimeCommitResult }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("commit_workbook_runtime")]),
      success
        ? el("div", { class: "success" }, [runtime.t("workbook_runtime_commit_ready")])
        : el("div", { class: "error" }, [runtime.t("workbook_runtime_commit_not_ready")]),
      renderSummaryGrid({
        audit_batch_id: result.audit_batch_id ?? null,
        audit_batch_status: result.audit_batch_status ?? null,
        business_writes_performed: result.business_writes_performed ?? null,
        transactional: result.transactional ?? null,
        applied_operation_count: result.applied_operation_count ?? null,
        skipped_operation_count: result.skipped_operation_count ?? null,
        default_writers_used: result.default_writers_used ?? null,
      }),
    ]),
  ]);
}

function renderSetupWorkbookOperations(operations: SetupWorkbookCommitOperation[]): HTMLElement {
  if (operations.length === 0) {
    return el("section", { class: "stack" }, [el("h3", {}, [runtime.t("workbook_operations")]), el("div", { class: "empty" }, [runtime.t("no_records_returned")])]);
  }
  const table = el("table");
  table.append(el("thead", {}, [el("tr", {}, [
    el("th", {}, ["#"]),
    el("th", {}, ["Sheet"]),
    el("th", {}, ["Row"]),
    el("th", {}, ["Action"]),
    el("th", {}, ["Status"]),
    el("th", {}, ["Warnings"]),
  ])]));
  const body = el("tbody");
  for (const operation of operations) {
    body.append(el("tr", {}, [
      el("td", {}, [String(operation.sequence)]),
      el("td", {}, [operation.sheet || "—"]),
      el("td", {}, [operation.row_number === null || operation.row_number === undefined ? "—" : String(operation.row_number)]),
      el("td", {}, [operation.action || "—"]),
      el("td", {}, [operation.status || "—"]),
      el("td", {}, [(operation.warnings ?? []).map((warning) => warning.code).join(", ") || "—"]),
    ]));
  }
  table.append(body);
  return el("section", { class: "stack" }, [
    el("h3", {}, [runtime.t("workbook_operations")]),
    el("div", { class: "table-wrap" }, [table]),
  ]);
}

function renderSummaryGrid(summary: Record<string, JsonValue>): HTMLElement {
  const entries = Object.entries(summary);
  if (entries.length === 0) {
    return el("div", { class: "empty" }, ["—"]);
  }
  return el("div", { class: "summary-grid" }, entries.map(([key, value]) => el("div", { class: "summary-tile" }, [
    el("span", { class: "cell-muted" }, [key.replaceAll("_", " ")]),
    el("strong", {}, [formatSummaryValue(value)]),
  ])));
}

function formatSummaryValue(value: JsonValue): string {
  if (Array.isArray(value)) {
    return value.map(formatSummaryValue).join(", ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return value === null || value === undefined ? "—" : String(value);
}

function formatWorkbookCellInputValue(value: JsonValue | undefined): string {
  if (Array.isArray(value)) {
    return value.map(formatWorkbookCellInputValue).join("; ");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return value === null || value === undefined ? "" : String(value);
}

function setupWorkbookCellCorrectionKey(sheet: string, row: number, column: string): string {
  return `${sheet}:${row}:${column}`;
}

function setupWorkbookCellCorrections(): SetupWorkbookCellCorrection[] {
  return [...runtime.setupWorkbook.cellCorrections.values()].sort((left, right) => {
    const sheetOrder = left.sheet.localeCompare(right.sheet);
    if (sheetOrder !== 0) {
      return sheetOrder;
    }
    const rowOrder = left.row_number - right.row_number;
    if (rowOrder !== 0) {
      return rowOrder;
    }
    return left.column.localeCompare(right.column);
  });
}

function appendSetupWorkbookCellCorrections(formData: FormData): void {
  for (const correction of setupWorkbookCellCorrections()) {
    formData.append("corrected_values", JSON.stringify(correction));
  }
}

function setupWorkbookIssueRowKey(issue: SetupWorkbookIssue): string | null {
  if (!issue.sheet || !issue.row) {
    return null;
  }
  return setupWorkbookRowKey(issue.sheet, issue.row);
}

function setupWorkbookRowKey(sheet: string, row: number): string {
  return `${sheet}:${row}`;
}

function omittedSetupWorkbookRows(): Array<{ sheet: string; row_number: number }> {
  return [...runtime.setupWorkbook.omittedRows].map((key) => {
    const [sheet = "", rowNumber = "0"] = key.split(":");
    return { sheet, row_number: Number.parseInt(rowNumber, 10) || 0 };
  }).filter((row) => row.sheet && row.row_number > 0);
}

function setupWorkbookHasDraftRows(): boolean {
  return Boolean(runtime.setupWorkbook.dryRunResult?.sheets?.length);
}

function setupWorkbookDraftSheetsPayload(): SetupWorkbookDraftSheetPayload[] {
  const correctionByKey = new Map(setupWorkbookCellCorrections().map((correction) => [
    setupWorkbookCellCorrectionKey(correction.sheet, correction.row_number, correction.column),
    correction,
  ]));
  return (runtime.setupWorkbook.dryRunResult?.sheets ?? []).map((sheet) => ({
    sheet: sheet.sheet,
    rows: (sheet.rows ?? []).map((row) => {
      const values: Record<string, JsonValue> = { ...(row.values ?? {}) };
      for (const column of Object.keys(values)) {
        const correction = correctionByKey.get(setupWorkbookCellCorrectionKey(sheet.sheet, row.row_number, column));
        if (correction) {
          values[column] = correction.value;
        }
      }
      return { row_number: row.row_number, values };
    }),
  }));
}

function setupWorkbookDraftRequestBody(includeCommitInputs = false): string {
  const body: Record<string, JsonValue> = {
    existing_data_diff_mode: "upsert",
    sheets: setupWorkbookDraftSheetsPayload() as unknown as JsonValue,
  };
  const contextId = setupWorkbookContextId();
  if (contextId) {
    body[setupWorkbookContextFieldName()] = Number.parseInt(contextId, 10);
  }
  if (includeCommitInputs) {
    body.confirmed_warning_codes = [...runtime.setupWorkbook.confirmedWarningCodes].sort();
    body.omitted_rows = omittedSetupWorkbookRows() as unknown as JsonValue;
    body.reason = runtime.setupWorkbook.reason;
  }
  return JSON.stringify(body);
}

async function loadSetupWorkbookManifest(): Promise<void> {
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.render();
  try {
    runtime.setupWorkbook.manifest = await apiFetch<SetupWorkbookManifest>(withSurface(setupWorkbookEndpoint("manifest/")));
    await loadSetupWorkbookContextOptions();
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_manifest_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}


async function fetchSetupWorkbookContextOptions(manifest: SetupWorkbookManifest): Promise<SetupWorkbookContextOption[]> {
  const selector = manifest.context_selector;
  if (!selector?.resource_alias || !selector.value_field_alias || !selector.label_field_alias) {
    return [];
  }
  const schema = await apiFetch<ResourceSchema>(withSurface(resourceSchemaPath(selector.resource_alias)));
  const params: Record<string, string> = { page_size: "100" };
  if ((selector.filters?.items ?? []).length > 0) {
    params.filters = JSON.stringify(selector.filters);
  }
  const response = await apiFetch<PaginatedRecords>(resourceListPath(schema, params));
  return response.results
    .map((record) => setupWorkbookContextOptionFromRecord(record, selector.value_field_alias ?? "", selector.label_field_alias ?? ""))
    .filter((option): option is SetupWorkbookContextOption => option !== null);
}

async function loadSetupWorkbookContextOptions(): Promise<void> {
  const manifest = runtime.setupWorkbook.manifest;
  runtime.setupWorkbook.contextOptions = [];
  runtime.setupWorkbook.contextOptionsError = null;
  if (!manifest?.context_selector?.resource_alias) {
    return;
  }
  runtime.setupWorkbook.contextOptionsLoading = true;
  try {
    runtime.setupWorkbook.contextOptions = await fetchSetupWorkbookContextOptions(manifest);
  } catch (error) {
    runtime.setupWorkbook.contextOptions = [];
    runtime.setupWorkbook.contextOptionsError = publicErrorMessage(error, runtime.t("setup_workbook_context_options_failed"));
  } finally {
    runtime.setupWorkbook.contextOptionsLoading = false;
  }
}

function setupWorkbookContextOptionFromRecord(record: ResourceRecord, valueField: string, labelField: string): SetupWorkbookContextOption | null {
  const value = record[valueField];
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const labelValue = record[labelField];
  const label = typeof labelValue === "string" || typeof labelValue === "number" ? String(labelValue) : String(value);
  return { value: String(value), label };
}

function applySingleOptionContext(stage: SetupWorkbookStageSlug, options: SetupWorkbookContextOption[]): boolean {
  if (options.length !== 1) {
    return false;
  }
  const selectedValue = options[0]?.value ?? "";
  if (!selectedValue) {
    return false;
  }
  if (stage === "organization") {
    if (!runtime.setupWorkbook.organizationContextId) {
      runtime.setupWorkbook.organizationContextId = selectedValue;
      runtime.setupWorkbook.wizard.organizationAutoSelected = true;
      return true;
    }
    return false;
  }
  if (!runtime.setupWorkbook.institutionContextId) {
    runtime.setupWorkbook.institutionContextId = selectedValue;
    runtime.setupWorkbook.wizard.institutionAutoSelected = true;
    return true;
  }
  return false;
}

async function loadSetupWorkbookSingleInstitutionWizardContext(force = false): Promise<void> {
  const wizard = runtime.setupWorkbook.wizard;
  if (!force && wizard.discoveryStatus !== "idle") {
    return;
  }
  wizard.discoveryStatus = "loading";
  wizard.discoveryError = null;
  runtime.render();
  try {
    const organizationManifest = await apiFetch<SetupWorkbookManifest>(withSurface(setupWorkbookEndpointForStage("organization", "manifest/")));
    const institutionManifest = await apiFetch<SetupWorkbookManifest>(withSurface(setupWorkbookEndpointForStage("institution", "manifest/")));
    const [organizationOptions, institutionOptions] = await Promise.all([
      fetchSetupWorkbookContextOptions(organizationManifest),
      fetchSetupWorkbookContextOptions(institutionManifest),
    ]);
    const organizationWasApplied = applySingleOptionContext("organization", organizationOptions);
    const institutionWasApplied = applySingleOptionContext("institution", institutionOptions);
    wizard.organizationOptionCount = organizationOptions.length;
    wizard.institutionOptionCount = institutionOptions.length;
    wizard.enabled = organizationOptions.length === 1 && institutionOptions.length <= 1;
    wizard.discoveryStatus = wizard.enabled ? "ready" : "unavailable";
    if (organizationWasApplied || institutionWasApplied) {
      persistSetupWorkbookDraft();
    }
  } catch (error) {
    wizard.discoveryStatus = "error";
    wizard.discoveryError = publicErrorMessage(error, runtime.t("setup_workbook_wizard_discovery_failed"));
  } finally {
    runtime.render();
  }
}

function setupWorkbookWizardStageStatus(stage: SetupWorkbookStageSlug): string {
  const committedAt = stage === "organization"
    ? runtime.setupWorkbook.wizard.organizationCommittedAt
    : runtime.setupWorkbook.wizard.institutionCommittedAt;
  if (committedAt) {
    return runtime.t("setup_workbook_wizard_step_committed");
  }
  if (setupWorkbookStageSlug() === stage) {
    return runtime.t("setup_workbook_wizard_step_active");
  }
  return runtime.t("setup_workbook_wizard_step_pending");
}

function setupWorkbookWizardCountLabel(count: number | null): string {
  if (count === null) {
    return runtime.t("setup_workbook_wizard_count_unknown");
  }
  return `${count} ${runtime.t("setup_workbook_wizard_visible_options")}`;
}

function setupWorkbookWizardSelectedLabel(stage: SetupWorkbookStageSlug): string {
  const selectedValue = setupWorkbookContextIdForStage(stage);
  if (!selectedValue) {
    return runtime.t("setup_workbook_wizard_context_not_selected");
  }
  return `${runtime.t("setup_workbook_wizard_context_selected")} ${selectedValue}`;
}

function renderSetupWorkbookWizardStep(stage: SetupWorkbookStageSlug, title: string, description: string, count: number | null, committedAt: string | null, auditBatchId: string | number | null): HTMLElement {
  const openButton = el("button", {
    class: setupWorkbookStageSlug() === stage ? "button primary" : "button",
    type: "button",
    "data-testid": stage === "organization"
      ? BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.wizardOrganizationStep
      : BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.wizardInstitutionStep,
  }, [runtime.t(stage === "organization" ? "setup_workbook_wizard_open_stage_a" : "setup_workbook_wizard_open_stage_b")]);
  openButton.addEventListener("click", () => selectSetupWorkbookStage(stage));
  const details: Node[] = [
    el("span", { class: "badge" }, [setupWorkbookWizardStageStatus(stage)]),
    el("span", { class: "badge" }, [setupWorkbookWizardCountLabel(count)]),
    el("span", { class: "badge" }, [setupWorkbookWizardSelectedLabel(stage)]),
  ];
  if (committedAt) {
    details.push(el("span", { class: "badge" }, [`${runtime.t("setup_workbook_wizard_committed_at")} ${committedAt}`]));
  }
  if (auditBatchId !== null && auditBatchId !== undefined) {
    details.push(el("span", { class: "badge" }, [`${runtime.t("setup_workbook_wizard_audit_batch")} ${auditBatchId}`]));
  }
  return el("div", { class: "setup-workbook__wizard-step" }, [
    el("div", {}, [
      el("strong", {}, [title]),
      el("p", { class: "cell-muted" }, [description]),
      el("div", { class: "meta-line" }, details),
    ]),
    openButton,
  ]);
}

function renderSetupWorkbookSingleInstitutionWizard(): HTMLElement {
  const wizard = runtime.setupWorkbook.wizard;
  if (wizard.discoveryStatus === "idle") {
    void loadSetupWorkbookSingleInstitutionWizardContext();
  }
  const refreshButton = el("button", { class: "button", type: "button", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.wizardRefresh }, [runtime.t("setup_workbook_wizard_refresh")]);
  refreshButton.addEventListener("click", () => {
    void loadSetupWorkbookSingleInstitutionWizardContext(true);
  });
  const notices: Node[] = [];
  if (wizard.discoveryStatus === "loading") {
    notices.push(el("p", { class: "cell-muted" }, [runtime.t("setup_workbook_wizard_loading")]));
  }
  if (wizard.discoveryStatus === "error" && wizard.discoveryError) {
    notices.push(el("div", { class: "error" }, [wizard.discoveryError]));
  }
  if (wizard.discoveryStatus === "unavailable") {
    notices.push(el("div", { class: "notice" }, [runtime.t("setup_workbook_wizard_unavailable")]));
  }
  if (wizard.organizationCommittedAt && !wizard.institutionCommittedAt) {
    notices.push(el("div", { class: "notice" }, [runtime.t("setup_workbook_wizard_stage_a_committed_stage_b_pending")]));
  }
  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.wizard }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("div", {}, [
          el("h3", {}, [runtime.t("setup_workbook_wizard_title")]),
          el("p", { class: "cell-muted" }, [runtime.t("setup_workbook_wizard_help")]),
        ]),
        refreshButton,
      ]),
      ...notices,
      renderSetupWorkbookWizardStep(
        "organization",
        runtime.t("setup_workbook_wizard_stage_a_title"),
        runtime.t("setup_workbook_wizard_stage_a_help"),
        wizard.organizationOptionCount,
        wizard.organizationCommittedAt,
        wizard.organizationAuditBatchId,
      ),
      renderSetupWorkbookWizardStep(
        "institution",
        runtime.t("setup_workbook_wizard_stage_b_title"),
        runtime.t("setup_workbook_wizard_stage_b_help"),
        wizard.institutionOptionCount,
        wizard.institutionCommittedAt,
        wizard.institutionAuditBatchId,
      ),
    ]),
  ]);
}

function recordSetupWorkbookRuntimeCommitResult(result: SetupWorkbookRuntimeCommitResult): void {
  if (result.business_writes_performed !== true) {
    return;
  }
  const stage = setupWorkbookStageSlug();
  const committedAt = new Date().toISOString();
  if (stage === "organization") {
    runtime.setupWorkbook.wizard.organizationCommittedAt = committedAt;
    runtime.setupWorkbook.wizard.organizationAuditBatchId = result.audit_batch_id ?? null;
    runtime.setupWorkbook.wizard.discoveryStatus = "idle";
  } else {
    runtime.setupWorkbook.wizard.institutionCommittedAt = committedAt;
    runtime.setupWorkbook.wizard.institutionAuditBatchId = result.audit_batch_id ?? null;
  }
  persistSetupWorkbookDraft();
}

async function downloadSetupWorkbookTemplate(): Promise<void> {
  try {
    const blob = await apiFetchBlob(withSurface(setupWorkbookEndpoint("template/")));
    const url = URL.createObjectURL(blob);
    const link = el("a", { href: url, download: setupWorkbookTemplateFilename() });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_template_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
    runtime.render();
  }
}

async function loadSetupWorkbookDraft(): Promise<void> {
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.render();
  try {
    runtime.setupWorkbook.dryRunResult = await apiFetch<SetupWorkbookDryRunResult>(withSurface(setupWorkbookEndpointWithContext("draft/")));
    runtime.setupWorkbook.selectedFile = null;
    runtime.setupWorkbook.commitPlan = null;
    runtime.setupWorkbook.auditStageResult = null;
    runtime.setupWorkbook.runtimeCommitResult = null;
    runtime.setupWorkbook.omittedRows.clear();
    runtime.setupWorkbook.confirmedWarningCodes.clear();
    runtime.setupWorkbook.cellCorrections.clear();
    persistSetupWorkbookDraft();
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_draft_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}

async function runSetupWorkbookDryRun(): Promise<void> {
  if (!runtime.setupWorkbook.selectedFile && !setupWorkbookHasDraftRows()) {
    runtime.setupWorkbook.error = runtime.t("workbook_select_file");
    runtime.render();
    return;
  }
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.setupWorkbook.commitPlan = null;
  runtime.setupWorkbook.auditStageResult = null;
  runtime.setupWorkbook.runtimeCommitResult = null;
  runtime.render();
  try {
    if (setupWorkbookHasDraftRows()) {
      runtime.setupWorkbook.dryRunResult = await apiFetch<SetupWorkbookDryRunResult>(withSurface(setupWorkbookEndpoint("draft/dry-run/")), {
        method: "POST",
        body: setupWorkbookDraftRequestBody(false),
      });
    } else {
      const formData = new FormData();
      appendSetupWorkbookContext(formData);
      formData.append("file", runtime.setupWorkbook.selectedFile as File);
      appendSetupWorkbookCellCorrections(formData);
      runtime.setupWorkbook.dryRunResult = await apiFetch<SetupWorkbookDryRunResult>(withSurface(setupWorkbookEndpoint("dry-run/")), {
        method: "POST",
        body: formData,
      });
    }
    runtime.setupWorkbook.omittedRows.clear();
    runtime.setupWorkbook.confirmedWarningCodes.clear();
    persistSetupWorkbookDraft();
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_dry_run_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}

function appendSetupWorkbookContext(formData: FormData): void {
  const contextId = setupWorkbookContextId();
  if (contextId) {
    formData.append(setupWorkbookContextFieldName(), contextId);
  }
}

function appendSetupWorkbookCommitInputs(formData: FormData): void {
  appendSetupWorkbookContext(formData);
  appendSetupWorkbookCellCorrections(formData);
  for (const code of [...runtime.setupWorkbook.confirmedWarningCodes].sort()) {
    formData.append("confirmed_warning_codes", code);
  }
  for (const row of omittedSetupWorkbookRows()) {
    formData.append("omitted_rows", JSON.stringify(row));
  }
  formData.append("reason", runtime.setupWorkbook.reason);
}

async function buildSetupWorkbookCommitPlan(): Promise<void> {
  if (!setupWorkbookHasDraftRows()) {
    runtime.setupWorkbook.error = runtime.t("workbook_select_file");
    runtime.render();
    return;
  }
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.setupWorkbook.auditStageResult = null;
  runtime.setupWorkbook.runtimeCommitResult = null;
  runtime.render();
  try {
    runtime.setupWorkbook.commitPlan = await apiFetch<SetupWorkbookCommitPlan>(withSurface(setupWorkbookEndpoint("draft/commit-plan/")), {
      method: "POST",
      body: setupWorkbookDraftRequestBody(true),
    });
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_commit_plan_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}



async function stageSetupWorkbookAuditBatch(): Promise<void> {
  if (!setupWorkbookHasDraftRows()) {
    runtime.setupWorkbook.error = runtime.t("workbook_select_file");
    runtime.render();
    return;
  }
  if (!runtime.setupWorkbook.commitPlan?.commit_allowed) {
    runtime.setupWorkbook.error = runtime.t("workbook_plan_blocked");
    runtime.render();
    return;
  }
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.render();
  try {
    runtime.setupWorkbook.auditStageResult = await apiFetch<SetupWorkbookAuditStageResult>(withSurface(setupWorkbookEndpoint("draft/commit-audit-stage/")), {
      method: "POST",
      body: setupWorkbookDraftRequestBody(true),
    });
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_audit_stage_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}

async function commitSetupWorkbookRuntime(): Promise<void> {
  if (!setupWorkbookHasDraftRows()) {
    runtime.setupWorkbook.error = runtime.t("workbook_select_file");
    runtime.render();
    return;
  }
  if (!runtime.setupWorkbook.commitPlan?.commit_allowed) {
    runtime.setupWorkbook.error = runtime.t("workbook_plan_blocked");
    runtime.render();
    return;
  }
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.render();
  try {
    runtime.setupWorkbook.runtimeCommitResult = await apiFetch<SetupWorkbookRuntimeCommitResult>(withSurface(setupWorkbookEndpoint("draft/runtime-commit/")), {
      method: "POST",
      body: setupWorkbookDraftRequestBody(true),
    });
    recordSetupWorkbookRuntimeCommitResult(runtime.setupWorkbook.runtimeCommitResult);
    runtime.setupWorkbook.selectedFile = null;
    runtime.setupWorkbook.omittedRows.clear();
    runtime.setupWorkbook.confirmedWarningCodes.clear();
    runtime.setupWorkbook.cellCorrections.clear();
    persistSetupWorkbookDraft();
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_runtime_commit_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}
