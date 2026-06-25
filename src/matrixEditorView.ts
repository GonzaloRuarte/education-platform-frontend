import type {
  MatrixEditorDomain,
  MatrixEditorUniverseResource,
  MatrixEditorColumnGrantAction,
  MatrixEditorColumnGrantResource,
  MatrixEditorRowScopeType,
  MatrixEditorUniverse,
  MatrixEditorIssue,
  MatrixEditorValidationResponse,
  MatrixEditorPreviewResponse,
  MatrixEditorApplyResponse,
  MatrixEditorResourceProposal,
  MatrixEditorRowScopeValueProposal,
  MatrixEditorColumnGrantProposal,
  MatrixEditorPayload,
  MatrixEditorProposalBody,
  MatrixEditorState,
  JsonValue,
  Toast,
} from "./types";
import { el } from "./dom";
import { apiFetch, publicErrorMessage, withSurface } from "./api";
import { emptyMatrixEditorResourceDraft } from "./initialState";
import { coerceScalar, safeJson } from "./fieldFormatting";
import { BUSINESS_WORKFLOW_TEST_IDS } from "./testIds";

export interface MatrixEditorViewRuntime {
  matrixEditor: MatrixEditorState;
  t: (key: string) => string;
  render: () => void;
  notify: (tone: Toast["tone"], message: string) => void;
}

let runtime: MatrixEditorViewRuntime;

function fieldShell(label: string, input: HTMLElement, helpText?: string): HTMLElement {
  return el("div", { class: "field" }, [
    el("label", {}, [label]),
    input,
    helpText ? el("p", { class: "field__help" }, [helpText]) : null,
  ]);
}

function renderSummaryGrid(summary: Record<string, JsonValue>): HTMLElement {
  const tiles = Object.entries(summary).map(([key, value]) => el("div", { class: "summary-tile" }, [
    el("span", { class: "cell-muted" }, [key.replaceAll("_", " ")]),
    el("strong", {}, [formatSummaryValue(value)]),
  ]));
  return el("div", { class: "summary-grid" }, tiles);
}

function formatSummaryValue(value: JsonValue): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return String(value.length);
  if (typeof value === "object") return Object.keys(value).length ? JSON.stringify(value) : "0";
  return String(value);
}

