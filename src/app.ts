import type {
  JsonPrimitive,
  JsonValue,
  RecordValue,
  ResourceRecord,
  Locale,
  ThemeMode,
  LocalizedText,
  FieldI18n,
  ResourceI18n,
  ActionI18n,
  FieldType,
  ResourceAction,
  ResourceActions,
  WorkflowPage,
  StaticOption,
  OptionSource,
  RelationDefinition,
  AdminControl,
  FieldValidation,
  FieldUi,
  ResourceField,
  DestructiveAction,
  ResourceNavigation,
  RelatedListDefinition,
  Toast,
  GridFilterItem,
  GridFilterModel,
  FilterValueControl,
  FilterOperatorDefinition,
  FilterControlReader,
  ResourceSchema,
  ResourceDiscoveryItem,
  ResourcesResponse,
  PaginatedRecords,
  RelationOption,
  OptionsResponse,
  TokenPair,
  AuthUser,
  AuthSession,
  AppState,
  ResourceViewState,
  SetupWorkbookColumnManifest,
  SetupWorkbookSheetManifest,
  SetupWorkbookManifest,
  SetupWorkbookIssue,
  SetupWorkbookStagedRow,
  SetupWorkbookCellCorrection,
  SetupWorkbookSheetResult,
  SetupWorkbookDryRunResult,
  SetupWorkbookCommitOperation,
  SetupWorkbookCommitPlan,
  SetupWorkbookState,
  MatrixEditorDomain,
  MatrixEditorUniverseResource,
  MatrixEditorColumnGrantColumn,
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
  MatrixEditorProposalBody,
  MatrixEditorPayload,
  MatrixEditorResourceDraft,
  MatrixEditorState,
  AuditViewKind,
  AuditRecord,
  AuditListResponse,
  AuditDetailResponse,
  AuditViewFilters,
  AuditViewState,
  ResourceExposureManifestItem,
  ResourceExposureManifest,
  ResourceExposureState,
  ManualScoringState,
  ApiErrorPayload
} from "./types";
import { UI_TEXT } from "./i18n";
import { appendChildren, clear, el } from "./dom";
import { ApiRequestError, apiFetch, apiFetchBlob, clearSession, publicErrorMessage, readSession, saveSession, withQueryParams, withSurface } from "./api";
import { AUDIT_VIEW_HASH, DEFAULT_PAGE_SIZE, MANUAL_SCORING_HASH, MATRIX_EDITOR_HASH, RESOURCE_EXPOSURE_HASH, SETUP_WORKBOOK_HASH, STORAGE_COLLAPSED_RESOURCE_GROUPS, STORAGE_LOCALE, STORAGE_THEME, STUDENT_CORRECTION_HASH, STUDENT_EXAM_HASH } from "./constants";
import { BUSINESS_WORKFLOW_TEST_IDS, DB_ADMIN_TEST_IDS } from "./testIds";
import { emptyAuditViewState, emptyManualScoringState, emptyMatrixEditorResourceDraft, emptyMatrixEditorState, emptyResourceExposureState, emptySetupWorkbookState, loadCollapsedResourceGroups, loadLocale, loadTheme } from "./initialState";
import { recordDeletePath, recordDetailPath, recordUpdatePath, resourceBatchDeletePath, resourceCreatePath, resourceListPath, resourceOptionsPath, resourceSchemaPath } from "./resourceEndpoints";
import { parseResourceHash, replaceResourceHash, resourceHash } from "./routes";
import { defaultFilterModel, filterModelForRequest, filterModelWithQuickSearch, filterableFields, hasActiveFilters, operatorNeedsValue, operatorsForField, parseFilterModel, parsePositiveInt, parseSortState, resourceViewParams, sanitizeFilterModel, sanitizeSortState } from "./filters";
import { canResourceAction, detailFields, editableFields, listFields, recordIdentity, schemaHasDependentRelations } from "./resourceModel";
import { renderPagination as renderResourcePagination, renderRecordsTable as renderResourceRecordsTable, type ResourceTableRuntime } from "./resourceTable";
import { optionQueryParams } from "./relationOptions";
import { controlForField, loadFormOptions, renderRecordForm, type ResourceFormRuntime } from "./resourceForm";
import { coerceScalar, isScalarRecordValue, safeJson } from "./fieldFormatting";
import { renderAuditViewPage, type AuditViewRuntime } from "./auditView";
import { renderResourceExposurePage, type ResourceExposureViewRuntime } from "./resourceExposureView";
import { renderManualScoringPage, type ManualScoringViewRuntime } from "./manualScoringView";
import { renderMatrixEditorPage, type MatrixEditorViewRuntime } from "./matrixEditorView";
import { renderSetupWorkbookPage, type SetupWorkbookViewRuntime } from "./setupWorkbookView";
import { renderStudentCorrectionPage, renderStudentExamPage, type StudentExamRuntime } from "./studentExamView";
import { renderFilterBuilder, type ResourceFilterBuilderRuntime } from "./resourceFilterBuilder";
const appRootElement = document.getElementById("app");

if (!(appRootElement instanceof HTMLElement)) {
  throw new Error("Missing #app root element.");
}

const appRoot: HTMLElement = appRootElement;
let nextToastId = 1;

const state: AppState = {
  resources: [],
  selectedResourceKey: null,
  selectedWorkflow: null,
  resourceFilter: "",
  collapsedResourceGroups: loadCollapsedResourceGroups(),
  resourceView: null,
  setupWorkbook: emptySetupWorkbookState(),
  matrixEditor: emptyMatrixEditorState(),
  auditView: emptyAuditViewState(),
  resourceExposure: emptyResourceExposureState(),
  manualScoring: emptyManualScoringState(),
  loading: false,
  error: null,
  message: null,
  locale: loadLocale(),
  theme: loadTheme(),
  toasts: [],
  dbAdminAccessDenied: false,
};

