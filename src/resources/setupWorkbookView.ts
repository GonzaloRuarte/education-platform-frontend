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
} from "../core/types.js";
import { el } from "../core/dom.js";
import { apiFetch, apiFetchBlob, publicErrorMessage, withSurface } from "../api/api.js";
import { BUSINESS_WORKFLOW_TEST_IDS } from "../core/testIds.js";

export interface SetupWorkbookViewRuntime {
  setupWorkbook: SetupWorkbookState;
  t: (key: string) => string;
  render: () => void;
  notify: (tone: Toast["tone"], message: string) => void;
}

let runtime: SetupWorkbookViewRuntime;

function fieldShell(label: string, input: HTMLElement, helpText?: string): HTMLElement {
  return el("div", { class: "field" }, [
    el("label", {}, [label]),
    input,
    helpText ? el("p", { class: "field__help" }, [helpText]) : null,
  ]);
}

function renderSetupWorkbookLoading(message: string): HTMLElement {
  return el("section", { class: "card" }, [
    el("div", { class: "card__body" }, [message]),
  ]);
}

export function renderSetupWorkbookPage(nextRuntime: SetupWorkbookViewRuntime): HTMLElement {
  runtime = nextRuntime;
  if (!runtime.setupWorkbook.manifest && !runtime.setupWorkbook.loading) {
    void loadSetupWorkbookManifest();
  }
  const templateButton = el("button", { class: "button", type: "button", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.templateButton }, [runtime.t("download_template")]);
  templateButton.addEventListener("click", () => {
    void downloadSetupWorkbookTemplate();
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
    runtime.setupWorkbook.error = null;
    runtime.render();
  });

  const dryRunButton = el("button", {
    class: "button primary",
    type: "button",
    disabled: runtime.setupWorkbook.selectedFile && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.dryRunButton,
  }, [runtime.t("run_dry_run")]);
  dryRunButton.addEventListener("click", () => {
    void runSetupWorkbookDryRun();
  });

  const previewButton = el("button", {
    class: "button",
    type: "button",
    disabled: runtime.setupWorkbook.selectedFile && runtime.setupWorkbook.dryRunResult && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.previewButton,
  }, [runtime.t("build_preview")]);
  previewButton.addEventListener("click", () => {
    void buildSetupWorkbookCommitPlan();
  });

  const auditStageButton = el("button", {
    class: "button primary",
    type: "button",
    disabled: runtime.setupWorkbook.selectedFile && runtime.setupWorkbook.commitPlan?.commit_allowed && !runtime.setupWorkbook.loading ? null : true,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.auditStageButton,
  }, [runtime.t("stage_workbook_audit")]);
  auditStageButton.addEventListener("click", () => {
    void stageSetupWorkbookAuditBatch();
  });

  const runtimeCommitButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: runtime.setupWorkbook.selectedFile && runtime.setupWorkbook.commitPlan?.commit_allowed && !runtime.setupWorkbook.loading ? null : true,
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
      el("div", { class: "toolbar" }, [templateButton]),
    ]),
    ...notices,
    el("section", { class: "card" }, [
      el("div", { class: "card__body stack" }, [
        el("div", { class: "toolbar" }, [fileInput, dryRunButton, previewButton, auditStageButton, runtimeCommitButton]),
        fieldShell(runtime.t("workbook_reason"), reasonInput),
        runtime.setupWorkbook.selectedFile
          ? el("p", { class: "meta-line" }, [runtime.setupWorkbook.selectedFile.name])
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

async function loadSetupWorkbookManifest(): Promise<void> {
  runtime.setupWorkbook.loading = true;
  runtime.setupWorkbook.error = null;
  runtime.render();
  try {
    runtime.setupWorkbook.manifest = await apiFetch<SetupWorkbookManifest>(withSurface("/api/setup-workbook/manifest/"));
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_manifest_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}


async function downloadSetupWorkbookTemplate(): Promise<void> {
  try {
    const blob = await apiFetchBlob(withSurface("/api/setup-workbook/template/"));
    const url = URL.createObjectURL(blob);
    const link = el("a", { href: url, download: "db-admin-yearly-setup-template.xlsx" });
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

async function runSetupWorkbookDryRun(): Promise<void> {
  if (!runtime.setupWorkbook.selectedFile) {
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
    const formData = new FormData();
    formData.append("file", runtime.setupWorkbook.selectedFile);
    appendSetupWorkbookCellCorrections(formData);
    runtime.setupWorkbook.dryRunResult = await apiFetch<SetupWorkbookDryRunResult>(withSurface("/api/setup-workbook/dry-run/"), {
      method: "POST",
      body: formData,
    });
    runtime.setupWorkbook.omittedRows.clear();
    runtime.setupWorkbook.confirmedWarningCodes.clear();
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_dry_run_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}

function appendSetupWorkbookCommitInputs(formData: FormData): void {
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
  if (!runtime.setupWorkbook.selectedFile) {
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
    const formData = new FormData();
    formData.append("file", runtime.setupWorkbook.selectedFile);
    appendSetupWorkbookCommitInputs(formData);
    runtime.setupWorkbook.commitPlan = await apiFetch<SetupWorkbookCommitPlan>(withSurface("/api/setup-workbook/commit-plan/"), {
      method: "POST",
      body: formData,
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
  if (!runtime.setupWorkbook.selectedFile) {
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
    const formData = new FormData();
    formData.append("file", runtime.setupWorkbook.selectedFile);
    appendSetupWorkbookCommitInputs(formData);
    runtime.setupWorkbook.auditStageResult = await apiFetch<SetupWorkbookAuditStageResult>(withSurface("/api/setup-workbook/commit-audit-stage/"), {
      method: "POST",
      body: formData,
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
  if (!runtime.setupWorkbook.selectedFile) {
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
    const formData = new FormData();
    formData.append("file", runtime.setupWorkbook.selectedFile);
    appendSetupWorkbookCommitInputs(formData);
    runtime.setupWorkbook.runtimeCommitResult = await apiFetch<SetupWorkbookRuntimeCommitResult>(withSurface("/api/setup-workbook/commit/"), {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    runtime.setupWorkbook.error = publicErrorMessage(error, runtime.t("workbook_runtime_commit_failed"));
    runtime.notify("error", runtime.setupWorkbook.error);
  } finally {
    runtime.setupWorkbook.loading = false;
    runtime.render();
  }
}