export function renderMatrixEditorPage(nextRuntime: MatrixEditorViewRuntime): HTMLElement {
  runtime = nextRuntime;
  if (!currentMatrixEditorUniverse() && !runtime.matrixEditor.loading) {
    void loadMatrixEditorUniverse();
  }

  const domainSelect = el("select", { class: "select", "aria-label": runtime.t("matrix_domain"), "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.domainSelect });
  for (const domain of ["organization", "institution"] as MatrixEditorDomain[]) {
    const option = el("option", { value: domain, selected: runtime.matrixEditor.domain === domain ? true : null }, [
      domain === "organization" ? runtime.t("organization_domain") : runtime.t("institution_domain"),
    ]);
    domainSelect.append(option);
  }
  domainSelect.addEventListener("change", () => {
    const nextDomain = domainSelect.value === "institution" ? "institution" : "organization";
    if (runtime.matrixEditor.domain === nextDomain) {
      return;
    }
    runtime.matrixEditor.domain = nextDomain;
    runtime.matrixEditor.resourceDraft = emptyMatrixEditorResourceDraft();
    runtime.matrixEditor.resourceProposals = [];
    runtime.matrixEditor.apiEntrypoints = [];
    runtime.matrixEditor.apiEntrypointDraft = "";
    runtime.matrixEditor.rowScopeValues.clear();
    runtime.matrixEditor.columnGrantSelections.clear();
    runtime.matrixEditor.validation = null;
    runtime.matrixEditor.preview = null;
    runtime.matrixEditor.applyResult = null;
    runtime.matrixEditor.confirmDangerous = false;
    runtime.matrixEditor.error = null;
    runtime.render();
    void loadMatrixEditorUniverse();
  });

  const reloadButton = el("button", { class: "button", type: "button", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.loadUniverseButton }, [runtime.t("load_universe")]);
  reloadButton.addEventListener("click", () => {
    void loadMatrixEditorUniverse();
  });

  const validateButton = el("button", { class: "button", type: "button", disabled: runtime.matrixEditor.loading ? true : null, "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.validateButton }, [runtime.t("matrix_validate")]);
  validateButton.addEventListener("click", () => {
    void validateMatrixEditorProposal();
  });
  const previewButton = el("button", { class: "button", type: "button", disabled: runtime.matrixEditor.loading ? true : null, "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.previewButton }, [runtime.t("matrix_preview")]);
  previewButton.addEventListener("click", () => {
    void previewMatrixEditorProposal();
  });
  const applyButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: !runtime.matrixEditor.confirmDangerous || runtime.matrixEditor.loading ? true : null,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.applyButton,
  }, [runtime.t("matrix_apply")]);
  applyButton.addEventListener("click", () => {
    void applyMatrixEditorProposal();
  });

  const notices: HTMLElement[] = [];
  if (runtime.matrixEditor.error) {
    notices.push(el("div", { class: "error" }, [runtime.matrixEditor.error]));
  }
  if (runtime.matrixEditor.loading) {
    notices.push(el("div", { class: "notice" }, [runtime.t("loading_resource")]));
  }

  return el("section", { class: "stack matrix-editor", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.page }, [
    el("div", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [runtime.t("matrix_editor_title")]),
        el("p", { class: "page-subtitle" }, [runtime.t("matrix_editor_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [domainSelect, reloadButton, validateButton, previewButton, applyButton]),
    ]),
    ...notices,
    renderMatrixEditorUniverseCard(),
    renderMatrixEditorResourceProposalCard(),
    renderMatrixEditorApiEntrypointCard(),
    renderMatrixEditorColumnGrantCard(),
    renderMatrixEditorRowScopeCard(),
    renderMatrixEditorAuditCard(),
    renderMatrixEditorResultCards(),
  ]);
}

function currentMatrixEditorUniverse(): MatrixEditorUniverse | null {
  return runtime.matrixEditor.universeByDomain[runtime.matrixEditor.domain] ?? null;
}

function renderMatrixEditorUniverseCard(): HTMLElement {
  const universe = currentMatrixEditorUniverse();
  if (!universe) {
    return el("section", { class: "card" }, [
      el("div", { class: "card__body stack" }, [
        el("h3", {}, [runtime.t("matrix_universe")]),
        el("p", { class: "cell-muted" }, [runtime.t("loading_resource")]),
      ]),
    ]);
  }
  const resourceTiles = (universe.resources ?? []).map((resource) => {
    const actions = matrixEditorAvailableResourceActions(resource).join(", ") || "—";
    return el("div", { class: "summary-tile" }, [
      el("strong", {}, [matrixEditorResourceLabel(resource.resource_key)]),
      el("span", { class: "cell-muted" }, [actions]),
    ]);
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [runtime.t("matrix_universe")]),
        el("span", { class: "badge" }, [universe.domain]),
        universe.role_mutation_status ? el("span", { class: "badge" }, [universe.role_mutation_status]) : null,
      ]),
      el("div", { class: "summary-grid" }, resourceTiles.length ? resourceTiles : [el("div", { class: "empty" }, [runtime.t("no_resources_match")])]),
      el("p", { class: "notice" }, [runtime.t("matrix_warning_audit")]),
    ]),
  ]);
}