function persistCollapsedResourceGroups(): void {
  localStorage.setItem(STORAGE_COLLAPSED_RESOURCE_GROUPS, JSON.stringify([...state.collapsedResourceGroups].sort()));
}

function toggleResourceGroup(group: string): void {
  if (state.collapsedResourceGroups.has(group)) {
    state.collapsedResourceGroups.delete(group);
  } else {
    state.collapsedResourceGroups.add(group);
  }
  persistCollapsedResourceGroups();
  render();
}

function setLocale(locale: Locale): void {
  state.locale = locale;
  localStorage.setItem(STORAGE_LOCALE, locale);
}

function setTheme(theme: ThemeMode): void {
  state.theme = theme;
  localStorage.setItem(STORAGE_THEME, theme);
  document.documentElement.dataset.theme = theme;
}

function applyTheme(): void {
  document.documentElement.dataset.theme = state.theme;
}

function localizedText(fallback: string, text?: LocalizedText): string {
  if (!text) return fallback;
  return text[state.locale] || text.en || text.es || fallback;
}



function t(key: string): string {
  return UI_TEXT[key]?.[state.locale] ?? UI_TEXT[key]?.es ?? key;
}

function formatText(key: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    t(key),
  );
}

function resourceName(resource: ResourceSchema, plural = false): string {
  return localizedText(
    plural ? (resource.plural_label || resource.label || resource.key) : (resource.label || resource.key),
    plural ? resource.i18n?.plural_label : resource.i18n?.label,
  );
}

function fieldName(field: ResourceField): string {
  return localizedText(field.label || field.key, field.i18n?.label);
}

function relatedListName(relatedList: RelatedListDefinition): string {
  return localizedText(relatedList.label ?? "", relatedList.i18n?.label);
}

function fieldHelpText(field: ResourceField): string | undefined {
  const fallback = field.help_text ?? "";
  const text = localizedText(fallback, field.i18n?.help_text);
  return text || undefined;
}

function fieldUiText(field: ResourceField, key: "section" | "placeholder"): string | undefined {
  const fallback = field.ui?.[key] ?? "";
  const text = localizedText(fallback, field.i18n?.ui?.[key]);
  return text || undefined;
}

function actionLabel(action: DestructiveAction | undefined, fallback: string): string {
  return localizedText(action?.label ?? fallback, action?.i18n?.label);
}

function actionMessage(action: DestructiveAction | undefined, fallback: string): string {
  return localizedText(action?.message ?? fallback, action?.i18n?.message);
}

function operatorLabel(operator: FilterOperatorDefinition): string {
  return localizedText(operator.label || operator.key, operator.i18n?.label);
}

function syncResourceViewHash(view: ResourceViewState): void {
  replaceResourceHash(view.schema.alias || view.schema.key, resourceViewParams(view));
}

function notify(tone: Toast["tone"], message: string): void {
  const toast: Toast = { id: nextToastId++, tone, message };
  state.toasts = [...state.toasts, toast].slice(-4);
  window.setTimeout(() => {
    state.toasts = state.toasts.filter((candidate) => candidate.id !== toast.id);
    render();
  }, 6000);
}

function dismissToast(toastId: number): void {
  state.toasts = state.toasts.filter((toast) => toast.id !== toastId);
  render();
}

function renderToastRegion(): HTMLElement {
  const region = el("div", { class: "toast-region", role: "status", "aria-live": "polite", "data-testid": DB_ADMIN_TEST_IDS.toastRegion });
  for (const toast of state.toasts) {
    const close = el("button", { class: "toast__close", type: "button", "aria-label": "Dismiss" }, ["×"]);
    close.addEventListener("click", () => dismissToast(toast.id));
    region.append(el("div", { class: `toast toast--${toast.tone}` }, [el("span", {}, [toast.message]), close]));
  }
  return region;
}

function render(): void {
  applyTheme();
  clear(appRoot);
  if (isStudentExamRoute()) {
    appRoot.append(renderStudentExamPage(studentExamRuntime()));
    appRoot.append(renderToastRegion());
    return;
  }
  if (isStudentCorrectionRoute()) {
    appRoot.append(renderStudentCorrectionPage(studentExamRuntime()));
    appRoot.append(renderToastRegion());
    return;
  }

  const session = readSession();
  if (!session) {
    appRoot.append(renderLogin());
    return;
  }

  if (state.dbAdminAccessDenied) {
    appRoot.append(renderForbidden(session));
    return;
  }

  appRoot.append(renderShell(session));
}

function renderPreferenceControls(): HTMLElement {
  const languageButtons = el("div", { class: "segmented", "aria-label": t("language") }, [
    preferenceButton(t("spanish"), state.locale === "es", () => setLocale("es")),
    preferenceButton(t("english"), state.locale === "en", () => setLocale("en")),
  ]);
  const themeButtons = el("div", { class: "segmented", "aria-label": t("theme") }, [
    preferenceButton(t("light"), state.theme === "light", () => setTheme("light")),
    preferenceButton(t("dark"), state.theme === "dark", () => setTheme("dark")),
  ]);
  return el("div", { class: "preference-controls" }, [languageButtons, themeButtons]);
}