function renderMatrixEditorResourceProposalCard(): HTMLElement {
  const universe = currentMatrixEditorUniverse();
  const resources = universe?.resources ?? [];
  const draft = runtime.matrixEditor.resourceDraft;
  if (!draft.resource_key && resources[0]) {
    draft.resource_key = resources[0].resource_key;
  }
  const selectedResource = resources.find((resource) => resource.resource_key === draft.resource_key) ?? resources[0] ?? null;
  const actions = selectedResource ? matrixEditorAvailableResourceActions(selectedResource) : ["create", "update"] as Array<"create" | "update">;
  if (!actions.includes(draft.action)) {
    draft.action = actions[0] ?? "create";
  }

  const resourceSelect = el("select", { class: "select" });
  for (const resource of resources) {
    resourceSelect.append(el("option", { value: resource.resource_key, selected: draft.resource_key === resource.resource_key ? true : null }, [matrixEditorResourceLabel(resource.resource_key)]));
  }
  resourceSelect.addEventListener("change", () => {
    runtime.matrixEditor.resourceDraft.resource_key = resourceSelect.value;
    runtime.matrixEditor.resourceDraft.error = null;
    runtime.render();
  });

  const actionSelect = el("select", { class: "select" });
  for (const action of actions) {
    actionSelect.append(el("option", { value: action, selected: draft.action === action ? true : null }, [action]));
  }
  actionSelect.addEventListener("change", () => {
    runtime.matrixEditor.resourceDraft.action = actionSelect.value === "update" ? "update" : "create";
    runtime.matrixEditor.resourceDraft.error = null;
    runtime.render();
  });

  const identityInput = el("input", { class: "input", value: draft.record_identity, placeholder: runtime.t("matrix_record_identity") });
  identityInput.addEventListener("input", () => {
    runtime.matrixEditor.resourceDraft.record_identity = identityInput.value;
  });
  const afterInput = el("textarea", { class: "textarea", spellcheck: "false" }, [draft.after_json]);
  afterInput.addEventListener("input", () => {
    runtime.matrixEditor.resourceDraft.after_json = afterInput.value;
    runtime.matrixEditor.resourceDraft.error = null;
  });
  const addButton = el("button", { class: "button", type: "button", disabled: resources.length ? null : true }, [runtime.t("matrix_add_operation")]);
  addButton.addEventListener("click", () => addMatrixEditorResourceProposal());

  const proposalRows = runtime.matrixEditor.resourceProposals.map((proposal, index) => {
    const removeButton = el("button", { class: "button flat", type: "button" }, ["×"]);
    removeButton.addEventListener("click", () => {
      runtime.matrixEditor.resourceProposals.splice(index, 1);
      clearMatrixEditorResults();
      runtime.render();
    });
    return el("tr", {}, [
      el("td", {}, [matrixEditorResourceLabel(proposal.resource_key)]),
      el("td", {}, [proposal.action]),
      el("td", {}, [proposal.record_identity || "—"]),
      el("td", { class: "cell-json" }, [safeJson(proposal.after)]),
      el("td", {}, [removeButton]),
    ]);
  });

  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("matrix_resource_operations")]),
      el("div", { class: "form-grid" }, [
        fieldShell(runtime.t("matrix_resource"), resourceSelect),
        fieldShell(runtime.t("matrix_action"), actionSelect),
        fieldShell(runtime.t("matrix_record_identity"), identityInput),
        el("div", { class: "field field--full" }, [
          el("label", {}, [runtime.t("matrix_after_json")]),
          afterInput,
          draft.error ? el("small", { class: "error" }, [draft.error]) : null,
        ]),
      ]),
      addButton,
      runtime.matrixEditor.resourceProposals.length
        ? el("div", { class: "table-wrap" }, [el("table", {}, [
            el("thead", {}, [el("tr", {}, [
              el("th", {}, [runtime.t("matrix_resource")]),
              el("th", {}, [runtime.t("matrix_action")]),
              el("th", {}, [runtime.t("matrix_record_identity")]),
              el("th", {}, [runtime.t("matrix_after_json")]),
              el("th", {}, [""]),
            ])]),
            el("tbody", {}, proposalRows),
          ])])
        : el("div", { class: "empty" }, [runtime.t("matrix_no_operations")]),
    ]),
  ]);
}