function preferenceButton(label: string, active: boolean, apply: () => void): HTMLElement {
  const button = el("button", {
    class: active ? "active" : "",
    type: "button",
    "aria-pressed": active ? "true" : "false",
  }, [label]);
  button.addEventListener("click", () => {
    apply();
    render();
  });
  return button;
}
function renderLogin(): HTMLElement {
  const usernameInput = el("input", {
    class: "input",
    "data-testid": DB_ADMIN_TEST_IDS.loginUsername,
    name: "username",
    autocomplete: "username",
    required: true,
    placeholder: t("username"),
  });
  const passwordInput = el("input", {
    class: "input",
    "data-testid": DB_ADMIN_TEST_IDS.loginPassword,
    name: "password",
    type: "password",
    autocomplete: "current-password",
    required: true,
    placeholder: t("password"),
  });
  const errorBox = el("div", { class: "error", hidden: true });
  const submit = el("button", { class: "button primary", type: "submit", "data-testid": DB_ADMIN_TEST_IDS.loginSubmit }, [t("sign_in")]);

  const form = el("form", { class: "stack", "data-testid": DB_ADMIN_TEST_IDS.loginForm }, [
    fieldShell(t("username"), usernameInput),
    fieldShell(t("password"), passwordInput),
    errorBox,
    submit,
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleLogin(form, submit, errorBox);
  });

  return el("main", { class: "login-page", "data-testid": DB_ADMIN_TEST_IDS.loginPage }, [
    el("section", { class: "card login-card" }, [
      el("div", { class: "card__body stack" }, [
        el("div", {}, [
          el("h1", {}, [t("login_title")]),
        ]),
        renderPreferenceControls(),
        form,
      ]),
    ]),
  ]);
}

async function handleLogin(form: HTMLFormElement, submit: HTMLButtonElement, errorBox: HTMLElement): Promise<void> {
  const data = new FormData(form);
  const username = String(data.get("username") ?? "");
  const password = String(data.get("password") ?? "");
  submit.disabled = true;
  submit.textContent = t("signing_in");
  errorBox.hidden = true;
  errorBox.textContent = "";

  try {
    const payload = await apiFetch<AuthSession>("/api/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }, false);
    saveSession(payload);
    state.error = null;
    state.message = null;
    state.dbAdminAccessDenied = false;
    await loadResources();
  } catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = publicErrorMessage(error, t("login_failed"));
  } finally {
    submit.disabled = false;
    submit.textContent = t("sign_in");
    render();
  }
}

function renderForbidden(session: AuthSession): HTMLElement {
  const logoutButton = el("button", { class: "button" }, [t("sign_out")]);
  logoutButton.addEventListener("click", () => {
    clearSession();
    state.resources = [];
    state.dbAdminAccessDenied = false;
    render();
  });

  return el("main", { class: "login-page", "data-testid": DB_ADMIN_TEST_IDS.loginPage }, [
    el("section", { class: "card login-card" }, [
      el("div", { class: "card__body stack" }, [
        el("h1", {}, [t("db_admin_required")]),
        el("p", {}, [`${displayUser(session.user)} ${t("db_admin_required_message")}`]),
        logoutButton,
      ]),
    ]),
  ]);
}

function renderShell(session: AuthSession): HTMLElement {
  const shell = el("div", { class: "app-shell", "data-testid": DB_ADMIN_TEST_IDS.appShell });
  shell.append(renderSidebar(session));
  shell.append(renderMain());
  shell.append(renderToastRegion());
  return shell;
}

function renderSidebar(session: AuthSession): HTMLElement {
  const filterInput = el("input", {
    class: "resource-filter",
    "data-testid": DB_ADMIN_TEST_IDS.resourceFilter,
    placeholder: t("filter_resources"),
    value: state.resourceFilter,
  });
  filterInput.addEventListener("input", () => {
    state.resourceFilter = filterInput.value;
    render();
  });

  const nav = el("nav", { class: "resource-nav", "aria-label": t("resources"), "data-testid": DB_ADMIN_TEST_IDS.resourceNav });
  const groupedResources = resourcesByNavigationGroup(filteredResources());
  for (const [group, resources] of groupedResources) {
    const collapsed = state.collapsedResourceGroups.has(group);
    const toggle = el("button", {
      class: "resource-group__toggle",
      type: "button",
      "aria-expanded": collapsed ? "false" : "true",
      title: collapsed ? t("expand_group") : t("collapse_group"),
    }, [
      el("span", {}, [`${collapsed ? "▸" : "▾"} ${group}`]),
      el("span", { class: "resource-group__count" }, [String(resources.length)]),
    ]);
    toggle.addEventListener("click", () => toggleResourceGroup(group));
    nav.append(toggle);

    const items = el("div", { class: "resource-group__items", hidden: collapsed ? true : null });
    for (const resource of resources) {
      const item = el("button", {
        class: resource.key === state.selectedResourceKey ? "active" : "",
        type: "button",
        title: resource.key,
      }, [resourceName(resource, true)]);
      item.addEventListener("click", () => {
        void selectResource(resource.key);
      });
      items.append(item);
    }
    nav.append(items);
  }
  if (groupedResources.length === 0) {
    nav.append(el("div", { class: "empty" }, [t("no_resources_match")]));
  }

  const workflowNav = el("nav", { class: "resource-nav workflow-nav", "aria-label": t("workflows"), "data-testid": DB_ADMIN_TEST_IDS.workflowNav });
  const setupWorkbookButton = el("button", {
    class: state.selectedWorkflow === "setup_workbook" ? "active" : "",
    type: "button",
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.setupWorkbook.nav,
  }, [t("setup_workbook")]);
  setupWorkbookButton.addEventListener("click", () => {
    void selectSetupWorkbookPage();
  });
  const auditViewButton = el("button", {
    class: state.selectedWorkflow === "audit_view" ? "active" : "",
    type: "button",
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.auditView.nav,
  }, [t("audit_view")]);
  auditViewButton.addEventListener("click", () => {
    void selectAuditViewPage();
  });
  const resourceExposureButton = el("button", {
    class: state.selectedWorkflow === "resource_exposure" ? "active" : "",
    type: "button",
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.resourceExposure.nav,
  }, [t("resource_exposure")]);
  resourceExposureButton.addEventListener("click", () => {
    void selectResourceExposurePage();
  });
  const manualScoringButton = el("button", {
    class: state.selectedWorkflow === "manual_scoring" ? "active" : "",
    type: "button",
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.nav,
  }, [t("manual_scoring")]);
  manualScoringButton.addEventListener("click", () => {
    void selectManualScoringPage();
  });
  workflowNav.append(setupWorkbookButton);
  if (matrixEditorNavigationEnabled()) {
    const matrixEditorButton = el("button", {
      class: state.selectedWorkflow === "matrix_editor" ? "active" : "",
      type: "button",
      "data-testid": BUSINESS_WORKFLOW_TEST_IDS.matrixEditor.nav,
    }, [t("matrix_editor")]);
    matrixEditorButton.addEventListener("click", () => {
      void selectMatrixEditorPage();
    });
    workflowNav.append(matrixEditorButton);
  }
  workflowNav.append(auditViewButton, resourceExposureButton, manualScoringButton);

  const refresh = el("button", { class: "logout", type: "button", "data-testid": DB_ADMIN_TEST_IDS.refreshResources }, [t("refresh_resources")]);
  refresh.addEventListener("click", () => {
    void loadResources();
  });

  const logout = el("button", { class: "logout", type: "button", "data-testid": DB_ADMIN_TEST_IDS.signOut }, [t("sign_out")]);
  logout.addEventListener("click", () => {
    clearSession();
    state.resources = [];
    state.selectedResourceKey = null;
    state.resourceView = null;
    state.dbAdminAccessDenied = false;
    render();
  });

  return el("aside", { class: "sidebar", "data-testid": DB_ADMIN_TEST_IDS.sidebar }, [
    el("div", {}, [
      el("h1", { class: "sidebar__title" }, [t("admin_title")]),
    ]),
    el("div", { class: "user-card" }, [
      el("strong", {}, [displayUser(session.user)]),
    ]),
    el("div", { class: "sidebar__section stack sidebar__controls" }, [filterInput, renderPreferenceControls(), refresh]),
    el("div", { class: "sidebar__section stack" }, [workflowNav]),
    nav,
    el("div", { class: "sidebar__section sidebar__footer" }, [logout]),
  ]);
}