function renderMatrixEditorApiEntrypointCard(): HTMLElement {
  const input = el("input", { class: "input", value: runtime.matrixEditor.apiEntrypointDraft, placeholder: runtime.t("matrix_api_placeholder") });
  input.addEventListener("input", () => {
    runtime.matrixEditor.apiEntrypointDraft = input.value;
  });
  const addButton = el("button", { class: "button", type: "button" }, [runtime.t("matrix_add_api")]);
  addButton.addEventListener("click", () => addMatrixEditorApiEntrypoint());
  const chips = runtime.matrixEditor.apiEntrypoints.map((apiName, index) => {
    const remove = el("button", { class: "button flat", type: "button" }, ["×"]);
    remove.addEventListener("click", () => {
      runtime.matrixEditor.apiEntrypoints.splice(index, 1);
      clearMatrixEditorResults();
      runtime.render();
    });
    return el("span", { class: "filter-chip" }, [apiName, remove]);
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("matrix_api_entrypoints")]),
      el("p", { class: "cell-muted" }, [runtime.t("matrix_api_entrypoints_help")]),
      el("div", { class: "toolbar" }, [input, addButton]),
      el("div", { class: "filter-list" }, chips.length ? chips : [el("span", { class: "badge" }, ["—"])]),
    ]),
  ]);
}

function renderMatrixEditorColumnGrantCard(): HTMLElement {
  const universe = currentMatrixEditorUniverse();
  const resources = universe?.column_grant_universe ?? [];
  const resourceSections = resources.flatMap((resource) => {
    const actions = resource.actions ?? [];
    return actions.map((action) => renderMatrixEditorColumnGrantAction(resource, action));
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("matrix_column_grants")]),
      el("p", { class: "cell-muted" }, [runtime.t("matrix_column_grants_help")]),
      resourceSections.length ? el("div", { class: "stack" }, resourceSections) : el("div", { class: "empty" }, [runtime.t("matrix_no_column_grants")]),
    ]),
  ]);
}

function renderMatrixEditorColumnGrantAction(resource: MatrixEditorColumnGrantResource, action: MatrixEditorColumnGrantAction): HTMLElement {
  const selectionKey = matrixEditorColumnGrantSelectionKey(resource.resource_key, action.action);
  const selected = runtime.matrixEditor.columnGrantSelections.get(selectionKey) ?? new Set<string>();
  const checkboxes = (action.columns ?? []).map((column) => {
    const checkbox = el("input", {
      type: "checkbox",
      checked: selected.has(column.key) ? true : null,
      value: column.key,
    });
    checkbox.addEventListener("change", () => {
      const nextSelected = new Set(runtime.matrixEditor.columnGrantSelections.get(selectionKey) ?? []);
      if (checkbox.checked) {
        nextSelected.add(column.key);
      } else {
        nextSelected.delete(column.key);
      }
      if (nextSelected.size) {
        runtime.matrixEditor.columnGrantSelections.set(selectionKey, nextSelected);
      } else {
        runtime.matrixEditor.columnGrantSelections.delete(selectionKey);
      }
      clearMatrixEditorResults();
      runtime.render();
    });
    const label = column.label || column.alias || column.key;
    return el("label", { class: "checkbox-row" }, [checkbox, `${label} (${column.key})`]);
  });
  return el("div", { class: "panel" }, [
    el("div", { class: "toolbar" }, [
      el("strong", {}, [resource.label || resource.alias || resource.resource_key]),
      el("span", { class: "badge" }, [action.action]),
      action.row_scope_type ? el("span", { class: "badge" }, [`${runtime.t("matrix_row_scope_type")}: ${action.row_scope_type}`]) : null,
    ]),
    el("div", { class: "form-grid" }, checkboxes),
  ]);
}

function matrixEditorColumnGrantSelectionKey(resourceKey: string, action: string): string {
  return `${resourceKey}::${action}`;
}

function renderMatrixEditorRowScopeCard(): HTMLElement {
  const universe = currentMatrixEditorUniverse();
  const scopeTypes = universe?.row_scope_types ?? [];
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("matrix_row_scopes")]),
      el("p", { class: "cell-muted" }, [runtime.t("matrix_row_scopes_help")]),
      scopeTypes.length
        ? el("div", { class: "form-grid" }, scopeTypes.map((scopeType) => renderMatrixEditorRowScopeInput(scopeType)))
        : el("div", { class: "empty" }, [runtime.t("no_resources_match")]),
    ]),
  ]);
}