function resourcesByNavigationGroup(resources: ResourceSchema[]): Array<[string, ResourceSchema[]]> {
  const groups = new Map<string, ResourceSchema[]>();
  for (const resource of resources) {
    const group = resource.navigation?.group ?? t("resources");
    groups.set(group, [...(groups.get(group) ?? []), resource]);
  }
  return [...groups.entries()];
}

function renderMain(): HTMLElement {
  const main = el("main", { class: "main", "data-testid": DB_ADMIN_TEST_IDS.main });
  if (state.loading) {
    main.append(renderLoadingPage(t("loading_admin_resources")));
    return main;
  }
  if (state.error) {
    main.append(renderErrorPage(state.error));
    return main;
  }
  if (state.selectedWorkflow === "setup_workbook") {
    main.append(renderSetupWorkbookPage(setupWorkbookViewRuntime()));
    return main;
  }
  if (state.selectedWorkflow === "matrix_editor") {
    main.append(renderMatrixEditorPage(matrixEditorViewRuntime()));
    return main;
  }
  if (state.selectedWorkflow === "audit_view") {
    main.append(renderAuditViewPage(auditViewRuntime()));
    return main;
  }
  if (state.selectedWorkflow === "resource_exposure") {
    main.append(renderResourceExposurePage(resourceExposureViewRuntime()));
    return main;
  }
  if (state.selectedWorkflow === "manual_scoring") {
    main.append(renderManualScoringPage(manualScoringViewRuntime()));
    return main;
  }
  if (state.resources.length === 0) {
    main.append(renderEmptyPage());
    return main;
  }
  if (!state.selectedResourceKey) {
    main.append(renderWelcomePage());
    return main;
  }
  if (!state.resourceView || (state.resourceView.schema.alias || state.resourceView.schema.key) !== state.selectedResourceKey) {
    main.append(renderLoadingPage(t("loading_resource")));
    void loadResourceView(state.selectedResourceKey);
    return main;
  }
  main.append(renderResourcePage(state.resourceView));
  return main;
}

function renderLoadingPage(message: string): HTMLElement {
  return el("section", { class: "card" }, [el("div", { class: "card__body" }, [message])]);
}

function renderErrorPage(message: string): HTMLElement {
  const retry = el("button", { class: "button primary", type: "button" }, [t("retry")]);
  retry.addEventListener("click", () => {
    void loadResources();
  });
  return el("section", { class: "stack" }, [
    el("div", { class: "error" }, [message]),
    el("div", {}, [retry]),
  ]);
}

function renderEmptyPage(): HTMLElement {
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h2", {}, [t("empty_resources_title")]),
      el("p", { class: "page-subtitle" }, [
        t("empty_resources_message"),
      ]),
    ]),
  ]);
}

function renderWelcomePage(): HTMLElement {

  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h2", {}, [t("welcome_message")]),
    ]),
  ]);
}

function resourceFilterBuilderRuntime(): ResourceFilterBuilderRuntime {
  return {
    t,
    localizedText,
    fieldName,
    operatorLabel,
    reloadResourceView,
  };
}

function resourceTableRuntime(): ResourceTableRuntime {
  return {
    controlForField,
    deleteRecord,
    fieldName,
    openRecordForm,
    recordLabel,
    relatedListName,
    reloadResourceView,
    render,
    resourceExists: (resourceKey: string) => state.resources.some((resource) => resource.key === resourceKey),
    selectResource,
    t,
  };
}

function renderResourcePage(view: ResourceViewState): HTMLElement {
  const schema = view.schema;
  const createButton = el("button", { class: "button primary", type: "button", "data-testid": DB_ADMIN_TEST_IDS.resourceCreate }, [t("create_resource")]);
  createButton.disabled = !canResourceAction(schema, "create") || editableFields(schema, true).length === 0;
  createButton.addEventListener("click", () => openRecordForm(schema, "create"));

  const refreshButton = el("button", { class: "button", type: "button", "data-testid": DB_ADMIN_TEST_IDS.resourceRefresh }, [t("refresh_resource")]);
  refreshButton.addEventListener("click", () => {
    void reloadResourceView();
  });

  const batchAction = schema.destructive_actions?.batch_delete;
  const batchDeleteButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: canResourceAction(schema, "batch_delete") && view.selectedIdentities.size > 0 ? null : true,
    "data-testid": DB_ADMIN_TEST_IDS.resourceBatchDelete,
  }, [actionLabel(batchAction, `${t("delete_selected")} (${view.selectedIdentities.size})`)]);
  batchDeleteButton.addEventListener("click", () => {
    if (view.selectedIdentities.size > 0) {
      void batchDeleteRecords(view);
    }
  });

  const quickSearch = el("input", {
    class: "input search",
    "data-testid": DB_ADMIN_TEST_IDS.resourceQuickSearch,
    placeholder: t("quick_search"),
    value: view.quickSearch,
  });
  quickSearch.addEventListener("change", () => {
    view.quickSearch = quickSearch.value.trim();
    view.filterModel = filterModelWithQuickSearch(view.filterModel, view.quickSearch);
    view.page = 1;
    void reloadResourceView();
  });

  const pageSize = el("select", { class: "select small", "data-testid": DB_ADMIN_TEST_IDS.resourcePageSize });
  for (const size of [10, 25, 50, 100]) {
    pageSize.append(el("option", { value: size, selected: size === view.pageSize }, [String(size)]));
  }
  pageSize.addEventListener("change", () => {
    view.pageSize = Number(pageSize.value) || schema.page_size || DEFAULT_PAGE_SIZE;
    view.page = 1;
    void reloadResourceView();
  });

  const notices: Node[] = [];
  if (hasActiveFilters(view)) {
    const clearFilters = el("button", { class: "button", type: "button" }, [t("clear_filters")]);
    clearFilters.addEventListener("click", () => {
      view.filterModel = defaultFilterModel();
      view.quickSearch = "";
      view.page = 1;
      void reloadResourceView();
    });
    notices.push(el("div", { class: "notice" }, [
      t("filtered_notice"),
      clearFilters,
    ]));
  }
  if (schemaHasDependentRelations(schema)) {
    notices.push(el("div", { class: "notice" }, [
      t("dependent_relation_notice"),
    ]));
  }
  // Success messages are rendered as toasts so repeated CRUD work does not shift table layout.
  if (view.error) {
    notices.push(el("div", { class: "error" }, [view.error]));
  }

  return el("section", { class: "stack", "data-testid": DB_ADMIN_TEST_IDS.resourcePage }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [resourceName(schema, true)]),
      ]),
      el("div", { class: "toolbar" }, [createButton, batchDeleteButton, refreshButton]),
    ]),
    ...notices,
    el("div", { class: "toolbar" }, [
      quickSearch,
      el("span", { class: "toolbar__spacer" }),
      el("label", { class: "meta-line" }, [t("rows"), pageSize]),
    ]),
    renderFilterBuilder(view, resourceFilterBuilderRuntime()),
    view.loading ? renderLoadingPage(t("loading_records")) : renderResourceRecordsTable(view, resourceTableRuntime()),
    renderResourcePagination(view, resourceTableRuntime()),
  ]);
}



function auditViewListPath(): string {
  const params: Record<string, string> = {};
  const filters = state.auditView.filters;
  if (filters.status.trim()) params.status = filters.status.trim();
  if (filters.source.trim()) params.source = filters.source.trim();
  if (filters.domain.trim()) params.domain = filters.domain.trim();
  if (state.auditView.kind === "events" && filters.eventType.trim()) params.event_type = filters.eventType.trim();
  if (filters.limit.trim()) params.limit = String(parsePositiveInt(filters.limit, 50));
  if (filters.offset.trim()) params.offset = String(Math.max(0, parsePositiveInt(filters.offset, 0)));
  return withQueryParams(`/api/db-admin-audit/${state.auditView.kind}/`, params);
}

function auditViewDetailPath(id: string): string {
  return `/api/db-admin-audit/${state.auditView.kind}/${encodeURIComponent(id)}/`;
}

async function loadAuditViewList(): Promise<void> {
  state.auditView.loading = true;
  state.auditView.error = null;
  try {
    state.auditView.list = await apiFetch<AuditListResponse>(auditViewListPath());
    state.auditView.detail = null;
    state.auditView.selectedId = null;
  } catch (error) {
    state.auditView.error = publicErrorMessage(error, t("audit_load_failed"));
    notify("error", state.auditView.error);
  } finally {
    state.auditView.loading = false;
    render();
  }
}

async function loadAuditViewDetail(id: string): Promise<void> {
  state.auditView.loading = true;
  state.auditView.error = null;
  try {
    state.auditView.detail = await apiFetch<AuditDetailResponse>(auditViewDetailPath(id));
    state.auditView.selectedId = id;
  } catch (error) {
    state.auditView.error = publicErrorMessage(error, t("audit_detail_failed"));
    notify("error", state.auditView.error);
  } finally {
    state.auditView.loading = false;
    render();
  }
}