function renderMatrixEditorRowScopeInput(scopeType: MatrixEditorRowScopeType): HTMLElement {
  const input = el("input", {
    class: "input",
    value: runtime.matrixEditor.rowScopeValues.get(scopeType.key) ?? "",
    placeholder: runtime.t("matrix_scope_value_placeholder"),
  });
  input.addEventListener("input", () => {
    runtime.matrixEditor.rowScopeValues.set(scopeType.key, input.value);
    clearMatrixEditorResults();
  });
  const label = String(scopeType.label || scopeType.key || runtime.t("matrix_row_scopes"));
  return el("div", { class: "field field--third" }, [
    el("label", {}, [label]),
    input,
    scopeType.description ? el("small", {}, [String(scopeType.description)]) : null,
  ]);
}

function renderMatrixEditorAuditCard(): HTMLElement {
  const reasonInput = el("textarea", { class: "textarea", placeholder: runtime.t("matrix_reason") }, [runtime.matrixEditor.reason]);
  reasonInput.addEventListener("input", () => {
    runtime.matrixEditor.reason = reasonInput.value;
  });
  const confirmInput = el("input", { type: "checkbox", checked: runtime.matrixEditor.confirmDangerous ? true : null });
  confirmInput.addEventListener("change", () => {
    runtime.matrixEditor.confirmDangerous = confirmInput.checked;
    runtime.render();
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      fieldShell(runtime.t("matrix_reason"), reasonInput),
      el("label", { class: "checkbox-row" }, [confirmInput, runtime.t("matrix_confirm_apply")]),
    ]),
  ]);
}

function renderMatrixEditorResultCards(): HTMLElement {
  return el("div", { class: "stack" }, [
    runtime.matrixEditor.validation ? renderMatrixEditorValidationCard(runtime.matrixEditor.validation) : null,
    runtime.matrixEditor.preview ? renderMatrixEditorPreviewCard(runtime.matrixEditor.preview) : null,
    runtime.matrixEditor.applyResult ? renderMatrixEditorApplyResultCard(runtime.matrixEditor.applyResult) : null,
  ]);
}

function renderMatrixEditorValidationCard(validation: MatrixEditorValidationResponse): HTMLElement {
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [runtime.t("matrix_validation")]),
        el("span", { class: validation.valid ? "badge badge--success" : "badge badge--danger" }, [validation.valid ? runtime.t("matrix_valid") : runtime.t("matrix_invalid")]),
      ]),
      renderMatrixEditorIssues(validation.errors ?? [], "error"),
      renderMatrixEditorIssues(validation.warnings ?? [], "notice"),
    ]),
  ]);
}

function renderMatrixEditorPreviewCard(preview: MatrixEditorPreviewResponse): HTMLElement {
  const validation = preview.validation;
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [runtime.t("matrix_preview_result")]),
        el("span", { class: preview.valid ? "badge badge--success" : "badge badge--danger" }, [preview.valid ? runtime.t("matrix_valid") : runtime.t("matrix_invalid")]),
      ]),
      validation ? renderMatrixEditorIssues(validation.errors ?? [], "error") : null,
      validation ? renderMatrixEditorIssues(validation.warnings ?? [], "notice") : null,
      preview.column_grant_preview !== undefined ? el("pre", { class: "cell-json" }, [safeJson(preview.column_grant_preview)]) : null,
      preview.row_scope_value_preview !== undefined ? el("pre", { class: "cell-json" }, [safeJson(preview.row_scope_value_preview)]) : null,
    ]),
  ]);
}

function renderMatrixEditorApplyResultCard(result: MatrixEditorApplyResponse): HTMLElement {
  const summary = {
    committed: result.committed === true,
    applied_count: result.applied_count ?? 0,
    deferred_count: result.deferred_count ?? 0,
    batch_id: result.batch_id ?? "—",
  } satisfies Record<string, JsonValue>;
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("matrix_apply_result")]),
      renderSummaryGrid(summary),
    ]),
  ]);
}

function renderMatrixEditorIssues(issues: MatrixEditorIssue[], toneClass: "error" | "notice"): HTMLElement {
  if (issues.length === 0) {
    return el("div", { class: "empty" }, [runtime.t("workbook_no_issues")]);
  }
  return el("div", { class: "stack" }, issues.map((issue) => el("div", { class: toneClass }, [
    issue.path ? el("strong", {}, [issue.path]) : null,
    issue.path ? " — " : null,
    issue.message,
  ])));
}