async function loadResourceExposureManifest(): Promise<void> {
  state.resourceExposure.loading = true;
  state.resourceExposure.error = null;
  try {
    state.resourceExposure.manifest = await apiFetch<ResourceExposureManifest>("/api/db-admin-resource-exposure/manifest/");
  } catch (error) {
    state.resourceExposure.error = publicErrorMessage(error, t("resource_exposure_load_failed"));
    notify("error", state.resourceExposure.error);
  } finally {
    state.resourceExposure.loading = false;
    render();
  }
}



function fieldShell(label: string, input: HTMLElement, helpText?: string): HTMLElement {
  return el("div", { class: "field" }, [
    el("label", {}, [label]),
    input,
    helpText ? el("small", {}, [helpText]) : null,
  ]);
}

function normalizeResourceSchema(schema: ResourceSchema): ResourceSchema {
  return {
    ...schema,
    key: String(schema.alias || ""),
    fields: (schema.fields ?? []).map((field) => ({
      ...field,
      key: String(field.alias || ""),
    })),
    related_lists: schema.related_lists ?? [],
  };
}

async function loadResources(): Promise<void> {
  state.loading = true;
  state.error = null;
  state.message = null;
  render();
  try {
    const response = await apiFetch<ResourcesResponse>(withSurface("/api/resources/"));
    state.dbAdminAccessDenied = false;
    state.resources = response.resources.map((resource) => ({
      ...resource,
      key: String(resource.alias || ""),
      fields: [],
      page_size: DEFAULT_PAGE_SIZE,
    })).filter((resource) => resource.key).sort((left, right) =>
      resourceName(left, true).localeCompare(resourceName(right, true)),
    );
    if (state.selectedResourceKey && !state.resources.some((resource) => resource.key === state.selectedResourceKey)) {
      state.selectedResourceKey = null;
      state.resourceView = null;
    }
  } catch (error) {
    state.dbAdminAccessDenied = error instanceof ApiRequestError && error.status === 403;
    state.error = publicErrorMessage(error, t("load_resources_failed"));
    if (!state.dbAdminAccessDenied) {
      notify("error", state.error);
    }
  } finally {
    state.loading = false;
    render();
  }
}

async function selectResource(
  resourceKey: string,
  params: URLSearchParams = new URLSearchParams(),
  updateHash = true,
): Promise<void> {
  if (updateHash) {
    replaceResourceHash(resourceKey, params);
  }
  state.selectedWorkflow = null;
  state.selectedResourceKey = resourceKey;
  state.resourceView = null;
  state.message = null;
  render();
  await loadResourceView(resourceKey, params);
}


function matrixEditorViewRuntime(): MatrixEditorViewRuntime {
  return {
    matrixEditor: state.matrixEditor,
    t,
    render,
    notify,
  };
}

function setupWorkbookViewRuntime(): SetupWorkbookViewRuntime {
  return {
    setupWorkbook: state.setupWorkbook,
    t,
    render,
    notify,
  };
}

function auditViewRuntime(): AuditViewRuntime {
  return {
    state: state.auditView,
    t,
    render,
    loadAuditViewList,
    loadAuditViewDetail,
  };
}

function resourceExposureViewRuntime(): ResourceExposureViewRuntime {
  return {
    state: state.resourceExposure,
    t,
    render,
    loadResourceExposureManifest,
    renderLoadingPage,
    fieldShell,
  };
}

function manualScoringViewRuntime(): ManualScoringViewRuntime {
  return {
    manualScoring: state.manualScoring,
    t,
    render,
    notify,
  };
}

function studentExamRuntime(): StudentExamRuntime {
  return {
    t,
    render,
    notify,
  };
}

async function selectSetupWorkbookPage(updateHash = true): Promise<void> {
  if (updateHash && location.hash !== SETUP_WORKBOOK_HASH) {
    history.replaceState(null, "", SETUP_WORKBOOK_HASH);
  }
  state.selectedWorkflow = "setup_workbook";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
}

async function selectMatrixEditorPage(updateHash = true): Promise<void> {
  if (!matrixEditorNavigationEnabled()) {
    if (location.hash === MATRIX_EDITOR_HASH) {
      history.replaceState(null, "", location.pathname || "/");
    }
    state.selectedWorkflow = null;
    state.selectedResourceKey = null;
    state.resourceView = null;
    state.message = null;
    render();
    return;
  }
  if (updateHash && location.hash !== MATRIX_EDITOR_HASH) {
    history.replaceState(null, "", MATRIX_EDITOR_HASH);
  }
  state.selectedWorkflow = "matrix_editor";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
}

async function selectAuditViewPage(updateHash = true): Promise<void> {
  if (updateHash && location.hash !== AUDIT_VIEW_HASH) {
    history.replaceState(null, "", AUDIT_VIEW_HASH);
  }
  state.selectedWorkflow = "audit_view";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
  if (!state.auditView.list) {
    await loadAuditViewList();
  }
}

async function selectResourceExposurePage(updateHash = true): Promise<void> {
  if (updateHash && location.hash !== RESOURCE_EXPOSURE_HASH) {
    history.replaceState(null, "", RESOURCE_EXPOSURE_HASH);
  }
  state.selectedWorkflow = "resource_exposure";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
  if (!state.resourceExposure.manifest) {
    await loadResourceExposureManifest();
  }
}

async function selectManualScoringPage(updateHash = true): Promise<void> {
  if (updateHash && location.hash !== MANUAL_SCORING_HASH) {
    history.replaceState(null, "", MANUAL_SCORING_HASH);
  }
  state.selectedWorkflow = "manual_scoring";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
}

async function loadResourceView(resourceKey: string, params: URLSearchParams = new URLSearchParams()): Promise<void> {
  try {
    const schema = normalizeResourceSchema(await apiFetch<ResourceSchema>(resourceSchemaPath(resourceKey)));
    const sort = sanitizeSortState(schema, parseSortState(params.get("sort")));
    const filterModel = sanitizeFilterModel(schema, parseFilterModel(params.get("filters")));
    const view: ResourceViewState = {
      schema,
      records: [],
      count: 0,
      page: parsePositiveInt(params.get("page"), 1),
      pageSize: parsePositiveInt(params.get("page_size"), schema.page_size || DEFAULT_PAGE_SIZE),
      quickSearch: filterModel.quickFilterValues.join(" ").trim(),
      filterModel,
      sortField: sort.sortField,
      sortDirection: sort.sortDirection,
      optionMaps: {},
      selectedIdentities: new Set<string>(),
      loading: true,
      error: null,
    };
    state.resourceView = view;
    syncResourceViewHash(view);
    render();
    await loadRecords(view);
  } catch (error) {
    state.resourceView = null;
    state.error = publicErrorMessage(error, t("load_resource_failed"));
    notify("error", state.error);
  } finally {
    render();
  }
}

async function reloadResourceView(): Promise<void> {
  if (!state.resourceView) {
    return;
  }
  syncResourceViewHash(state.resourceView);
  await loadRecords(state.resourceView);
  render();
}

async function loadRecords(view: ResourceViewState): Promise<void> {
  view.loading = true;
  view.error = null;
  render();
  try {
    await loadListOptionMaps(view);
    const params = Object.fromEntries(resourceViewParams(view).entries());
    const response = await apiFetch<PaginatedRecords>(resourceListPath(view.schema, params));
    view.records = response.results;
    view.count = response.count;
    const visibleIdentities = new Set(view.records.map((record) => recordIdentity(record)).filter((identity): identity is string => identity !== null));
    view.selectedIdentities = new Set([...view.selectedIdentities].filter((identity) => visibleIdentities.has(identity)));
  } catch (error) {
    view.error = publicErrorMessage(error, t("load_records_failed"));
    notify("error", view.error);
  } finally {
    view.loading = false;
  }
}

async function loadListOptionMaps(view: ResourceViewState): Promise<void> {
  const optionFields = new Map<string, ResourceField>();
  for (const field of [...listFields(view.schema), ...filterableFields(view.schema)]) {
    if (field.option_source || field.relation) {
      optionFields.set(field.key, field);
    }
  }
  await Promise.all([...optionFields.values()].map((field) => loadOptionMap(view, field)));
}

async function loadOptionMap(view: ResourceViewState, field: ResourceField): Promise<void> {
  if (view.optionMaps[field.key]) {
    return;
  }
  const map = new Map<string, string>();
  if (field.option_source?.kind === "static") {
    for (const option of field.option_source.options) {
      map.set(String(option.value), option.label);
    }
    view.optionMaps[field.key] = map;
    return;
  }
  if (!field.relation) {
    view.optionMaps[field.key] = map;
    return;
  }
  try {
    const response = await apiFetch<OptionsResponse>(resourceOptionsPath(view.schema, field.key, optionQueryParams(field) ?? {}));
    for (const option of response.options) {
      map.set(String(option.value), option.label);
    }
  } catch {
    // Do not block record listing because label lookup failed. Raw IDs remain visible.
  }
  view.optionMaps[field.key] = map;
}