function matrixEditorAvailableResourceActions(resource: MatrixEditorUniverseResource): Array<"create" | "update"> {
  const actions: Array<"create" | "update"> = [];
  if (resource.actions?.create !== false) {
    actions.push("create");
  }
  if (resource.actions?.update !== false) {
    actions.push("update");
  }
  return actions.length ? actions : ["create", "update"];
}

function matrixEditorResourceLabel(resourceKey: string): string {
  const resource = currentMatrixEditorUniverse()?.resources?.find((candidate) => candidate.resource_key === resourceKey);
  return resource?.label || resource?.alias || runtime.t("matrix_resource");
}

function addMatrixEditorResourceProposal(): void {
  const draft = runtime.matrixEditor.resourceDraft;
  try {
    const parsed = JSON.parse(draft.after_json) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("after must be a JSON object");
    }
    const after = parsed as Record<string, JsonValue>;
    const proposal: MatrixEditorResourceProposal = {
      resource_key: draft.resource_key,
      action: draft.action,
      after,
    };
    if (draft.action === "update" && draft.record_identity.trim()) {
      proposal.record_identity = draft.record_identity.trim();
    }
    runtime.matrixEditor.resourceProposals.push(proposal);
    runtime.matrixEditor.resourceDraft = emptyMatrixEditorResourceDraft();
    const firstResource = currentMatrixEditorUniverse()?.resources?.[0];
    if (firstResource) {
      runtime.matrixEditor.resourceDraft.resource_key = firstResource.resource_key;
    }
    clearMatrixEditorResults();
    runtime.render();
  } catch (error) {
    runtime.matrixEditor.resourceDraft.error = error instanceof Error ? error.message : "Invalid JSON";
    runtime.render();
  }
}

function addMatrixEditorApiEntrypoint(): void {
  const apiName = runtime.matrixEditor.apiEntrypointDraft.trim();
  const prefix = `db_admin.matrix_editor.${runtime.matrixEditor.domain}.`;
  if (!apiName || !apiName.startsWith(prefix) || runtime.matrixEditor.apiEntrypoints.includes(apiName)) {
    return;
  }
  runtime.matrixEditor.apiEntrypoints.push(apiName);
  runtime.matrixEditor.apiEntrypointDraft = "";
  clearMatrixEditorResults();
  runtime.render();
}

function matrixEditorColumnGrantPayload(): MatrixEditorColumnGrantProposal[] {
  const universe = currentMatrixEditorUniverse();
  const proposals: MatrixEditorColumnGrantProposal[] = [];
  for (const resource of universe?.column_grant_universe ?? []) {
    for (const action of resource.actions ?? []) {
      const selectionKey = matrixEditorColumnGrantSelectionKey(resource.resource_key, action.action);
      const selected = runtime.matrixEditor.columnGrantSelections.get(selectionKey);
      if (selected?.size) {
        const availableColumns = new Set((action.columns ?? []).map((column) => column.key));
        const columns = [...selected].filter((column) => availableColumns.has(column)).sort();
        if (columns.length) {
          proposals.push({ resource_key: resource.resource_key, action: action.action, columns });
        }
      }
    }
  }
  return proposals;
}

function matrixEditorRowScopeValuePayload(): MatrixEditorRowScopeValueProposal[] {
  const proposals: MatrixEditorRowScopeValueProposal[] = [];
  for (const [rowScopeType, raw] of runtime.matrixEditor.rowScopeValues.entries()) {
    const values = raw.split(",").map((value) => value.trim()).filter(Boolean).map(coerceMatrixEditorScalar);
    if (values.length) {
      proposals.push({ row_scope_type: rowScopeType, values });
    }
  }
  return proposals;
}

function coerceMatrixEditorScalar(value: string): string | number | boolean {
  if (value === "true") return true;
  if (value === "false") return false;
  return coerceScalar(value);
}