function resourceFormRuntime(): ResourceFormRuntime {
  return {
    t,
    formatText,
    localizedText,
    fieldName,
    fieldHelpText,
    fieldUiText,
    submitRecordPayload: async ({ schema, mode, identity, payload }) => {
      if (mode === "create") {
        await apiFetch<ResourceRecord>(resourceCreatePath(schema), {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<ResourceRecord>(recordUpdatePath(schema, identity), {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
    },
    afterSuccessfulSubmit: async (schema, mode) => {
      state.message = null;
      notify("success", `${resourceName(schema)} ${mode === "create" ? t("created") : t("updated")}.`);
      await reloadResourceView();
    },
    reportError: (message) => notify("error", message),
    render,
  };
}

function openRecordForm(
  schema: ResourceSchema,
  mode: "create" | "view" | "edit",
  identity = "",
  previewLabel = "",
): void {
  const modal = el("div", { class: "modal-backdrop" });
  const recordSuffix = previewLabel ? `: ${previewLabel}` : "";
  const schemaName = resourceName(schema);
  const title = mode === "create" ? `${t("create_resource")} ${schemaName}` : mode === "edit" ? `${t("edit")} ${schemaName}${recordSuffix}` : `${schemaName} ${t("details")}${recordSuffix}`;
  const body = el("div", { class: "modal__body" }, [renderLoadingPage(t("loading_form"))]);
  const close = el("button", { class: "button", type: "button" }, [t("close")]);
  close.addEventListener("click", () => modal.remove());
  const modalPanel = el("section", { class: "modal" }, [
    el("header", { class: "modal__header" }, [el("h3", { class: "modal__title" }, [title]), close]),
    body,
  ]);
  modal.append(modalPanel);
  document.body.append(modal);
  void populateRecordForm(modal, body, schema, mode, identity);
}

async function populateRecordForm(
  modal: HTMLElement,
  body: HTMLElement,
  schema: ResourceSchema,
  mode: "create" | "view" | "edit",
  identity = "",
): Promise<void> {
  try {
    const record = mode === "create" ? {} : await apiFetch<ResourceRecord>(recordDetailPath(schema, identity));
    const fields = mode === "view" ? detailFields(schema) : editableFields(schema, mode === "create");
    const optionMaps = await loadFormOptions(schema, record, fields, resourceFormRuntime());
    clear(body);
    body.append(renderRecordForm(modal, schema, mode, record, optionMaps, identity, resourceFormRuntime()));
  } catch (error) {
    clear(body);
    body.append(el("div", { class: "error" }, [publicErrorMessage(error, t("load_form_failed"))]));
  }
}

async function batchDeleteRecords(view: ResourceViewState): Promise<void> {
  const identities = [...view.selectedIdentities];
  if (identities.length === 0) {
    return;
  }
  const action = view.schema.destructive_actions?.batch_delete;
  const confirmed = action?.confirm === false || window.confirm(action?.message ?? `${t("delete")} ${identities.length} ${t("records")}?`);
  if (!confirmed) {
    return;
  }
  try {
    await apiFetch<void>(resourceBatchDeletePath(view.schema), {
      method: "DELETE",
      body: JSON.stringify({ identities }),
    });
    view.selectedIdentities.clear();
    state.message = null;
    notify("success", `${identities.length} ${resourceName(view.schema, true)} ${t("deleted")}.`);
    await reloadResourceView();
  } catch (error) {
    state.message = null;
    view.error = publicErrorMessage(error, t("batch_delete_failed"));
    notify("error", view.error);
  } finally {
    render();
  }
}

async function deleteRecord(schema: ResourceSchema, identity = "", label = ""): Promise<void> {
  const action = schema.destructive_actions?.delete;
  const schemaName = resourceName(schema);
  const fallbackMessage = label ? `${t("delete_this")} ${schemaName}: ${label}?` : `${t("delete_this")} ${schemaName}?`;
  const confirmed = action?.confirm === false || window.confirm(actionMessage(action, fallbackMessage));
  if (!confirmed) {
    return;
  }
  try {
    await apiFetch<void>(recordDeletePath(schema, identity), { method: "DELETE" });
    state.message = null;
    notify("success", label ? `${schemaName} ${label} deleted.` : `${schemaName} deleted.`);
    await reloadResourceView();
  } catch (error) {
    state.message = null;
    if (state.resourceView) {
      state.resourceView.error = publicErrorMessage(error, t("delete_failed"));
      notify("error", state.resourceView.error);
    }
  } finally {
    render();
  }
}

function filteredResources(): ResourceSchema[] {
  const needle = state.resourceFilter.trim().toLowerCase();
  const resources = !needle
    ? state.resources
    : state.resources.filter((resource) =>
        [resource.key, resourceName(resource), resourceName(resource, true), resource.navigation?.group ?? ""].some((value) => value.toLowerCase().includes(needle)),
      );
  return [...resources].sort((left, right) => {
    const leftGroup = left.navigation?.group ?? "Resources";
    const rightGroup = right.navigation?.group ?? "Resources";
    if (leftGroup !== rightGroup) return leftGroup.localeCompare(rightGroup);
    const leftOrder = left.navigation?.order ?? 1000;
    const rightOrder = right.navigation?.order ?? 1000;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return resourceName(left, true).localeCompare(resourceName(right, true));
  });
}

function recordLabel(schema: ResourceSchema, record: ResourceRecord): string {
  for (const field of listFields(schema)) {
    const value = record[field.key];
    if (isScalarRecordValue(value) && value !== null && String(value).trim()) {
      return String(value);
    }
  }
  return resourceName(schema);
}

function displayUser(user: AuthUser): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name ? `${name} (${user.username})` : user.username;
}

function isStudentExamRoute(): boolean {
  return location.hash === STUDENT_EXAM_HASH || location.hash.startsWith(`${STUDENT_EXAM_HASH}?`);
}

function isStudentCorrectionRoute(): boolean {
  return location.hash === STUDENT_CORRECTION_HASH || location.hash.startsWith(`${STUDENT_CORRECTION_HASH}?`);
}

function matrixEditorNavigationEnabled(): boolean {
  // Sensitive workflow navigation must come from a backend-owned catalog.
  return false;
}

window.addEventListener("hashchange", () => {
  if (isStudentExamRoute() || isStudentCorrectionRoute()) {
    render();
    return;
  }
  if (location.hash === SETUP_WORKBOOK_HASH) {
    void selectSetupWorkbookPage(false);
    return;
  }
  if (location.hash === MATRIX_EDITOR_HASH) {
    void selectMatrixEditorPage(false);
    return;
  }
  if (location.hash === AUDIT_VIEW_HASH) {
    void selectAuditViewPage(false);
    return;
  }
  if (location.hash === RESOURCE_EXPOSURE_HASH) {
    void selectResourceExposurePage(false);
    return;
  }
  if (location.hash === MANUAL_SCORING_HASH) {
    void selectManualScoringPage(false);
    return;
  }
  const parsed = parseResourceHash();
  if (parsed.resourceKey) {
    void selectResource(parsed.resourceKey, parsed.params, false);
  }
});

async function boot(): Promise<void> {
  if (isStudentExamRoute() || isStudentCorrectionRoute()) {
    render();
    return;
  }
  const session = readSession();
  if (!session) {
    render();
    return;
  }
  render();
  await loadResources();
  if (location.hash === SETUP_WORKBOOK_HASH) {
    await selectSetupWorkbookPage(false);
    render();
    return;
  }
  if (location.hash === MATRIX_EDITOR_HASH) {
    await selectMatrixEditorPage(false);
    render();
    return;
  }
  if (location.hash === AUDIT_VIEW_HASH) {
    await selectAuditViewPage(false);
    render();
    return;
  }
  if (location.hash === RESOURCE_EXPOSURE_HASH) {
    await selectResourceExposurePage(false);
    render();
    return;
  }
  if (location.hash === MANUAL_SCORING_HASH) {
    await selectManualScoringPage(false);
    render();
    return;
  }
  const parsed = parseResourceHash();
  if (parsed.resourceKey && state.resources.some((resource) => resource.key === parsed.resourceKey)) {
    await selectResource(parsed.resourceKey, parsed.params, false);
  }
  render();
}

void boot();