function matrixEditorPayload(): MatrixEditorPayload {
  const proposal: MatrixEditorProposalBody = {};
  if (runtime.matrixEditor.resourceProposals.length) {
    proposal.resources = runtime.matrixEditor.resourceProposals;
  }
  if (runtime.matrixEditor.apiEntrypoints.length) {
    proposal.api_entrypoints = [...runtime.matrixEditor.apiEntrypoints];
  }
  const columnGrants = matrixEditorColumnGrantPayload();
  if (columnGrants.length) {
    proposal.column_grants = columnGrants;
  }
  const rowScopeValues = matrixEditorRowScopeValuePayload();
  if (rowScopeValues.length) {
    proposal.row_scope_values = rowScopeValues;
  }
  const payload: MatrixEditorPayload = {
    domain: runtime.matrixEditor.domain,
    proposal,
  };
  if (runtime.matrixEditor.reason.trim()) {
    payload.reason = runtime.matrixEditor.reason.trim();
  }
  return payload;
}

function clearMatrixEditorResults(): void {
  runtime.matrixEditor.validation = null;
  runtime.matrixEditor.preview = null;
  runtime.matrixEditor.applyResult = null;
}

async function loadMatrixEditorUniverse(): Promise<void> {
  runtime.matrixEditor.loading = true;
  runtime.matrixEditor.error = null;
  try {
    const universe = await apiFetch<MatrixEditorUniverse>(withSurface("/api/matrix-editor/universe/", { domain: runtime.matrixEditor.domain }));
    runtime.matrixEditor.universeByDomain[runtime.matrixEditor.domain] = universe;
  } catch (error) {
    runtime.matrixEditor.error = publicErrorMessage(error, runtime.t("matrix_universe_failed"));
    runtime.notify("error", runtime.matrixEditor.error);
  } finally {
    runtime.matrixEditor.loading = false;
    runtime.render();
  }
}

async function validateMatrixEditorProposal(): Promise<void> {
  runtime.matrixEditor.loading = true;
  runtime.matrixEditor.error = null;
  try {
    runtime.matrixEditor.validation = await apiFetch<MatrixEditorValidationResponse>(withSurface("/api/matrix-editor/validate/"), {
      method: "POST",
      body: JSON.stringify(matrixEditorPayload()),
    });
    runtime.matrixEditor.preview = null;
    runtime.matrixEditor.applyResult = null;
  } catch (error) {
    runtime.matrixEditor.error = publicErrorMessage(error, runtime.t("matrix_validate_failed"));
    runtime.notify("error", runtime.matrixEditor.error);
  } finally {
    runtime.matrixEditor.loading = false;
    runtime.render();
  }
}

async function previewMatrixEditorProposal(): Promise<void> {
  runtime.matrixEditor.loading = true;
  runtime.matrixEditor.error = null;
  try {
    runtime.matrixEditor.preview = await apiFetch<MatrixEditorPreviewResponse>(withSurface("/api/matrix-editor/preview/"), {
      method: "POST",
      body: JSON.stringify(matrixEditorPayload()),
    });
    runtime.matrixEditor.validation = runtime.matrixEditor.preview.validation ?? runtime.matrixEditor.validation;
    runtime.matrixEditor.applyResult = null;
  } catch (error) {
    runtime.matrixEditor.error = publicErrorMessage(error, runtime.t("matrix_preview_failed"));
    runtime.notify("error", runtime.matrixEditor.error);
  } finally {
    runtime.matrixEditor.loading = false;
    runtime.render();
  }
}

async function applyMatrixEditorProposal(): Promise<void> {
  if (!runtime.matrixEditor.confirmDangerous) {
    return;
  }
  runtime.matrixEditor.loading = true;
  runtime.matrixEditor.error = null;
  try {
    runtime.matrixEditor.applyResult = await apiFetch<MatrixEditorApplyResponse>(withSurface("/api/matrix-editor/apply/"), {
      method: "POST",
      body: JSON.stringify(matrixEditorPayload()),
    });
    runtime.notify("success", runtime.t("matrix_apply_result"));
  } catch (error) {
    runtime.matrixEditor.error = publicErrorMessage(error, runtime.t("matrix_apply_failed"));
    runtime.notify("error", runtime.matrixEditor.error);
  } finally {
    runtime.matrixEditor.loading = false;
    runtime.render();
  }
}


