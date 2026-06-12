export {};
declare global {
  interface Window {
    __RETROBOLT_ADMIN_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type RecordValue = JsonValue | undefined;
type ResourceRecord = Record<string, RecordValue>;
type Locale = "en" | "es";
type ThemeMode = "light" | "dark";
type LocalizedText = Partial<Record<Locale | string, string>>;
type FieldI18n = {
  label?: LocalizedText;
  help_text?: LocalizedText;
  ui?: {
    section?: LocalizedText;
    placeholder?: LocalizedText;
  };
};
type ResourceI18n = {
  label?: LocalizedText;
  plural_label?: LocalizedText;
};
type ActionI18n = {
  label?: LocalizedText;
  message?: LocalizedText;
};

type FieldType =
  | "string"
  | "text"
  | "rich_text"
  | "integer"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "enum"
  | "foreign_key"
  | "many_to_many"
  | "json";

type ResourceAction = "list" | "retrieve" | "create" | "update" | "delete" | "batch_delete";
type ResourceActions = Partial<Record<ResourceAction, boolean>>;
type WorkflowPage = "setup_workbook" | "matrix_editor" | "audit_view" | "resource_exposure";

type StaticOption = {
  value: string;
  label: string;
  i18n?: { label?: LocalizedText };
};

type OptionSource = {
  kind: "static";
  options: StaticOption[];
};

type RelationDefinition = {
  depends_on: string[];
  dependencies?: Array<{ source_field: string; target_field: string; operator: string }>;
  priority?: number | null;
  page_size?: number;
  option_control?: "select" | "typeahead" | string;
};

type AdminControl =
  | "text_input"
  | "textarea"
  | "number_input"
  | "checkbox"
  | "date_input"
  | "datetime_input"
  | "email_input"
  | "enum_select"
  | "fk_select"
  | "many_to_many_select"
  | "json_textarea"
  | "read_only";

type FieldValidation = {
  max_length?: number;
  min_length?: number;
  max_value?: number | string;
  min_value?: number | string;
  max_digits?: number;
  decimal_places?: number;
  step?: number | string;
  pattern?: string;
  format?: string;
  choices?: string[];
  required?: boolean;
  nullable?: boolean;
  allow_blank?: boolean;
};

type FieldUi = {
  section?: string;
  priority?: number;
  width?: "full" | "half" | "third" | string;
  placeholder?: string;
};

type ResourceField = {
  key: string;
  alias?: string;
  label?: string;
  type: FieldType;
  required: boolean;
  nullable: boolean;
  editable: boolean;
  readonly_on_update: boolean;
  visible_in_list: boolean;
  sortable: boolean;
  filterable: boolean;
  pii: boolean;
  write_only: boolean;
  help_text?: string;
  admin_control?: AdminControl | null;
  validation?: FieldValidation;
  ui?: FieldUi;
  i18n?: FieldI18n;
  option_source?: OptionSource;
  relation?: RelationDefinition;
  filter?: { operators?: FilterOperatorDefinition[] };
};

type DestructiveAction = {
  confirm?: boolean;
  tone?: "danger" | "warning" | "neutral" | string;
  label?: string;
  message?: string;
  i18n?: ActionI18n;
};

type ResourceNavigation = {
  group?: string;
  order?: number;
};

type RelatedListDefinition = {
  alias: string;
  label?: string;
  target_resource_alias: string;
  target_field: string;
  source_field: string;
  operator: string;
  i18n?: { label?: LocalizedText };
};

type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
};

type GridFilterItem = {
  field: string;
  operator: string;
  value?: JsonValue;
};

type GridFilterModel = {
  items: GridFilterItem[];
  quickFilterValues: string[];
  linkOperator: "and" | "or";
};

type FilterValueControl = {
  kind?: "field" | "none" | string;
  multiple?: boolean;
};

type FilterOperatorDefinition = {
  key: string;
  label: string;
  value_kind: "single" | "multiple" | "none" | string;
  field_types?: string[];
  value_control?: FilterValueControl;
  i18n?: { label?: LocalizedText };
};

type FilterControlReader = {
  element: HTMLElement;
  readValue: () => JsonValue | undefined;
  reset: () => void;
};

type ResourceSchema = {
  key: string;
  alias?: string;
  label?: string;
  plural_label?: string;
  fields: ResourceField[];
  page_size: number;
  destructive_actions?: Record<string, DestructiveAction>;
  actions?: ResourceActions;
  navigation?: ResourceNavigation;
  i18n?: ResourceI18n;
  related_lists?: RelatedListDefinition[];
};

type ResourceDiscoveryItem = {
  alias: string;
  i18n?: ResourceI18n;
};

type ResourcesResponse = {
  resources: ResourceDiscoveryItem[];
};

type PaginatedRecords = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ResourceRecord[];
};

type RelationOption = {
  value: string | number;
  label: string;
};

type OptionsResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  options: RelationOption[];
};

type TokenPair = {
  access: string;
  refresh: string;
};

type AuthUser = {
  username: string;
  first_name?: string;
  last_name?: string;
};

type AuthSession = {
  token: TokenPair;
  user: AuthUser;
};

type AppState = {
  resources: ResourceSchema[];
  selectedResourceKey: string | null;
  selectedWorkflow: WorkflowPage | null;
  resourceFilter: string;
  collapsedResourceGroups: Set<string>;
  resourceView: ResourceViewState | null;
  setupWorkbook: SetupWorkbookState;
  matrixEditor: MatrixEditorState;
  auditView: AuditViewState;
  resourceExposure: ResourceExposureState;
  loading: boolean;
  error: string | null;
  message: string | null;
  locale: Locale;
  theme: ThemeMode;
  toasts: Toast[];
  dbAdminAccessDenied: boolean;
};

type ResourceViewState = {
  schema: ResourceSchema;
  records: ResourceRecord[];
  count: number;
  page: number;
  pageSize: number;
  quickSearch: string;
  filterModel: GridFilterModel;
  sortField: string;
  sortDirection: "asc" | "desc";
  optionMaps: Record<string, Map<string, string>>;
  selectedIdentities: Set<string>;
  loading: boolean;
  error: string | null;
};

type SetupWorkbookColumnManifest = {
  key: string;
  label?: string;
  required?: boolean;
  help_text?: string;
  allowed_values?: string[];
  example?: string;
  lookup?: boolean;
  resource_field_key?: string;
  template_source?: string;
};

type SetupWorkbookSheetManifest = {
  key: string;
  title?: string;
  resource_key?: string;
  description?: string;
  columns?: SetupWorkbookColumnManifest[];
};

type SetupWorkbookManifest = {
  sheets?: SetupWorkbookSheetManifest[];
  workflows?: Record<string, unknown>;
  import?: Record<string, unknown>;
};

type SetupWorkbookIssue = {
  severity?: "error" | "warning" | string;
  code: string;
  sheet?: string;
  row?: number;
  column?: string;
  value?: JsonValue;
  message: string;
  omittable?: boolean;
  requires_confirmation?: boolean;
};

type SetupWorkbookStagedRow = {
  row_number: number;
  operation?: string;
  values?: Record<string, JsonValue>;
  corrected_values?: Record<string, JsonValue>;
};

type SetupWorkbookCellCorrection = {
  sheet: string;
  row_number: number;
  column: string;
  value: JsonValue;
};

type SetupWorkbookSheetResult = {
  sheet: string;
  title?: string;
  resource_key?: string;
  rows?: SetupWorkbookStagedRow[];
};

type SetupWorkbookDryRunResult = {
  status: "valid" | "invalid" | string;
  committed?: boolean;
  writes_performed?: boolean;
  summary?: Record<string, JsonValue>;
  sheets?: SetupWorkbookSheetResult[];
  errors?: SetupWorkbookIssue[];
  warnings?: SetupWorkbookIssue[];
  omittable_warning_codes?: string[];
  confirmable_warning_codes?: string[];
};

type SetupWorkbookCommitOperation = {
  sequence: number;
  sheet?: string;
  row_number?: number | null;
  resource_key?: string;
  action?: string;
  status?: string;
  record_identity?: string;
  before?: Record<string, JsonValue>;
  after?: Record<string, JsonValue>;
  warnings?: SetupWorkbookIssue[];
  errors?: SetupWorkbookIssue[];
  requires_confirmation?: boolean;
  skip_reason?: string;
};

type SetupWorkbookCommitPlan = {
  status: "ready" | "blocked" | string;
  commit_allowed?: boolean;
  business_writes_performed?: boolean;
  requires_transaction?: boolean;
  requires_audit_batch_before_writes?: boolean;
  summary?: Record<string, JsonValue>;
  rejected_reasons?: Array<{ code?: string; message?: string; [key: string]: unknown }>;
  warnings?: SetupWorkbookIssue[];
  operations?: SetupWorkbookCommitOperation[];
};

type SetupWorkbookState = {
  manifest: SetupWorkbookManifest | null;
  selectedFile: File | null;
  dryRunResult: SetupWorkbookDryRunResult | null;
  commitPlan: SetupWorkbookCommitPlan | null;
  omittedRows: Set<string>;
  confirmedWarningCodes: Set<string>;
  cellCorrections: Map<string, SetupWorkbookCellCorrection>;
  reason: string;
  loading: boolean;
  error: string | null;
};

type MatrixEditorDomain = "organization" | "institution";

type MatrixEditorUniverseResource = {
  resource_key: string;
  alias?: string;
  label?: string;
  exposure?: string;
  structured_editor_only?: boolean;
  actions?: Partial<Record<ResourceAction, boolean>>;
};

type MatrixEditorColumnGrantColumn = {
  key: string;
  alias?: string;
  label?: string;
  type?: string;
  pii?: boolean;
  write_only?: boolean;
};

type MatrixEditorColumnGrantAction = {
  action: string;
  row_scope_type?: string | null;
  columns?: MatrixEditorColumnGrantColumn[];
};

type MatrixEditorColumnGrantResource = {
  resource_key: string;
  alias?: string;
  label?: string;
  exposure?: string;
  structured_editor_only?: boolean;
  actions?: MatrixEditorColumnGrantAction[];
};

type MatrixEditorRowScopeType = {
  key: string;
  label?: string;
  description?: string;
  domain?: string;
  customer_configurable?: boolean;
  resource_key?: string;
  action?: string;
  [key: string]: JsonValue | undefined;
};

type MatrixEditorUniverse = {
  version?: number;
  domain: MatrixEditorDomain;
  api_name?: string;
  principal?: string;
  resources?: MatrixEditorUniverseResource[];
  role_type_bindings?: Record<string, JsonValue>;
  row_scope_types?: MatrixEditorRowScopeType[];
  column_grant_universe?: MatrixEditorColumnGrantResource[];
  forbidden_customer_features?: string[];
  role_mutation_status?: string;
};

type MatrixEditorIssue = {
  path?: string;
  message: string;
};

type MatrixEditorValidationResponse = {
  valid?: boolean;
  domain?: string;
  principal?: string;
  errors?: MatrixEditorIssue[];
  warnings?: MatrixEditorIssue[];
  mutation_status?: string;
};

type MatrixEditorPreviewResponse = {
  valid?: boolean;
  domain?: string;
  principal?: string;
  validation?: MatrixEditorValidationResponse;
  row_scope_value_preview?: JsonValue;
  column_grant_preview?: JsonValue;
  would_commit?: boolean;
  mutation_status?: string;
};

type MatrixEditorApplyResponse = {
  valid?: boolean;
  committed?: boolean;
  batch_id?: number | string;
  applied_count?: number;
  deferred_count?: number;
  mutation_status?: string;
  [key: string]: JsonValue | undefined;
};

type MatrixEditorResourceProposal = {
  resource_key: string;
  action: "create" | "update";
  record_identity?: string;
  after: Record<string, JsonValue>;
};

type MatrixEditorRowScopeValueProposal = {
  row_scope_type: string;
  values: Array<string | number | boolean>;
};

type MatrixEditorColumnGrantProposal = {
  resource_key: string;
  action: string;
  columns: string[];
};

type MatrixEditorProposalBody = {
  resources?: MatrixEditorResourceProposal[];
  api_entrypoints?: string[];
  row_scope_values?: MatrixEditorRowScopeValueProposal[];
  column_grants?: MatrixEditorColumnGrantProposal[];
};

type MatrixEditorPayload = {
  domain: MatrixEditorDomain;
  proposal: MatrixEditorProposalBody;
  reason?: string;
};

type MatrixEditorResourceDraft = {
  resource_key: string;
  action: "create" | "update";
  record_identity: string;
  after_json: string;
  error: string | null;
};

type MatrixEditorState = {
  domain: MatrixEditorDomain;
  universeByDomain: Partial<Record<MatrixEditorDomain, MatrixEditorUniverse>>;
  resourceDraft: MatrixEditorResourceDraft;
  resourceProposals: MatrixEditorResourceProposal[];
  apiEntrypointDraft: string;
  apiEntrypoints: string[];
  rowScopeValues: Map<string, string>;
  columnGrantSelections: Map<string, Set<string>>;
  validation: MatrixEditorValidationResponse | null;
  preview: MatrixEditorPreviewResponse | null;
  applyResult: MatrixEditorApplyResponse | null;
  reason: string;
  confirmDangerous: boolean;
  loading: boolean;
  error: string | null;
};

type AuditViewKind = "batches" | "events";

type AuditRecord = Record<string, JsonValue | undefined> & {
  id?: string | number;
  created_at?: string | null;
  occurred_at?: string | null;
  actor_username?: string;
  domain?: string;
  source?: string;
  status?: string;
  event_type?: string;
  operation_count?: number | null;
  request_id?: string;
  reason?: string;
  resource_key?: string;
  action?: string;
};

type AuditListResponse = {
  api_entrypoint?: string;
  domain?: string;
  scope?: Record<string, JsonValue>;
  limit?: number;
  offset?: number;
  count?: number;
  results?: AuditRecord[];
};

type AuditDetailResponse = {
  api_entrypoint?: string;
  domain?: string;
  scope?: Record<string, JsonValue>;
  result?: AuditRecord;
};

type AuditViewFilters = {
  status: string;
  source: string;
  domain: string;
  eventType: string;
  limit: string;
  offset: string;
};

type AuditViewState = {
  kind: AuditViewKind;
  filters: AuditViewFilters;
  list: AuditListResponse | null;
  detail: AuditDetailResponse | null;
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

type ResourceExposureManifestItem = {
  model: string;
  resource_key: string;
  exposure: string;
  register_resource: boolean;
  generic_discovery_eligible: boolean;
  inspection_mode: string;
  path: string;
  line: number;
};

type ResourceExposureManifest = {
  version?: number;
  owner?: string;
  workflow?: string;
  platform_only?: boolean;
  classification_ssot?: string;
  change_workflow?: string[];
  break_glass?: Record<string, JsonValue>;
  redacted_internal_resource_inspection?: Record<string, JsonValue>;
  counts_by_exposure?: Record<string, number>;
  resources?: ResourceExposureManifestItem[];
};

type ResourceExposureState = {
  manifest: ResourceExposureManifest | null;
  exposureFilter: string;
  query: string;
  loading: boolean;
  error: string | null;
};

type ApiErrorPayload = {
  detail?: string;
  message?: string;
  request_id?: string;
  [key: string]: unknown;
};

class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

const SURFACE = "db_admin";
const DEFAULT_PAGE_SIZE = 25;
const STORAGE_SESSION = "retrobolt.admin.session";
const STORAGE_LOCALE = "retrobolt.admin.locale";
const STORAGE_THEME = "retrobolt.admin.theme";
const STORAGE_COLLAPSED_RESOURCE_GROUPS = "retrobolt.admin.collapsedResourceGroups";
const RESOURCE_HASH_PREFIX = "#/resources/";
const SETUP_WORKBOOK_HASH = "#/setup-workbook";
const MATRIX_EDITOR_HASH = "#/matrix-editor";
const AUDIT_VIEW_HASH = "#/audit";
const RESOURCE_EXPOSURE_HASH = "#/resource-exposure";
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
  loading: false,
  error: null,
  message: null,
  locale: loadLocale(),
  theme: loadTheme(),
  toasts: [],
  dbAdminAccessDenied: false,
};

function emptySetupWorkbookState(): SetupWorkbookState {
  return {
    manifest: null,
    selectedFile: null,
    dryRunResult: null,
    commitPlan: null,
    omittedRows: new Set<string>(),
    confirmedWarningCodes: new Set<string>(),
    cellCorrections: new Map<string, SetupWorkbookCellCorrection>(),
    reason: "",
    loading: false,
    error: null,
  };
}

function emptyMatrixEditorResourceDraft(): MatrixEditorResourceDraft {
  return {
    resource_key: "",
    action: "create",
    record_identity: "",
    after_json: "{}",
    error: null,
  };
}

function emptyMatrixEditorState(): MatrixEditorState {
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

function emptyAuditViewState(): AuditViewState {
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

function emptyResourceExposureState(): ResourceExposureState {
  return {
    manifest: null,
    exposureFilter: "",
    query: "",
    loading: false,
    error: null,
  };
}

function loadCollapsedResourceGroups(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_COLLAPSED_RESOURCE_GROUPS) || "[]");
    return new Set(Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

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

function loadLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_LOCALE);
  if (stored === "en" || stored === "es") return stored;
  return "es";
}

function setLocale(locale: Locale): void {
  state.locale = locale;
  localStorage.setItem(STORAGE_LOCALE, locale);
}

function loadTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_THEME);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
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

const UI_TEXT: Record<string, Record<Locale, string>> = {
  login_title: { es: "Administración de Base de Datos", en: "Database Administration" },
  welcome_message: {es: "Bienvenido a la interfaz de administración de base de datos.", en: "Welcome to the database administration interface." },
  username: { es: "Usuario", en: "Username" },
  password: { es: "Contraseña", en: "Password" },
  sign_in: { es: "Ingresar", en: "Sign in" },
  signing_in: { es: "Ingresando...", en: "Signing in..." },
  login_failed: { es: "No se pudo iniciar sesión.", en: "Login failed." },
  language: { es: "Idioma", en: "Language" },
  theme: { es: "Tema", en: "Theme" },
  english: { es: "Inglés", en: "English" },
  spanish: { es: "Español", en: "Spanish" },
  light: { es: "Claro", en: "Light" },
  dark: { es: "Oscuro", en: "Dark" },
  filter_resources: { es: "Filtrar recursos...", en: "Filter resources..." },
  resources: { es: "Recursos", en: "Resources" },
  no_resources_match: { es: "No hay recursos que coincidan.", en: "No resources match." },
  collapse_group: { es: "Colapsar grupo", en: "Collapse group" },
  expand_group: { es: "Expandir grupo", en: "Expand group" },
  create_resource: { es: "Crear", en: "Create" },
  
  refresh_resources: { es: "Actualizar recursos", en: "Refresh resources" },
  sign_out: { es: "Salir", en: "Sign out" },
  admin_title: { es: "Retrobolt Admin", en: "Retrobolt Admin" },
  db_admin_required: { es: "Se requiere acceso DB Admin", en: "DB Admin access required" },
  db_admin_required_message: {
    es: "está autenticado, pero el backend no habilitó la superficie DB Admin para esta sesión.",
    en: "is authenticated, but the backend did not enable the DB Admin surface for this session.",
  },
  loading_admin_resources: { es: "Cargando recursos de administración...", en: "Loading admin resources..." },
  loading_resource: { es: "Cargando recurso...", en: "Loading resource..." },
  retry: { es: "Reintentar", en: "Retry" },
  empty_resources_title: { es: "No se devolvieron recursos DB Admin", en: "No DB Admin resources returned" },
  empty_resources_message: {
    es: "El backend habilitó la superficie DB Admin pero no devolvió recursos expuestos para esta sesión.",
    en: "The backend enabled the DB Admin surface but did not return exposed resources for this session.",
  },
  refresh_resource: { es: "Actualizar", en: "Refresh" },
  delete_selected: { es: "Eliminar seleccionados", en: "Delete selected" },
  quick_search: { es: "Búsqueda rápida", en: "Quick search" },
  rows: { es: "Filas", en: "Rows" },
  loading_records: { es: "Cargando registros...", en: "Loading records..." },
  clear_filters: { es: "Limpiar filtros", en: "Clear filters" },
  filtered_notice: { es: "Esta lista está filtrada con metadatos de filtros definidos por el backend.", en: "This list is filtered with backend-declared filter metadata." },
  dependent_relation_notice: { es: "Este esquema declara selectores dependientes. El formulario carga opciones hijas con filtros definidos por el backend cuando cambian los valores padre.", en: "This schema declares dependent selectors. The form loads child options with filters defined by the backend when parent values change." },
  no_filterable_fields: { es: "No hay campos filtrables definidos por el backend para este recurso.", en: "No backend-declared filterable fields for this resource." },
  no_column_filters: { es: "No hay filtros de columna.", en: "No column filters." },
  remove_filter: { es: "Quitar filtro", en: "Remove filter" },
  filter_link_operator: { es: "Operador entre filtros", en: "Filter link operator" },
  add_filter: { es: "Agregar filtro", en: "Add filter" },
  column_filters: { es: "Filtros de columna", en: "Column filters" },
  filter_builder_help: { es: "Solo campos, operadores y controles declarados por el backend", en: "Backend-declared fields, operators, and value controls only" },
  no_value: { es: "Sin valor", en: "No value" },
  select_value: { es: "Seleccionar valor...", en: "Select value..." },
  comma_values: { es: "Valores separados por coma", en: "Comma-separated values" },
  value: { es: "Valor", en: "Value" },
  true: { es: "Verdadero", en: "True" },
  false: { es: "Falso", en: "False" },
  no_records_returned: { es: "No se devolvieron registros.", en: "No records returned." },
  actions: { es: "Acciones", en: "Actions" },
  view: { es: "Ver", en: "View" },
  edit: { es: "Editar", en: "Edit" },
  delete: { es: "Eliminar", en: "Delete" },
  previous: { es: "Anterior", en: "Previous" },
  next: { es: "Siguiente", en: "Next" },
  page: { es: "Página", en: "Page" },
  records: { es: "registros", en: "records" },
  loading_form: { es: "Cargando formulario...", en: "Loading form..." },
  close: { es: "Cerrar", en: "Close" },
  cancel: { es: "Cancelar", en: "Cancel" },
  save: { es: "Guardar", en: "Save" },
  creating: { es: "Creando...", en: "Creating..." },
  saving: { es: "Guardando...", en: "Saving..." },
  created: { es: "creado", en: "created" },
  updated: { es: "actualizado", en: "updated" },
  deleted: { es: "eliminado", en: "deleted" },
  selected_deleted: { es: "seleccionados eliminados", en: "selected deleted" },
  save_failed: { es: "No se pudo guardar.", en: "Failed to save." },
  delete_failed: { es: "No se pudo eliminar.", en: "Failed to delete." },
  batch_delete_failed: { es: "No se pudo eliminar la selección.", en: "Failed to delete the selection." },
  load_resources_failed: { es: "No se pudieron cargar los recursos.", en: "Failed to load resources." },
  load_resource_failed: { es: "No se pudo cargar el recurso.", en: "Failed to load resource." },
  load_records_failed: { es: "No se pudieron cargar los registros.", en: "Failed to load records." },
  load_form_failed: { es: "No se pudo cargar el formulario.", en: "Failed to load form." },
  fix_highlighted_fields: { es: "Corregí los campos marcados antes de guardar.", en: "Fix the highlighted fields before saving." },
  valid_json_required: { es: "debe ser JSON válido.", en: "must be valid JSON." },
  required: { es: "Requerido", en: "Required" },
  min_chars: { es: "mín {value} caracteres", en: "min {value} chars" },
  max_chars: { es: "máx {value} caracteres", en: "max {value} chars" },
  min_number: { es: "mín {value}", en: "min {value}" },
  max_number: { es: "máx {value}", en: "max {value}" },
  decimal_places: { es: "{value} decimales", en: "{value} decimals" },
  search_field_options: { es: "Buscar opciones de {field}", en: "Search {field} options" },
  email_format: { es: "formato email", en: "email format" },
  valid_json: { es: "JSON válido", en: "valid JSON" },
  must_match_pattern: { es: "debe coincidir con el patrón", en: "must match pattern" },
  expected_pattern: { es: "Patrón esperado", en: "Expected pattern" },
  search_options: { es: "Buscar opciones...", en: "Search options..." },
  select_dependencies_first: { es: "Seleccioná primero las dependencias", en: "Select the dependencies first" },
  no_options_match: { es: "No hay opciones que coincidan", en: "No options match" },
  yes: { es: "Sí", en: "Yes" },
  no: { es: "No", en: "No" },
  all: { es: "Todos", en: "All" },
  sort_by_field: { es: "Ordenar por este campo", en: "Sort by this field" },
  sorting_not_declared: { es: "Ordenamiento no declarado para este campo", en: "Sorting not declared for this field" },
  details: { es: "detalle", en: "details" },
  open_related: { es: "Abrir", en: "Open" },
  related_unavailable: { es: "El recurso relacionado no está disponible.", en: "Related resource is not available." },
  delete_this: { es: "Eliminar", en: "Delete this" },
  setup_workbook: { es: "Setup anual", en: "Yearly setup" },
  setup_workbook_title: { es: "Importación anual por workbook", en: "Yearly setup workbook import" },
  setup_workbook_subtitle: {
    es: "Descargá la plantilla, subí el archivo completado y revisá errores, advertencias y cambios antes de confirmar.",
    en: "Download the template, upload the completed file, and review errors, warnings, and changes before commit.",
  },
  download_template: { es: "Descargar plantilla", en: "Download template" },
  choose_workbook: { es: "Elegir workbook", en: "Choose workbook" },
  run_dry_run: { es: "Validar sin guardar", en: "Validate without saving" },
  build_preview: { es: "Crear preview final", en: "Build final preview" },
  workbook_manifest_failed: { es: "No se pudo cargar el manifiesto del workbook.", en: "Failed to load workbook manifest." },
  workbook_template_failed: { es: "No se pudo descargar la plantilla.", en: "Failed to download template." },
  workbook_dry_run_failed: { es: "No se pudo validar el workbook.", en: "Failed to validate workbook." },
  workbook_commit_plan_failed: { es: "No se pudo crear el preview final.", en: "Failed to build final preview." },
  workbook_select_file: { es: "Seleccioná un archivo XLSX primero.", en: "Select an XLSX file first." },
  workbook_summary: { es: "Resumen", en: "Summary" },
  workbook_issues: { es: "Errores y advertencias", en: "Errors and warnings" },
  workbook_no_issues: { es: "No hay errores ni advertencias.", en: "No errors or warnings." },
  workbook_cell_fixes: { es: "Correcciones de celdas", en: "Cell fixes" },
  workbook_cell_fixes_help: {
    es: "Editá valores seguros y volvé a validar; el backend aplica estas correcciones antes de validar y crear el preview.",
    en: "Edit safe values and validate again; the backend applies these corrections before validation and preview generation.",
  },
  workbook_changed_cells: { es: "Celdas corregidas", en: "Corrected cells" },
  workbook_rows: { es: "Filas detectadas", en: "Detected rows" },
  workbook_preview: { es: "Preview final", en: "Final preview" },
  workbook_operations: { es: "Operaciones", en: "Operations" },
  workbook_confirm_warning: { es: "Confirmar advertencia", en: "Confirm warning" },
  workbook_omit_row: { es: "Omitir esta fila", en: "Omit this row" },
  workbook_reason: { es: "Motivo o nota de auditoría", en: "Reason or audit note" },
  workbook_no_preview: { es: "Ejecutá la validación para ver el preview.", en: "Run validation to see the preview." },
  workbook_plan_blocked: { es: "El preview está bloqueado.", en: "The preview is blocked." },
  workbook_plan_ready: { es: "El preview está listo para auditoría/commit runtime.", en: "The preview is ready for runtime audit/commit." },
  workbook_no_business_writes: { es: "Esta pantalla no ejecuta escrituras de negocio.", en: "This screen does not execute business writes." },
  workflows: { es: "Flujos", en: "Workflows" },
  matrix_editor: { es: "Editor de matriz", en: "Matrix editor" },
  matrix_editor_title: { es: "Editor estructurado de roles y matriz", en: "Structured role and matrix editor" },
  matrix_editor_subtitle: {
    es: "Cargá el universo permitido por el backend, prepará cambios de roles/asignaciones/alcances y revisá el preview efectivo antes de aplicar con auditoría.",
    en: "Load the backend-approved universe, prepare role/assignment/scope changes, and review the effective preview before audit-first apply.",
  },
  matrix_domain: { es: "Dominio", en: "Domain" },
  organization_domain: { es: "Organización", en: "Organization" },
  institution_domain: { es: "Institución", en: "Institution" },
  load_universe: { es: "Cargar universo", en: "Load universe" },
  matrix_universe: { es: "Universo editable", en: "Editable universe" },
  matrix_universe_failed: { es: "No se pudo cargar el universo del editor.", en: "Failed to load matrix editor universe." },
  matrix_validate_failed: { es: "No se pudo validar la propuesta.", en: "Failed to validate matrix proposal." },
  matrix_preview_failed: { es: "No se pudo crear el preview de permisos.", en: "Failed to build permissions preview." },
  matrix_apply_failed: { es: "No se pudo aplicar la propuesta auditada.", en: "Failed to apply audited proposal." },
  matrix_resource_operations: { es: "Cambios de rol/asignación", en: "Role and assignment changes" },
  matrix_resource: { es: "Recurso estructurado", en: "Structured resource" },
  matrix_action: { es: "Acción", en: "Action" },
  matrix_record_identity: { es: "Identidad del registro", en: "Record identity" },
  matrix_after_json: { es: "Payload after JSON", en: "After payload JSON" },
  matrix_add_operation: { es: "Agregar cambio", en: "Add change" },
  matrix_no_operations: { es: "No hay cambios agregados.", en: "No changes added." },
  matrix_api_entrypoints: { es: "Entrypoints API permitidos", en: "Allowed API entrypoints" },
  matrix_api_entrypoints_help: {
    es: "Solo se aceptan nombres del dominio activo; la validación backend sigue siendo la fuente autoritativa.",
    en: "Only names from the active domain are accepted; backend validation remains authoritative.",
  },
  matrix_add_api: { es: "Agregar API", en: "Add API" },
  matrix_column_grants: { es: "Columnas permitidas", en: "Allowed columns" },
  matrix_column_grants_help: {
    es: "Elegí subconjuntos de columnas desde el universo publicado por el backend para cada recurso/acción permitida.",
    en: "Choose column subsets from the backend-published universe for each allowed resource/action.",
  },
  matrix_no_column_grants: { es: "El backend no publicó columnas configurables para este dominio.", en: "The backend did not publish configurable columns for this domain." },
  matrix_row_scope_type: { es: "Alcance", en: "Scope" },
  matrix_row_scopes: { es: "Alcances de fila", en: "Row scopes" },
  matrix_row_scopes_help: {
    es: "Ingresá valores concretos separados por coma para los tipos de alcance configurables publicados por el backend.",
    en: "Enter comma-separated concrete values for backend-published configurable scope types.",
  },
  matrix_reason: { es: "Motivo de auditoría", en: "Audit reason" },
  matrix_validate: { es: "Validar", en: "Validate" },
  matrix_preview: { es: "Preview efectivo", en: "Effective preview" },
  matrix_apply: { es: "Aplicar con auditoría", en: "Apply with audit" },
  matrix_confirm_apply: {
    es: "Confirmo que estos cambios pueden crear/actualizar roles, asignaciones o alcances y deben pasar por auditoría antes de guardar.",
    en: "I confirm these changes may create/update roles, assignments, or scopes and must be audited before saving.",
  },
  matrix_validation: { es: "Validación", en: "Validation" },
  matrix_preview_result: { es: "Preview", en: "Preview" },
  matrix_apply_result: { es: "Resultado de aplicación", en: "Apply result" },
  matrix_valid: { es: "Válido", en: "Valid" },
  matrix_invalid: { es: "Inválido", en: "Invalid" },
  matrix_warning_audit: { es: "Se aplicará por el contrato audit-first del backend.", en: "This uses the backend audit-first contract." },
  matrix_scope_value_placeholder: { es: "1, 2, codigo", en: "1, 2, code" },
  matrix_api_placeholder: { es: "db_admin.matrix_editor.organization.validate", en: "db_admin.matrix_editor.organization.validate" },
  audit_view: { es: "Auditoría", en: "Audit" },
  audit_view_title: { es: "Vistas de auditoría DB Admin", en: "DB Admin audit views" },
  audit_view_subtitle: {
    es: "Revisá lotes de mutación y eventos de auditoría mediante las APIs filtradas por matriz; no se exponen tablas crudas.",
    en: "Review mutation batches and audit events through matrix-scoped APIs; raw audit tables are not exposed.",
  },
  audit_batches: { es: "Lotes", en: "Batches" },
  audit_events: { es: "Eventos", en: "Events" },
  audit_status: { es: "Estado", en: "Status" },
  audit_source: { es: "Fuente", en: "Source" },
  audit_domain: { es: "Dominio", en: "Domain" },
  audit_event_type: { es: "Tipo de evento", en: "Event type" },
  audit_limit: { es: "Límite", en: "Limit" },
  audit_offset: { es: "Offset", en: "Offset" },
  audit_load_failed: { es: "No se pudo cargar la auditoría.", en: "Failed to load audit records." },
  audit_detail_failed: { es: "No se pudo cargar el detalle de auditoría.", en: "Failed to load audit detail." },
  audit_no_records: { es: "No hay registros de auditoría para estos filtros.", en: "No audit records for these filters." },
  audit_filters: { es: "Filtros", en: "Filters" },
  audit_scope: { es: "Alcance aplicado", en: "Applied scope" },
  audit_count: { es: "Total", en: "Total" },
  audit_operation_count: { es: "Operaciones", en: "Operations" },
  audit_actor: { es: "Actor", en: "Actor" },
  audit_time: { es: "Fecha", en: "Time" },
  audit_reason: { es: "Motivo", en: "Reason" },
  audit_request_id: { es: "Request ID", en: "Request ID" },
  audit_detail: { es: "Detalle", en: "Detail" },
  audit_redacted_notice: { es: "Los payloads se muestran con las redacciones del backend.", en: "Payloads are shown with backend-provided redactions." },
  resource_exposure: { es: "Exposición de recursos", en: "Resource exposure" },
  resource_exposure_title: { es: "Inspección de exposición de recursos", en: "Resource exposure inspection" },
  resource_exposure_subtitle: {
    es: "Revisá el manifiesto platform-only de clasificaciones ResourceMeta sin exponer tablas internas como CRUD genérico.",
    en: "Review the platform-only ResourceMeta classification manifest without exposing internal tables as generic CRUD.",
  },
  resource_exposure_load_failed: { es: "No se pudo cargar el manifiesto de exposición.", en: "Failed to load resource exposure manifest." },
  resource_exposure_counts: { es: "Conteos por exposición", en: "Counts by exposure" },
  resource_exposure_redaction: { es: "Redacción interna", en: "Internal redaction" },
  resource_exposure_filter: { es: "Filtrar exposición", en: "Filter exposure" },
  resource_exposure_query: { es: "Buscar modelo/recurso/ruta", en: "Search model/resource/path" },
  resource_exposure_manifest: { es: "Manifiesto", en: "Manifest" },
  resource_exposure_no_resources: { es: "No hay recursos para estos filtros.", en: "No resources match these filters." },
  resource_exposure_platform_only: { es: "Solo plataforma", en: "Platform only" },
};

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

function configApiBaseUrl(): string {
  return window.__RETROBOLT_ADMIN_CONFIG__?.apiBaseUrl ?? "";
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const base = trimTrailingSlash(configApiBaseUrl());
  if (base.toLowerCase().endsWith("/api") && path.startsWith("/api/")) {
    return `${base}${path.slice(4)}`;
  }
  return `${base}${path}`;
}

function resourceSchemaPath(resourceKey: string): string {
  return `/api/resources/${encodeURIComponent(resourceKey)}/?surface=${SURFACE}`;
}

function resourceListPath(schema: ResourceSchema, params: Record<string, string> = {}): string {
  return withQueryParams(`/api/resources/${encodeURIComponent(schema.key)}/records/?surface=${SURFACE}`, params);
}

function resourceCreatePath(schema: ResourceSchema): string {
  return `/api/resources/${encodeURIComponent(schema.key)}/records/?surface=${SURFACE}`;
}

function resourceBatchDeletePath(schema: ResourceSchema): string {
  return `/api/resources/${encodeURIComponent(schema.key)}/records/?surface=${SURFACE}`;
}

function resourceOptionsPath(schema: ResourceSchema, fieldKey: string, params: Record<string, string> = {}): string {
  return withQueryParams(`/api/resources/${encodeURIComponent(schema.key)}/options/${encodeURIComponent(fieldKey)}/?surface=${SURFACE}`, params);
}

function parseResourceHash(): { resourceKey: string | null; params: URLSearchParams } {
  if (!location.hash.startsWith(RESOURCE_HASH_PREFIX)) {
    return { resourceKey: null, params: new URLSearchParams() };
  }
  const rest = location.hash.slice(RESOURCE_HASH_PREFIX.length);
  const separator = rest.indexOf("?");
  const rawKey = separator === -1 ? rest : rest.slice(0, separator);
  const rawQuery = separator === -1 ? "" : rest.slice(separator + 1);
  return {
    resourceKey: rawKey ? decodeURIComponent(rawKey) : null,
    params: new URLSearchParams(rawQuery),
  };
}

function resourceHash(resourceKey: string, params: URLSearchParams = new URLSearchParams()): string {
  const query = params.toString();
  return `${RESOURCE_HASH_PREFIX}${encodeURIComponent(resourceKey)}${query ? `?${query}` : ""}`;
}

function replaceResourceHash(resourceKey: string, params: URLSearchParams = new URLSearchParams()): void {
  const desiredHash = resourceHash(resourceKey, params);
  if (location.hash !== desiredHash) {
    history.replaceState(null, "", desiredHash);
  }
}

function withQueryParams(path: string, extraParams: Record<string, string> = {}): string {
  const [base, query = ""] = path.split("?");
  if (base === undefined) {
    throw new Error("Invalid API path.");
  }
  const params = new URLSearchParams(query);
  for (const [key, value] of Object.entries(extraParams)) {
    if (value !== "") {
      params.set(key, value);
    }
  }
  const serialized = params.toString();
  return `${base}${serialized ? `?${serialized}` : ""}`;
}

function withSurface(path: string, extraParams: Record<string, string> = {}): string {
  return withQueryParams(path, { surface: SURFACE, ...extraParams });
}

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_SESSION);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      parsed.token &&
      typeof parsed.token.access === "string" &&
      typeof parsed.token.refresh === "string" &&
      parsed.user &&
      typeof parsed.user.username === "string"
    ) {
      return parsed as AuthSession;
    }
  } catch {
    // Ignore malformed storage and force login.
  }
  localStorage.removeItem(STORAGE_SESSION);
  return null;
}

function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_SESSION);
}


async function refreshAccessToken(): Promise<boolean> {
  const session = readSession();
  if (!session) {
    return false;
  }

  const response = await fetch(apiUrl("/api/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: session.token.refresh }),
  });

  if (!response.ok) {
    clearSession();
    return false;
  }

  const payload = (await response.json()) as { access?: string; refresh?: string };
  if (typeof payload.access !== "string") {
    clearSession();
    return false;
  }

  saveSession({
    ...session,
    token: {
      access: payload.access,
      refresh: typeof payload.refresh === "string" ? payload.refresh : session.token.refresh,
    },
  });
  return true;
}

async function authorizedFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const session = readSession();
  const headers = new Headers(init.headers);
  if (session) {
    headers.set("Authorization", `Bearer ${session.token.access}`);
  }
  if (hasJsonRequestBody(init.body) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), { ...init, headers });
  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return authorizedFetch(path, init, false);
  }

  if (!response.ok) {
    throw new ApiRequestError(await responseErrorMessage(response), response.status);
  }

  return response;
}

function hasJsonRequestBody(body: BodyInit | null | undefined): boolean {
  if (!body) {
    return false;
  }
  return !(body instanceof FormData || body instanceof Blob || body instanceof URLSearchParams);
}

async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const response = await authorizedFetch(path, init, retry);

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function apiFetchBlob(path: string, init: RequestInit = {}, retry = true): Promise<Blob> {
  const response = await authorizedFetch(path, init, retry);
  return response.blob();
}

async function responseErrorMessage(response: Response): Promise<string> {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  const message = payload?.detail
    || payload?.message
    || (payload ? flattenApiError(payload) : `${response.status} ${response.statusText}`);
  const requestId = payload?.request_id || response.headers.get("X-Request-ID");
  return requestId ? `${message}
Request ID: ${requestId}` : message;
}

function flattenApiError(payload: ApiErrorPayload): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
    if (key === "request_id") {
      continue;
    }
    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.join(", ")}`);
    } else if (value && typeof value === "object") {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    } else if (value !== undefined) {
      lines.push(`${key}: ${String(value)}`);
    }
  }
  return lines.join("\n") || "Request failed.";
}

function defaultFilterModel(): GridFilterModel {
  return { items: [], quickFilterValues: [], linkOperator: "and" };
}

function parseFilterModel(raw: string | null): GridFilterModel {
  if (!raw) {
    return defaultFilterModel();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<GridFilterModel>;
    return {
      items: Array.isArray(parsed.items)
        ? parsed.items.filter((item) => typeof item.field === "string" && typeof item.operator === "string") as GridFilterItem[]
        : [],
      quickFilterValues: Array.isArray(parsed.quickFilterValues)
        ? parsed.quickFilterValues.map((value) => String(value)).filter(Boolean)
        : [],
      linkOperator: parsed.linkOperator === "or" ? "or" : "and",
    };
  } catch {
    return defaultFilterModel();
  }
}

function filterModelWithQuickSearch(filterModel: GridFilterModel, value: string): GridFilterModel {
  return {
    ...filterModel,
    quickFilterValues: value ? [value] : [],
  };
}

function hasActiveFilters(view: ResourceViewState): boolean {
  return view.filterModel.items.length > 0 || view.filterModel.quickFilterValues.length > 0;
}

function filterModelForRequest(view: ResourceViewState): GridFilterModel {
  return filterModelWithQuickSearch(view.filterModel, view.quickSearch);
}

function hasFilterPayload(filterModel: GridFilterModel): boolean {
  return filterModel.items.length > 0 || filterModel.quickFilterValues.length > 0;
}

function filterableFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => field.filterable && !field.write_only);
}

function operatorsForField(schema: ResourceSchema, field: ResourceField): FilterOperatorDefinition[] {
  return field.filter?.operators ?? [];
}

function operatorLabel(operator: FilterOperatorDefinition): string {
  return localizedText(operator.label || operator.key, operator.i18n?.label);
}

function operatorNeedsValue(operator: FilterOperatorDefinition | undefined): boolean {
  return (operator?.value_kind ?? "single") !== "none";
}


function sanitizeFilterModel(schema: ResourceSchema, filterModel: GridFilterModel): GridFilterModel {
  const fieldsByKey = new Map(filterableFields(schema).map((field) => [field.key, field]));
  const items = filterModel.items.filter((item) => {
    const field = fieldsByKey.get(item.field);
    if (!field) return false;
    return operatorsForField(schema, field).some((operator) => operator.key === item.operator);
  });
  return {
    items,
    quickFilterValues: filterModel.quickFilterValues,
    linkOperator: filterModel.linkOperator,
  };
}

function sanitizeSortState(schema: ResourceSchema, sort: { sortField: string; sortDirection: "asc" | "desc" }): { sortField: string; sortDirection: "asc" | "desc" } {
  if (!sort.sortField) return sort;
  return schema.fields.some((field) => field.key === sort.sortField && field.sortable)
    ? sort
    : { sortField: "", sortDirection: "asc" };
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseSortState(raw: string | null): { sortField: string; sortDirection: "asc" | "desc" } {
  if (!raw) {
    return { sortField: "", sortDirection: "asc" };
  }
  try {
    const parsed = JSON.parse(raw) as Array<{ field?: string; sort?: string }>;
    const [first] = Array.isArray(parsed) ? parsed : [];
    if (first && typeof first.field === "string") {
      return {
        sortField: first.field,
        sortDirection: first.sort === "desc" ? "desc" : "asc",
      };
    }
  } catch {
    // Ignore invalid URL state.
  }
  return { sortField: "", sortDirection: "asc" };
}

function resourceViewParams(view: ResourceViewState): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(view.page));
  params.set("page_size", String(view.pageSize));
  const filterModel = filterModelForRequest(view);
  if (hasFilterPayload(filterModel)) {
    params.set("filters", JSON.stringify(filterModel));
  }
  if (view.sortField) {
    params.set("sort", JSON.stringify([{ field: view.sortField, sort: view.sortDirection }]));
  }
  return params;
}

function syncResourceViewHash(view: ResourceViewState): void {
  replaceResourceHash(view.schema.key, resourceViewParams(view));
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number | boolean | null | undefined> = {},
  children: Array<Node | string | number | null | undefined> = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }
    if (key === "class") {
      node.className = String(value);
    } else if (key === "dataset") {
      continue;
    } else if (value === true) {
      node.setAttribute(key, "");
    } else {
      node.setAttribute(key, String(value));
    }
  }
  appendChildren(node, children);
  return node;
}

function appendChildren(parent: Node, children: Array<Node | string | number | null | undefined>): void {
  for (const child of children) {
    if (child === null || child === undefined) {
      continue;
    }
    parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

function clear(node: Element): void {
  while (node.firstChild) {
    node.firstChild.remove();
  }
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
  const region = el("div", { class: "toast-region", role: "status", "aria-live": "polite" });
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
    name: "username",
    autocomplete: "username",
    required: true,
    placeholder: t("username"),
  });
  const passwordInput = el("input", {
    class: "input",
    name: "password",
    type: "password",
    autocomplete: "current-password",
    required: true,
    placeholder: t("password"),
  });
  const errorBox = el("div", { class: "error", hidden: true });
  const submit = el("button", { class: "button primary", type: "submit" }, [t("sign_in")]);

  const form = el("form", { class: "stack" }, [
    fieldShell(t("username"), usernameInput),
    fieldShell(t("password"), passwordInput),
    errorBox,
    submit,
  ]);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void handleLogin(form, submit, errorBox);
  });

  return el("main", { class: "login-page" }, [
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
    errorBox.textContent = error instanceof Error ? error.message : t("login_failed");
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

  return el("main", { class: "login-page" }, [
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
  const shell = el("div", { class: "app-shell" });
  shell.append(renderSidebar(session));
  shell.append(renderMain());
  shell.append(renderToastRegion());
  return shell;
}

function renderSidebar(session: AuthSession): HTMLElement {
  const filterInput = el("input", {
    class: "resource-filter",
    placeholder: t("filter_resources"),
    value: state.resourceFilter,
  });
  filterInput.addEventListener("input", () => {
    state.resourceFilter = filterInput.value;
    render();
  });

  const nav = el("nav", { class: "resource-nav", "aria-label": t("resources") });
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

  const workflowNav = el("nav", { class: "resource-nav workflow-nav", "aria-label": t("workflows") });
  const setupWorkbookButton = el("button", {
    class: state.selectedWorkflow === "setup_workbook" ? "active" : "",
    type: "button",
  }, [t("setup_workbook")]);
  setupWorkbookButton.addEventListener("click", () => {
    void selectSetupWorkbookPage();
  });
  const matrixEditorButton = el("button", {
    class: state.selectedWorkflow === "matrix_editor" ? "active" : "",
    type: "button",
  }, [t("matrix_editor")]);
  matrixEditorButton.addEventListener("click", () => {
    void selectMatrixEditorPage();
  });
  const auditViewButton = el("button", {
    class: state.selectedWorkflow === "audit_view" ? "active" : "",
    type: "button",
  }, [t("audit_view")]);
  auditViewButton.addEventListener("click", () => {
    void selectAuditViewPage();
  });
  const resourceExposureButton = el("button", {
    class: state.selectedWorkflow === "resource_exposure" ? "active" : "",
    type: "button",
  }, [t("resource_exposure")]);
  resourceExposureButton.addEventListener("click", () => {
    void selectResourceExposurePage();
  });
  workflowNav.append(setupWorkbookButton, matrixEditorButton, auditViewButton, resourceExposureButton);

  const refresh = el("button", { class: "logout", type: "button" }, [t("refresh_resources")]);
  refresh.addEventListener("click", () => {
    void loadResources();
  });

  const logout = el("button", { class: "logout", type: "button" }, [t("sign_out")]);
  logout.addEventListener("click", () => {
    clearSession();
    state.resources = [];
    state.selectedResourceKey = null;
    state.resourceView = null;
    state.dbAdminAccessDenied = false;
    render();
  });

  return el("aside", { class: "sidebar" }, [
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
  const main = el("main", { class: "main" });
  if (state.loading) {
    main.append(renderLoadingPage(t("loading_admin_resources")));
    return main;
  }
  if (state.error) {
    main.append(renderErrorPage(state.error));
    return main;
  }
  if (state.selectedWorkflow === "setup_workbook") {
    main.append(renderSetupWorkbookPage());
    return main;
  }
  if (state.selectedWorkflow === "matrix_editor") {
    main.append(renderMatrixEditorPage());
    return main;
  }
  if (state.selectedWorkflow === "audit_view") {
    main.append(renderAuditViewPage());
    return main;
  }
  if (state.selectedWorkflow === "resource_exposure") {
    main.append(renderResourceExposurePage());
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
  if (!state.resourceView || state.resourceView.schema.key !== state.selectedResourceKey) {
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

function renderResourcePage(view: ResourceViewState): HTMLElement {
  const schema = view.schema;
  const createButton = el("button", { class: "button primary", type: "button" }, [t("create_resource")]);
  createButton.disabled = !canResourceAction(schema, "create") || editableFields(schema, true).length === 0;
  createButton.addEventListener("click", () => openRecordForm(schema, "create"));

  const refreshButton = el("button", { class: "button", type: "button" }, [t("refresh_resource")]);
  refreshButton.addEventListener("click", () => {
    void reloadResourceView();
  });

  const batchAction = schema.destructive_actions?.batch_delete;
  const batchDeleteButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: canResourceAction(schema, "batch_delete") && view.selectedIdentities.size > 0 ? null : true,
  }, [actionLabel(batchAction, `${t("delete_selected")} (${view.selectedIdentities.size})`)]);
  batchDeleteButton.addEventListener("click", () => {
    if (view.selectedIdentities.size > 0) {
      void batchDeleteRecords(view);
    }
  });

  const quickSearch = el("input", {
    class: "input search",
    placeholder: t("quick_search"),
    value: view.quickSearch,
  });
  quickSearch.addEventListener("change", () => {
    view.quickSearch = quickSearch.value.trim();
    view.filterModel = filterModelWithQuickSearch(view.filterModel, view.quickSearch);
    view.page = 1;
    void reloadResourceView();
  });

  const pageSize = el("select", { class: "select small" });
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

  return el("section", { class: "stack" }, [
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
    renderFilterBuilder(view),
    view.loading ? renderLoadingPage(t("loading_records")) : renderRecordsTable(view),
    renderPagination(view),
  ]);
}


function renderAuditViewPage(): HTMLElement {
  if (!state.auditView.list && !state.auditView.loading) {
    void loadAuditViewList();
  }

  const kindSelect = el("select", { class: "select", "aria-label": t("audit_view") });
  for (const kind of ["batches", "events"] as AuditViewKind[]) {
    kindSelect.append(el("option", { value: kind, selected: state.auditView.kind === kind ? true : null }, [kind === "batches" ? t("audit_batches") : t("audit_events")]));
  }
  kindSelect.addEventListener("change", () => {
    const nextKind: AuditViewKind = kindSelect.value === "events" ? "events" : "batches";
    if (state.auditView.kind === nextKind) {
      return;
    }
    state.auditView.kind = nextKind;
    state.auditView.list = null;
    state.auditView.detail = null;
    state.auditView.selectedId = null;
    state.auditView.filters.offset = "0";
    state.auditView.error = null;
    render();
    void loadAuditViewList();
  });

  const loadButton = el("button", { class: "button", type: "button", disabled: state.auditView.loading ? true : null }, [t("refresh_resource")]);
  loadButton.addEventListener("click", () => {
    state.auditView.filters.offset = "0";
    void loadAuditViewList();
  });

  const notices: HTMLElement[] = [];
  if (state.auditView.error) {
    notices.push(el("div", { class: "error" }, [state.auditView.error]));
  }
  if (state.auditView.loading) {
    notices.push(el("div", { class: "notice" }, [t("loading_records")]));
  }

  return el("section", { class: "stack audit-view" }, [
    el("div", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [t("audit_view_title")]),
        el("p", { class: "page-subtitle" }, [t("audit_view_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [kindSelect, loadButton]),
    ]),
    ...notices,
    renderAuditFilterCard(),
    renderAuditListCard(),
    state.auditView.detail ? renderAuditDetailCard(state.auditView.detail) : null,
  ]);
}

function renderAuditFilterCard(): HTMLElement {
  const statusInput = auditFilterInput("status", t("audit_status"));
  const sourceInput = auditFilterInput("source", t("audit_source"));
  const domainInput = auditFilterInput("domain", t("audit_domain"));
  const eventTypeInput = auditFilterInput("eventType", t("audit_event_type"));
  const limitInput = auditFilterInput("limit", t("audit_limit"), "number");
  const offsetInput = auditFilterInput("offset", t("audit_offset"), "number");
  const applyButton = el("button", { class: "button primary", type: "button", disabled: state.auditView.loading ? true : null }, [t("audit_filters")]);
  applyButton.addEventListener("click", () => {
    void loadAuditViewList();
  });

  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [t("audit_filters")]),
      el("div", { class: "form-grid" }, [
        auditFilterField(t("audit_status"), statusInput),
        auditFilterField(t("audit_source"), sourceInput),
        auditFilterField(t("audit_domain"), domainInput),
        state.auditView.kind === "events" ? auditFilterField(t("audit_event_type"), eventTypeInput) : null,
        auditFilterField(t("audit_limit"), limitInput),
        auditFilterField(t("audit_offset"), offsetInput),
      ]),
      applyButton,
    ]),
  ]);
}

function auditFilterField(label: string, input: HTMLElement): HTMLElement {
  return el("div", { class: "field field--third" }, [
    el("label", {}, [label]),
    input,
  ]);
}

function auditFilterInput(key: keyof AuditViewFilters, label: string, type = "text"): HTMLInputElement {
  const input = el("input", {
    class: "input",
    type,
    placeholder: label,
    value: state.auditView.filters[key],
  });
  input.addEventListener("input", () => {
    state.auditView.filters[key] = input.value;
  });
  return input;
}

function renderAuditListCard(): HTMLElement {
  const list = state.auditView.list;
  const rows = list?.results ?? [];
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [state.auditView.kind === "batches" ? t("audit_batches") : t("audit_events")]),
        list ? el("span", { class: "badge" }, [`${t("audit_count")}: ${list.count ?? rows.length}`]) : null,
        list?.domain ? el("span", { class: "badge" }, [`${t("audit_domain")}: ${list.domain}`]) : null,
      ]),
      list?.scope ? el("div", { class: "notice" }, [`${t("audit_scope")}: ${safeJson(list.scope)}`]) : null,
      el("p", { class: "cell-muted" }, [t("audit_redacted_notice")]),
      rows.length ? renderAuditTable(rows) : el("div", { class: "empty" }, [t("audit_no_records")]),
      renderAuditPagination(list),
    ]),
  ]);
}

function renderAuditTable(rows: AuditRecord[]): HTMLElement {
  const header = state.auditView.kind === "batches"
    ? ["id", "audit_time", "audit_actor", "audit_domain", "audit_source", "audit_status", "audit_operation_count", "audit_reason", "actions"]
    : ["id", "audit_time", "audit_actor", "audit_event_type", "audit_status", "audit_domain", "audit_request_id", "actions"];
  const table = el("table");
  table.append(el("thead", {}, [el("tr", {}, header.map((key) => el("th", {}, [key === "id" ? "ID" : t(key)])))]));
  const body = el("tbody");
  for (const row of rows) {
    const detailButton = el("button", { class: "button flat", type: "button" }, [t("audit_detail")]);
    detailButton.addEventListener("click", () => {
      const id = String(row.id ?? "");
      if (id) {
        void loadAuditViewDetail(id);
      }
    });
    const cells = state.auditView.kind === "batches"
      ? [
          auditValue(row.id),
          auditValue(row.created_at),
          auditValue(row.actor_username),
          auditValue(row.domain),
          auditValue(row.source),
          auditValue(row.status),
          auditValue(row.operation_count),
          auditValue(row.reason),
          detailButton,
        ]
      : [
          auditValue(row.id),
          auditValue(row.occurred_at),
          auditValue(row.actor_username),
          auditValue(row.event_type),
          auditValue(row.status),
          auditValue(row.domain),
          auditValue(row.request_id),
          detailButton,
        ];
    body.append(el("tr", {}, cells.map((cell) => el("td", {}, [cell]))));
  }
  table.append(body);
  return el("div", { class: "table-wrap" }, [table]);
}

function renderAuditPagination(list: AuditListResponse | null): HTMLElement {
  if (!list) {
    return el("div");
  }
  const limit = list.limit ?? parsePositiveInt(state.auditView.filters.limit, 50);
  const offset = list.offset ?? parsePositiveInt(state.auditView.filters.offset, 0);
  const count = list.count ?? 0;
  const previousButton = el("button", { class: "button", type: "button", disabled: offset <= 0 || state.auditView.loading ? true : null }, [t("previous")]);
  previousButton.addEventListener("click", () => {
    state.auditView.filters.offset = String(Math.max(0, offset - limit));
    void loadAuditViewList();
  });
  const nextButton = el("button", { class: "button", type: "button", disabled: offset + limit >= count || state.auditView.loading ? true : null }, [t("next")]);
  nextButton.addEventListener("click", () => {
    state.auditView.filters.offset = String(offset + limit);
    void loadAuditViewList();
  });
  return el("div", { class: "pagination" }, [
    el("span", {}, [`${offset + 1}-${Math.min(offset + limit, count)} / ${count}`]),
    previousButton,
    nextButton,
  ]);
}

function renderAuditDetailCard(detail: AuditDetailResponse): HTMLElement {
  return el("section", { class: "card audit-view__detail" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [t("audit_detail")]),
        detail.domain ? el("span", { class: "badge" }, [`${t("audit_domain")}: ${detail.domain}`]) : null,
      ]),
      detail.scope ? el("div", { class: "notice" }, [`${t("audit_scope")}: ${safeJson(detail.scope)}`]) : null,
      el("pre", { class: "cell-json" }, [safeJson((detail.result ?? {}) as RecordValue)]),
    ]),
  ]);
}

function auditValue(value: JsonValue | undefined): string | HTMLElement {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (Array.isArray(value) || typeof value === "object") {
    return el("pre", { class: "cell-json" }, [safeJson(value)]);
  }
  return String(value);
}


function renderMatrixEditorPage(): HTMLElement {
  if (!currentMatrixEditorUniverse() && !state.matrixEditor.loading) {
    void loadMatrixEditorUniverse();
  }

  const domainSelect = el("select", { class: "select", "aria-label": t("matrix_domain") });
  for (const domain of ["organization", "institution"] as MatrixEditorDomain[]) {
    const option = el("option", { value: domain, selected: state.matrixEditor.domain === domain ? true : null }, [
      domain === "organization" ? t("organization_domain") : t("institution_domain"),
    ]);
    domainSelect.append(option);
  }
  domainSelect.addEventListener("change", () => {
    const nextDomain = domainSelect.value === "institution" ? "institution" : "organization";
    if (state.matrixEditor.domain === nextDomain) {
      return;
    }
    state.matrixEditor.domain = nextDomain;
    state.matrixEditor.resourceDraft = emptyMatrixEditorResourceDraft();
    state.matrixEditor.resourceProposals = [];
    state.matrixEditor.apiEntrypoints = [];
    state.matrixEditor.apiEntrypointDraft = "";
    state.matrixEditor.rowScopeValues.clear();
    state.matrixEditor.columnGrantSelections.clear();
    state.matrixEditor.validation = null;
    state.matrixEditor.preview = null;
    state.matrixEditor.applyResult = null;
    state.matrixEditor.confirmDangerous = false;
    state.matrixEditor.error = null;
    render();
    void loadMatrixEditorUniverse();
  });

  const reloadButton = el("button", { class: "button", type: "button" }, [t("load_universe")]);
  reloadButton.addEventListener("click", () => {
    void loadMatrixEditorUniverse();
  });

  const validateButton = el("button", { class: "button", type: "button", disabled: state.matrixEditor.loading ? true : null }, [t("matrix_validate")]);
  validateButton.addEventListener("click", () => {
    void validateMatrixEditorProposal();
  });
  const previewButton = el("button", { class: "button", type: "button", disabled: state.matrixEditor.loading ? true : null }, [t("matrix_preview")]);
  previewButton.addEventListener("click", () => {
    void previewMatrixEditorProposal();
  });
  const applyButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: !state.matrixEditor.confirmDangerous || state.matrixEditor.loading ? true : null,
  }, [t("matrix_apply")]);
  applyButton.addEventListener("click", () => {
    void applyMatrixEditorProposal();
  });

  const notices: HTMLElement[] = [];
  if (state.matrixEditor.error) {
    notices.push(el("div", { class: "error" }, [state.matrixEditor.error]));
  }
  if (state.matrixEditor.loading) {
    notices.push(el("div", { class: "notice" }, [t("loading_resource")]));
  }

  return el("section", { class: "stack matrix-editor" }, [
    el("div", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [t("matrix_editor_title")]),
        el("p", { class: "page-subtitle" }, [t("matrix_editor_subtitle")]),
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
  return state.matrixEditor.universeByDomain[state.matrixEditor.domain] ?? null;
}

function renderMatrixEditorUniverseCard(): HTMLElement {
  const universe = currentMatrixEditorUniverse();
  if (!universe) {
    return el("section", { class: "card" }, [
      el("div", { class: "card__body stack" }, [
        el("h3", {}, [t("matrix_universe")]),
        el("p", { class: "cell-muted" }, [t("loading_resource")]),
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
        el("h3", {}, [t("matrix_universe")]),
        el("span", { class: "badge" }, [universe.domain]),
        universe.role_mutation_status ? el("span", { class: "badge" }, [universe.role_mutation_status]) : null,
      ]),
      el("div", { class: "summary-grid" }, resourceTiles.length ? resourceTiles : [el("div", { class: "empty" }, [t("no_resources_match")])]),
      el("p", { class: "notice" }, [t("matrix_warning_audit")]),
    ]),
  ]);
}

function renderMatrixEditorResourceProposalCard(): HTMLElement {
  const universe = currentMatrixEditorUniverse();
  const resources = universe?.resources ?? [];
  const draft = state.matrixEditor.resourceDraft;
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
    state.matrixEditor.resourceDraft.resource_key = resourceSelect.value;
    state.matrixEditor.resourceDraft.error = null;
    render();
  });

  const actionSelect = el("select", { class: "select" });
  for (const action of actions) {
    actionSelect.append(el("option", { value: action, selected: draft.action === action ? true : null }, [action]));
  }
  actionSelect.addEventListener("change", () => {
    state.matrixEditor.resourceDraft.action = actionSelect.value === "update" ? "update" : "create";
    state.matrixEditor.resourceDraft.error = null;
    render();
  });

  const identityInput = el("input", { class: "input", value: draft.record_identity, placeholder: t("matrix_record_identity") });
  identityInput.addEventListener("input", () => {
    state.matrixEditor.resourceDraft.record_identity = identityInput.value;
  });
  const afterInput = el("textarea", { class: "textarea", spellcheck: "false" }, [draft.after_json]);
  afterInput.addEventListener("input", () => {
    state.matrixEditor.resourceDraft.after_json = afterInput.value;
    state.matrixEditor.resourceDraft.error = null;
  });
  const addButton = el("button", { class: "button", type: "button", disabled: resources.length ? null : true }, [t("matrix_add_operation")]);
  addButton.addEventListener("click", () => addMatrixEditorResourceProposal());

  const proposalRows = state.matrixEditor.resourceProposals.map((proposal, index) => {
    const removeButton = el("button", { class: "button flat", type: "button" }, ["×"]);
    removeButton.addEventListener("click", () => {
      state.matrixEditor.resourceProposals.splice(index, 1);
      clearMatrixEditorResults();
      render();
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
      el("h3", {}, [t("matrix_resource_operations")]),
      el("div", { class: "form-grid" }, [
        fieldShell(t("matrix_resource"), resourceSelect),
        fieldShell(t("matrix_action"), actionSelect),
        fieldShell(t("matrix_record_identity"), identityInput),
        el("div", { class: "field field--full" }, [
          el("label", {}, [t("matrix_after_json")]),
          afterInput,
          draft.error ? el("small", { class: "error" }, [draft.error]) : null,
        ]),
      ]),
      addButton,
      state.matrixEditor.resourceProposals.length
        ? el("div", { class: "table-wrap" }, [el("table", {}, [
            el("thead", {}, [el("tr", {}, [
              el("th", {}, [t("matrix_resource")]),
              el("th", {}, [t("matrix_action")]),
              el("th", {}, [t("matrix_record_identity")]),
              el("th", {}, [t("matrix_after_json")]),
              el("th", {}, [""]),
            ])]),
            el("tbody", {}, proposalRows),
          ])])
        : el("div", { class: "empty" }, [t("matrix_no_operations")]),
    ]),
  ]);
}

function renderMatrixEditorApiEntrypointCard(): HTMLElement {
  const input = el("input", { class: "input", value: state.matrixEditor.apiEntrypointDraft, placeholder: t("matrix_api_placeholder") });
  input.addEventListener("input", () => {
    state.matrixEditor.apiEntrypointDraft = input.value;
  });
  const addButton = el("button", { class: "button", type: "button" }, [t("matrix_add_api")]);
  addButton.addEventListener("click", () => addMatrixEditorApiEntrypoint());
  const chips = state.matrixEditor.apiEntrypoints.map((apiName, index) => {
    const remove = el("button", { class: "button flat", type: "button" }, ["×"]);
    remove.addEventListener("click", () => {
      state.matrixEditor.apiEntrypoints.splice(index, 1);
      clearMatrixEditorResults();
      render();
    });
    return el("span", { class: "filter-chip" }, [apiName, remove]);
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [t("matrix_api_entrypoints")]),
      el("p", { class: "cell-muted" }, [t("matrix_api_entrypoints_help")]),
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
      el("h3", {}, [t("matrix_column_grants")]),
      el("p", { class: "cell-muted" }, [t("matrix_column_grants_help")]),
      resourceSections.length ? el("div", { class: "stack" }, resourceSections) : el("div", { class: "empty" }, [t("matrix_no_column_grants")]),
    ]),
  ]);
}

function renderMatrixEditorColumnGrantAction(resource: MatrixEditorColumnGrantResource, action: MatrixEditorColumnGrantAction): HTMLElement {
  const selectionKey = matrixEditorColumnGrantSelectionKey(resource.resource_key, action.action);
  const selected = state.matrixEditor.columnGrantSelections.get(selectionKey) ?? new Set<string>();
  const checkboxes = (action.columns ?? []).map((column) => {
    const checkbox = el("input", {
      type: "checkbox",
      checked: selected.has(column.key) ? true : null,
      value: column.key,
    });
    checkbox.addEventListener("change", () => {
      const nextSelected = new Set(state.matrixEditor.columnGrantSelections.get(selectionKey) ?? []);
      if (checkbox.checked) {
        nextSelected.add(column.key);
      } else {
        nextSelected.delete(column.key);
      }
      if (nextSelected.size) {
        state.matrixEditor.columnGrantSelections.set(selectionKey, nextSelected);
      } else {
        state.matrixEditor.columnGrantSelections.delete(selectionKey);
      }
      clearMatrixEditorResults();
      render();
    });
    const label = column.label || column.alias || column.key;
    return el("label", { class: "checkbox-row" }, [checkbox, `${label} (${column.key})`]);
  });
  return el("div", { class: "panel" }, [
    el("div", { class: "toolbar" }, [
      el("strong", {}, [resource.label || resource.alias || resource.resource_key]),
      el("span", { class: "badge" }, [action.action]),
      action.row_scope_type ? el("span", { class: "badge" }, [`${t("matrix_row_scope_type")}: ${action.row_scope_type}`]) : null,
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
      el("h3", {}, [t("matrix_row_scopes")]),
      el("p", { class: "cell-muted" }, [t("matrix_row_scopes_help")]),
      scopeTypes.length
        ? el("div", { class: "form-grid" }, scopeTypes.map((scopeType) => renderMatrixEditorRowScopeInput(scopeType)))
        : el("div", { class: "empty" }, [t("no_resources_match")]),
    ]),
  ]);
}

function renderMatrixEditorRowScopeInput(scopeType: MatrixEditorRowScopeType): HTMLElement {
  const input = el("input", {
    class: "input",
    value: state.matrixEditor.rowScopeValues.get(scopeType.key) ?? "",
    placeholder: t("matrix_scope_value_placeholder"),
  });
  input.addEventListener("input", () => {
    state.matrixEditor.rowScopeValues.set(scopeType.key, input.value);
    clearMatrixEditorResults();
  });
  const label = String(scopeType.label || scopeType.key || t("matrix_row_scopes"));
  return el("div", { class: "field field--third" }, [
    el("label", {}, [label]),
    input,
    scopeType.description ? el("small", {}, [String(scopeType.description)]) : null,
  ]);
}

function renderMatrixEditorAuditCard(): HTMLElement {
  const reasonInput = el("textarea", { class: "textarea", placeholder: t("matrix_reason") }, [state.matrixEditor.reason]);
  reasonInput.addEventListener("input", () => {
    state.matrixEditor.reason = reasonInput.value;
  });
  const confirmInput = el("input", { type: "checkbox", checked: state.matrixEditor.confirmDangerous ? true : null });
  confirmInput.addEventListener("change", () => {
    state.matrixEditor.confirmDangerous = confirmInput.checked;
    render();
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      fieldShell(t("matrix_reason"), reasonInput),
      el("label", { class: "checkbox-row" }, [confirmInput, t("matrix_confirm_apply")]),
    ]),
  ]);
}

function renderMatrixEditorResultCards(): HTMLElement {
  return el("div", { class: "stack" }, [
    state.matrixEditor.validation ? renderMatrixEditorValidationCard(state.matrixEditor.validation) : null,
    state.matrixEditor.preview ? renderMatrixEditorPreviewCard(state.matrixEditor.preview) : null,
    state.matrixEditor.applyResult ? renderMatrixEditorApplyResultCard(state.matrixEditor.applyResult) : null,
  ]);
}

function renderMatrixEditorValidationCard(validation: MatrixEditorValidationResponse): HTMLElement {
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [t("matrix_validation")]),
        el("span", { class: validation.valid ? "badge badge--success" : "badge badge--danger" }, [validation.valid ? t("matrix_valid") : t("matrix_invalid")]),
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
        el("h3", {}, [t("matrix_preview_result")]),
        el("span", { class: preview.valid ? "badge badge--success" : "badge badge--danger" }, [preview.valid ? t("matrix_valid") : t("matrix_invalid")]),
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
      el("h3", {}, [t("matrix_apply_result")]),
      renderSummaryGrid(summary),
    ]),
  ]);
}

function renderMatrixEditorIssues(issues: MatrixEditorIssue[], toneClass: "error" | "notice"): HTMLElement {
  if (issues.length === 0) {
    return el("div", { class: "empty" }, [t("workbook_no_issues")]);
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
  return resource?.label || resource?.alias || t("matrix_resource");
}

function addMatrixEditorResourceProposal(): void {
  const draft = state.matrixEditor.resourceDraft;
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
    state.matrixEditor.resourceProposals.push(proposal);
    state.matrixEditor.resourceDraft = emptyMatrixEditorResourceDraft();
    const firstResource = currentMatrixEditorUniverse()?.resources?.[0];
    if (firstResource) {
      state.matrixEditor.resourceDraft.resource_key = firstResource.resource_key;
    }
    clearMatrixEditorResults();
    render();
  } catch (error) {
    state.matrixEditor.resourceDraft.error = error instanceof Error ? error.message : "Invalid JSON";
    render();
  }
}

function addMatrixEditorApiEntrypoint(): void {
  const apiName = state.matrixEditor.apiEntrypointDraft.trim();
  const prefix = `db_admin.matrix_editor.${state.matrixEditor.domain}.`;
  if (!apiName || !apiName.startsWith(prefix) || state.matrixEditor.apiEntrypoints.includes(apiName)) {
    return;
  }
  state.matrixEditor.apiEntrypoints.push(apiName);
  state.matrixEditor.apiEntrypointDraft = "";
  clearMatrixEditorResults();
  render();
}

function matrixEditorColumnGrantPayload(): MatrixEditorColumnGrantProposal[] {
  const universe = currentMatrixEditorUniverse();
  const proposals: MatrixEditorColumnGrantProposal[] = [];
  for (const resource of universe?.column_grant_universe ?? []) {
    for (const action of resource.actions ?? []) {
      const selectionKey = matrixEditorColumnGrantSelectionKey(resource.resource_key, action.action);
      const selected = state.matrixEditor.columnGrantSelections.get(selectionKey);
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
  for (const [rowScopeType, raw] of state.matrixEditor.rowScopeValues.entries()) {
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
  if (state.matrixEditor.resourceProposals.length) {
    proposal.resources = state.matrixEditor.resourceProposals;
  }
  if (state.matrixEditor.apiEntrypoints.length) {
    proposal.api_entrypoints = [...state.matrixEditor.apiEntrypoints];
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
    domain: state.matrixEditor.domain,
    proposal,
  };
  if (state.matrixEditor.reason.trim()) {
    payload.reason = state.matrixEditor.reason.trim();
  }
  return payload;
}

function clearMatrixEditorResults(): void {
  state.matrixEditor.validation = null;
  state.matrixEditor.preview = null;
  state.matrixEditor.applyResult = null;
}

async function loadMatrixEditorUniverse(): Promise<void> {
  state.matrixEditor.loading = true;
  state.matrixEditor.error = null;
  try {
    const universe = await apiFetch<MatrixEditorUniverse>(withSurface("/api/matrix-editor/universe/", { domain: state.matrixEditor.domain }));
    state.matrixEditor.universeByDomain[state.matrixEditor.domain] = universe;
  } catch (error) {
    state.matrixEditor.error = error instanceof Error ? error.message : t("matrix_universe_failed");
    notify("error", state.matrixEditor.error);
  } finally {
    state.matrixEditor.loading = false;
    render();
  }
}

async function validateMatrixEditorProposal(): Promise<void> {
  state.matrixEditor.loading = true;
  state.matrixEditor.error = null;
  try {
    state.matrixEditor.validation = await apiFetch<MatrixEditorValidationResponse>(withSurface("/api/matrix-editor/validate/"), {
      method: "POST",
      body: JSON.stringify(matrixEditorPayload()),
    });
    state.matrixEditor.preview = null;
    state.matrixEditor.applyResult = null;
  } catch (error) {
    state.matrixEditor.error = error instanceof Error ? error.message : t("matrix_validate_failed");
    notify("error", state.matrixEditor.error);
  } finally {
    state.matrixEditor.loading = false;
    render();
  }
}

async function previewMatrixEditorProposal(): Promise<void> {
  state.matrixEditor.loading = true;
  state.matrixEditor.error = null;
  try {
    state.matrixEditor.preview = await apiFetch<MatrixEditorPreviewResponse>(withSurface("/api/matrix-editor/preview/"), {
      method: "POST",
      body: JSON.stringify(matrixEditorPayload()),
    });
    state.matrixEditor.validation = state.matrixEditor.preview.validation ?? state.matrixEditor.validation;
    state.matrixEditor.applyResult = null;
  } catch (error) {
    state.matrixEditor.error = error instanceof Error ? error.message : t("matrix_preview_failed");
    notify("error", state.matrixEditor.error);
  } finally {
    state.matrixEditor.loading = false;
    render();
  }
}

async function applyMatrixEditorProposal(): Promise<void> {
  if (!state.matrixEditor.confirmDangerous) {
    return;
  }
  state.matrixEditor.loading = true;
  state.matrixEditor.error = null;
  try {
    state.matrixEditor.applyResult = await apiFetch<MatrixEditorApplyResponse>(withSurface("/api/matrix-editor/apply/"), {
      method: "POST",
      body: JSON.stringify(matrixEditorPayload()),
    });
    notify("success", t("matrix_apply_result"));
  } catch (error) {
    state.matrixEditor.error = error instanceof Error ? error.message : t("matrix_apply_failed");
    notify("error", state.matrixEditor.error);
  } finally {
    state.matrixEditor.loading = false;
    render();
  }
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
    state.auditView.error = error instanceof Error ? error.message : t("audit_load_failed");
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
    state.auditView.error = error instanceof Error ? error.message : t("audit_detail_failed");
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
    state.resourceExposure.error = error instanceof Error ? error.message : t("resource_exposure_load_failed");
    notify("error", state.resourceExposure.error);
  } finally {
    state.resourceExposure.loading = false;
    render();
  }
}

function renderResourceExposurePage(): HTMLElement {
  if (!state.resourceExposure.manifest && !state.resourceExposure.loading) {
    void loadResourceExposureManifest();
  }

  const refreshButton = el("button", { class: "button", type: "button", disabled: state.resourceExposure.loading ? true : null }, [t("refresh_resource")]);
  refreshButton.addEventListener("click", () => {
    void loadResourceExposureManifest();
  });

  const notices: Node[] = [];
  if (state.resourceExposure.error) {
    notices.push(el("div", { class: "error" }, [state.resourceExposure.error]));
  }
  if (state.resourceExposure.loading) {
    notices.push(renderLoadingPage(t("loading_resource")));
  }

  return el("section", { class: "stack resource-exposure" }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [t("resource_exposure_title")]),
        el("p", { class: "page-subtitle" }, [t("resource_exposure_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [refreshButton]),
    ]),
    ...notices,
    renderResourceExposureSummary(),
    renderResourceExposureFilters(),
    renderResourceExposureTable(),
    renderResourceExposureManifestJson(),
  ]);
}

function renderResourceExposureSummary(): HTMLElement {
  const manifest = state.resourceExposure.manifest;
  if (!manifest) {
    return el("section", { class: "card" }, [el("div", { class: "card__body cell-muted" }, [t("resource_exposure_load_failed")])]);
  }
  const counts = manifest.counts_by_exposure ?? {};
  const countBadges = Object.entries(counts).map(([key, value]) => el("span", { class: "badge" }, [`${key}: ${value}`]));
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [t("resource_exposure_counts")]),
        manifest.platform_only ? el("span", { class: "badge" }, [t("resource_exposure_platform_only")]) : null,
      ]),
      el("div", { class: "toolbar" }, countBadges),
      manifest.classification_ssot ? el("p", { class: "meta-line" }, [`SSOT: ${manifest.classification_ssot}`]) : null,
      manifest.redacted_internal_resource_inspection
        ? el("div", { class: "notice" }, [`${t("resource_exposure_redaction")}: ${safeJson(manifest.redacted_internal_resource_inspection as RecordValue)}`])
        : null,
    ]),
  ]);
}

function renderResourceExposureFilters(): HTMLElement {
  const exposureSelect = el("select", { class: "input" });
  exposureSelect.append(el("option", { value: "", selected: state.resourceExposure.exposureFilter === "" ? true : null }, [t("all")]));
  for (const exposure of resourceExposureOptions()) {
    exposureSelect.append(el("option", { value: exposure, selected: state.resourceExposure.exposureFilter === exposure ? true : null }, [exposure]));
  }
  exposureSelect.addEventListener("change", () => {
    state.resourceExposure.exposureFilter = exposureSelect.value;
    render();
  });

  const queryInput = el("input", { class: "input", type: "search", value: state.resourceExposure.query, placeholder: t("resource_exposure_query") });
  queryInput.addEventListener("input", () => {
    state.resourceExposure.query = queryInput.value;
    render();
  });

  return el("section", { class: "card" }, [
    el("div", { class: "card__body toolbar" }, [
      fieldShell(t("resource_exposure_filter"), exposureSelect),
      fieldShell(t("resource_exposure_query"), queryInput),
    ]),
  ]);
}

function renderResourceExposureTable(): HTMLElement {
  const resources = filteredResourceExposureItems();
  if (!resources.length) {
    return el("section", { class: "card" }, [el("div", { class: "card__body empty" }, [t("resource_exposure_no_resources")])]);
  }
  const rows = resources.map((item) => el("tr", {}, [
    el("td", {}, [item.resource_key]),
    el("td", {}, [item.model]),
    el("td", {}, [item.exposure]),
    el("td", {}, [item.inspection_mode]),
    el("td", {}, [item.generic_discovery_eligible ? t("yes") : t("no")]),
    el("td", {}, [`${item.path}:${item.line}`]),
  ]));
  return el("section", { class: "card" }, [
    el("div", { class: "card__body table-wrap" }, [
      el("table", { class: "records-table" }, [
        el("thead", {}, [el("tr", {}, [
          el("th", {}, ["resource_key"]),
          el("th", {}, ["model"]),
          el("th", {}, ["exposure"]),
          el("th", {}, ["inspection_mode"]),
          el("th", {}, ["generic_discovery_eligible"]),
          el("th", {}, ["source"]),
        ])]),
        el("tbody", {}, rows),
      ]),
    ]),
  ]);
}

function renderResourceExposureManifestJson(): HTMLElement {
  const manifest = state.resourceExposure.manifest;
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [t("resource_exposure_manifest")]),
      el("pre", { class: "cell-json" }, [safeJson((manifest ?? {}) as RecordValue)]),
    ]),
  ]);
}

function resourceExposureOptions(): string[] {
  const manifest = state.resourceExposure.manifest;
  return Object.keys(manifest?.counts_by_exposure ?? {}).sort();
}

function filteredResourceExposureItems(): ResourceExposureManifestItem[] {
  const manifest = state.resourceExposure.manifest;
  const resources = manifest?.resources ?? [];
  const exposure = state.resourceExposure.exposureFilter;
  const query = state.resourceExposure.query.trim().toLowerCase();
  return resources.filter((item) => {
    if (exposure && item.exposure !== exposure) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [item.model, item.resource_key, item.path, item.inspection_mode, item.exposure]
      .some((value) => value.toLowerCase().includes(query));
  });
}


function renderSetupWorkbookPage(): HTMLElement {
  if (!state.setupWorkbook.manifest && !state.setupWorkbook.loading) {
    void loadSetupWorkbookManifest();
  }

  const templateButton = el("button", { class: "button", type: "button" }, [t("download_template")]);
  templateButton.addEventListener("click", () => {
    void downloadSetupWorkbookTemplate();
  });

  const fileInput = el("input", {
    class: "input",
    type: "file",
    accept: ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "aria-label": t("choose_workbook"),
  }) as HTMLInputElement;
  fileInput.addEventListener("change", () => {
    state.setupWorkbook.selectedFile = fileInput.files?.[0] ?? null;
    state.setupWorkbook.dryRunResult = null;
    state.setupWorkbook.commitPlan = null;
    state.setupWorkbook.omittedRows.clear();
    state.setupWorkbook.confirmedWarningCodes.clear();
    state.setupWorkbook.cellCorrections.clear();
    state.setupWorkbook.error = null;
    render();
  });

  const dryRunButton = el("button", {
    class: "button primary",
    type: "button",
    disabled: state.setupWorkbook.selectedFile && !state.setupWorkbook.loading ? null : true,
  }, [t("run_dry_run")]);
  dryRunButton.addEventListener("click", () => {
    void runSetupWorkbookDryRun();
  });

  const previewButton = el("button", {
    class: "button",
    type: "button",
    disabled: state.setupWorkbook.selectedFile && state.setupWorkbook.dryRunResult && !state.setupWorkbook.loading ? null : true,
  }, [t("build_preview")]);
  previewButton.addEventListener("click", () => {
    void buildSetupWorkbookCommitPlan();
  });

  const reasonInput = el("textarea", {
    class: "textarea",
    placeholder: t("workbook_reason"),
  }, [state.setupWorkbook.reason]);
  reasonInput.addEventListener("change", () => {
    state.setupWorkbook.reason = reasonInput.value;
  });

  const notices: Node[] = [];
  if (state.setupWorkbook.error) {
    notices.push(el("div", { class: "error" }, [state.setupWorkbook.error]));
  }
  notices.push(el("div", { class: "notice" }, [t("workbook_no_business_writes")]));

  return el("section", { class: "stack setup-workbook" }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [t("setup_workbook_title")]),
        el("p", { class: "page-subtitle" }, [t("setup_workbook_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [templateButton]),
    ]),
    ...notices,
    el("section", { class: "card" }, [
      el("div", { class: "card__body stack" }, [
        el("div", { class: "toolbar" }, [fileInput, dryRunButton, previewButton]),
        fieldShell(t("workbook_reason"), reasonInput),
        state.setupWorkbook.selectedFile
          ? el("p", { class: "meta-line" }, [state.setupWorkbook.selectedFile.name])
          : el("p", { class: "cell-muted" }, [t("workbook_select_file")]),
      ]),
    ]),
    renderSetupWorkbookManifestCard(),
    renderSetupWorkbookDryRunResult(),
    renderSetupWorkbookCommitPlan(),
  ]);
}

function renderSetupWorkbookManifestCard(): HTMLElement {
  const manifest = state.setupWorkbook.manifest;
  if (state.setupWorkbook.loading && !manifest) {
    return renderLoadingPage(t("loading_resource"));
  }
  if (!manifest) {
    return el("section", { class: "card" }, [
      el("div", { class: "card__body cell-muted" }, [t("workbook_manifest_failed")]),
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
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [t("workbook_summary")]),
      sheetList,
    ]),
  ]);
}

function renderSetupWorkbookDryRunResult(): HTMLElement {
  const result = state.setupWorkbook.dryRunResult;
  if (!result) {
    return el("section", { class: "card" }, [el("div", { class: "card__body cell-muted" }, [t("workbook_no_preview")])]);
  }
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [t("workbook_summary")]),
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
      el("h3", {}, [t("workbook_issues")]),
      el("div", { class: "success" }, [t("workbook_no_issues")]),
    ]);
  }

  const groups = new Map<string, SetupWorkbookIssue[]>();
  for (const issue of issues) {
    const key = issue.sheet || "general";
    groups.set(key, [...(groups.get(key) ?? []), issue]);
  }
  const container = el("section", { class: "stack" }, [el("h3", {}, [t("workbook_issues")])]);
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
      checked: state.setupWorkbook.omittedRows.has(rowKey),
      "aria-label": t("workbook_omit_row"),
    }) as HTMLInputElement;
    omit.addEventListener("change", () => {
      if (omit.checked) {
        state.setupWorkbook.omittedRows.add(rowKey);
      } else {
        state.setupWorkbook.omittedRows.delete(rowKey);
      }
      state.setupWorkbook.commitPlan = null;
      render();
    });
    controls.push(el("label", { class: "checkbox-row" }, [omit, t("workbook_omit_row")]));
  }
  if (issue.requires_confirmation) {
    const confirm = el("input", {
      type: "checkbox",
      checked: state.setupWorkbook.confirmedWarningCodes.has(issue.code),
      "aria-label": `${t("workbook_confirm_warning")} ${issue.code}`,
    }) as HTMLInputElement;
    confirm.addEventListener("change", () => {
      if (confirm.checked) {
        state.setupWorkbook.confirmedWarningCodes.add(issue.code);
      } else {
        state.setupWorkbook.confirmedWarningCodes.delete(issue.code);
      }
      state.setupWorkbook.commitPlan = null;
      render();
    });
    controls.push(el("label", { class: "checkbox-row" }, [confirm, `${t("workbook_confirm_warning")}: ${issue.code}`]));
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
    return el("section", { class: "stack" }, [el("h3", {}, [t("workbook_rows")]), el("div", { class: "empty" }, [t("no_records_returned")])]);
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
    el("h3", {}, [t("workbook_rows")]),
    el("div", { class: "table-wrap" }, [table]),
    renderSetupWorkbookCellFixes(sheets),
  ]);
}

function renderSetupWorkbookCellFixes(sheets: SetupWorkbookSheetResult[]): HTMLElement {
  const details = el("section", { class: "stack" }, [
    el("h3", {}, [t("workbook_cell_fixes")]),
    el("p", { class: "cell-muted" }, [t("workbook_cell_fixes_help")]),
    el("span", { class: "badge" }, [`${state.setupWorkbook.cellCorrections.size} ${t("workbook_changed_cells")}`]),
  ]);
  const sheetManifestByKey = new Map((state.setupWorkbook.manifest?.sheets ?? []).map((sheet) => [sheet.key, sheet]));
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
  const currentValue = state.setupWorkbook.cellCorrections.get(key)?.value ?? row.corrected_values?.[column.key] ?? originalValue;
  const input = el("input", {
    class: state.setupWorkbook.cellCorrections.has(key) ? "input setup-workbook__cell-input setup-workbook__cell-input--changed" : "input setup-workbook__cell-input",
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
    state.setupWorkbook.cellCorrections.delete(key);
  } else {
    state.setupWorkbook.cellCorrections.set(key, {
      sheet,
      row_number: row.row_number,
      column: column.key,
      value: rawValue === "" ? null : rawValue,
    });
  }
  state.setupWorkbook.commitPlan = null;
  render();
}


function renderSetupWorkbookCommitPlan(): HTMLElement {
  const plan = state.setupWorkbook.commitPlan;
  if (!plan) {
    return el("section", { class: "card" }, [
      el("div", { class: "card__body cell-muted" }, [t("workbook_no_preview")]),
    ]);
  }
  const notice = plan.commit_allowed
    ? el("div", { class: "success" }, [t("workbook_plan_ready")])
    : el("div", { class: "error" }, [t("workbook_plan_blocked")]);
  const rejected = plan.rejected_reasons?.length
    ? el("div", { class: "stack" }, plan.rejected_reasons.map((reason) => el("div", { class: "notice" }, [
        el("strong", {}, [String(reason.code ?? "blocked")]),
        el("p", {}, [String(reason.message ?? "")]),
      ])))
    : null;
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [t("workbook_preview")]),
      notice,
      rejected,
      renderSummaryGrid(plan.summary ?? {}),
      renderSetupWorkbookOperations(plan.operations ?? []),
    ]),
  ]);
}

function renderSetupWorkbookOperations(operations: SetupWorkbookCommitOperation[]): HTMLElement {
  if (operations.length === 0) {
    return el("section", { class: "stack" }, [el("h3", {}, [t("workbook_operations")]), el("div", { class: "empty" }, [t("no_records_returned")])]);
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
    el("h3", {}, [t("workbook_operations")]),
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
  return [...state.setupWorkbook.cellCorrections.values()].sort((left, right) => {
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
  return [...state.setupWorkbook.omittedRows].map((key) => {
    const [sheet = "", rowNumber = "0"] = key.split(":");
    return { sheet, row_number: Number.parseInt(rowNumber, 10) || 0 };
  }).filter((row) => row.sheet && row.row_number > 0);
}

async function loadSetupWorkbookManifest(): Promise<void> {
  state.setupWorkbook.loading = true;
  state.setupWorkbook.error = null;
  render();
  try {
    state.setupWorkbook.manifest = await apiFetch<SetupWorkbookManifest>(withSurface("/api/setup-workbook/manifest/"));
  } catch (error) {
    state.setupWorkbook.error = error instanceof Error ? error.message : t("workbook_manifest_failed");
    notify("error", state.setupWorkbook.error);
  } finally {
    state.setupWorkbook.loading = false;
    render();
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
    state.setupWorkbook.error = error instanceof Error ? error.message : t("workbook_template_failed");
    notify("error", state.setupWorkbook.error);
    render();
  }
}

async function runSetupWorkbookDryRun(): Promise<void> {
  if (!state.setupWorkbook.selectedFile) {
    state.setupWorkbook.error = t("workbook_select_file");
    render();
    return;
  }
  state.setupWorkbook.loading = true;
  state.setupWorkbook.error = null;
  state.setupWorkbook.commitPlan = null;
  render();
  try {
    const formData = new FormData();
    formData.append("file", state.setupWorkbook.selectedFile);
    appendSetupWorkbookCellCorrections(formData);
    state.setupWorkbook.dryRunResult = await apiFetch<SetupWorkbookDryRunResult>(withSurface("/api/setup-workbook/dry-run/"), {
      method: "POST",
      body: formData,
    });
    state.setupWorkbook.omittedRows.clear();
    state.setupWorkbook.confirmedWarningCodes.clear();
  } catch (error) {
    state.setupWorkbook.error = error instanceof Error ? error.message : t("workbook_dry_run_failed");
    notify("error", state.setupWorkbook.error);
  } finally {
    state.setupWorkbook.loading = false;
    render();
  }
}

async function buildSetupWorkbookCommitPlan(): Promise<void> {
  if (!state.setupWorkbook.selectedFile) {
    state.setupWorkbook.error = t("workbook_select_file");
    render();
    return;
  }
  state.setupWorkbook.loading = true;
  state.setupWorkbook.error = null;
  render();
  try {
    const formData = new FormData();
    formData.append("file", state.setupWorkbook.selectedFile);
    appendSetupWorkbookCellCorrections(formData);
    for (const code of [...state.setupWorkbook.confirmedWarningCodes].sort()) {
      formData.append("confirmed_warning_codes", code);
    }
    for (const row of omittedSetupWorkbookRows()) {
      formData.append("omitted_rows", JSON.stringify(row));
    }
    formData.append("reason", state.setupWorkbook.reason);
    state.setupWorkbook.commitPlan = await apiFetch<SetupWorkbookCommitPlan>(withSurface("/api/setup-workbook/commit-plan/"), {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    state.setupWorkbook.error = error instanceof Error ? error.message : t("workbook_commit_plan_failed");
    notify("error", state.setupWorkbook.error);
  } finally {
    state.setupWorkbook.loading = false;
    render();
  }
}




function renderFilterBuilder(view: ResourceViewState): HTMLElement {
  const fields = filterableFields(view.schema);
  if (fields.length === 0) {
    return el("div", { class: "filter-builder empty" }, [t("no_filterable_fields")]);
  }

  const existing = el("div", { class: "filter-list" });
  const itemFilters = view.filterModel.items;
  if (itemFilters.length === 0) {
    existing.append(el("span", { class: "cell-muted" }, [t("no_column_filters")]));
  } else {
    itemFilters.forEach((item, index) => {
      const field = fields.find((candidate) => candidate.key === item.field);
      const operator = field ? operatorsForField(view.schema, field).find((candidate) => candidate.key === item.operator) : undefined;
      const remove = el("button", { class: "button flat", type: "button", title: t("remove_filter") }, ["×"]);
      remove.addEventListener("click", () => {
        view.filterModel.items.splice(index, 1);
        view.page = 1;
        void reloadResourceView();
      });
      existing.append(el("span", { class: "filter-chip" }, [
        field ? fieldName(field) : item.field,
        " ",
        operator ? operatorLabel(operator) : item.operator,
        operatorNeedsValue(operator) ? ` ${formatFilterValue(item.value)}` : "",
        remove,
      ]));
    });
  }

  const [firstField] = fields;
  if (!firstField) {
    return el("div", { class: "filter-builder empty" }, [t("no_filterable_fields")]);
  }
  const fieldSelect = el("select", { class: "select" });
  for (const field of fields) {
    fieldSelect.append(el("option", { value: field.key }, [fieldName(field)]));
  }
  const operatorSelect = el("select", { class: "select" });
  const valueControlSlot = el("span", { class: "filter-value-control" });
  let valueControl: FilterControlReader = emptyFilterControl();
  const linkSelect = el("select", { class: "select small", "aria-label": t("filter_link_operator") }, [
    el("option", { value: "and", selected: view.filterModel.linkOperator !== "or" }, ["AND"]),
    el("option", { value: "or", selected: view.filterModel.linkOperator === "or" }, ["OR"]),
  ]);
  linkSelect.addEventListener("change", () => {
    view.filterModel.linkOperator = linkSelect.value === "or" ? "or" : "and";
    view.page = 1;
    void reloadResourceView();
  });

  const selectedField = (): ResourceField => fields.find((field) => field.key === fieldSelect.value) ?? firstField;
  const selectedOperator = (): FilterOperatorDefinition | undefined => operatorsForField(view.schema, selectedField()).find((operator) => operator.key === operatorSelect.value);

  function refreshOperators(): void {
    clear(operatorSelect);
    for (const operator of operatorsForField(view.schema, selectedField())) {
      operatorSelect.append(el("option", { value: operator.key }, [operatorLabel(operator)]));
    }
    refreshValueControl();
  }

  function refreshValueControl(): void {
    clear(valueControlSlot);
    valueControl = renderFilterValueControl(view, selectedField(), selectedOperator());
    valueControlSlot.append(valueControl.element);
  }

  fieldSelect.addEventListener("change", refreshOperators);
  operatorSelect.addEventListener("change", refreshValueControl);
  refreshOperators();

  const add = el("button", { class: "button", type: "button" }, [t("add_filter")]);
  add.addEventListener("click", () => {
    const field = selectedField();
    const operator = selectedOperator();
    if (!operator) {
      return;
    }
    const item: GridFilterItem = { field: field.key, operator: operator.key };
    if (operatorNeedsValue(operator)) {
      const value = valueControl.readValue();
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
        return;
      }
      item.value = value;
    }
    view.filterModel.items.push(item);
    view.filterModel.linkOperator = linkSelect.value === "or" ? "or" : "and";
    view.page = 1;
    valueControl.reset();
    void reloadResourceView();
  });

  return el("section", { class: "filter-builder" }, [
    el("div", { class: "filter-builder__header" }, [
      el("strong", {}, [t("column_filters")]),
      el("span", { class: "cell-muted" }, [t("filter_builder_help")]),
    ]),
    existing,
    el("div", { class: "filter-builder__controls" }, [fieldSelect, operatorSelect, valueControlSlot, linkSelect, add]),
  ]);
}

function emptyFilterControl(): FilterControlReader {
  return {
    element: el("span", { class: "cell-muted" }, [t("no_value")]),
    readValue: () => undefined,
    reset: () => undefined,
  };
}

function renderFilterValueControl(
  view: ResourceViewState,
  field: ResourceField,
  operator: FilterOperatorDefinition | undefined,
): FilterControlReader {
  if (!operator || !operatorNeedsValue(operator) || operator.value_control?.kind === "none") {
    return emptyFilterControl();
  }

  const multiple = operator.value_control?.multiple ?? operator.value_kind === "multiple";
  const options = filterOptionsForField(view, field);
  if (options.length > 0) {
    const select = el("select", { class: "select", multiple: multiple || null }) as HTMLSelectElement;
    if (!multiple) {
      select.append(el("option", { value: "" }, [t("select_value")]));
    }
    for (const option of options) {
      select.append(el("option", { value: option.value }, [option.label]));
    }
    return {
      element: select,
      readValue: () => {
        const values = Array.from(select.selectedOptions).map((option) => coerceFilterScalar(field, option.value));
        return multiple ? values : values[0];
      },
      reset: () => {
        Array.from(select.options).forEach((option) => { option.selected = false; });
        if (!multiple) select.value = "";
      },
    };
  }

  const input = el("input", {
    class: "input",
    type: filterInputType(field),
    placeholder: multiple ? t("comma_values") : t("value"),
  }) as HTMLInputElement;
  return {
    element: input,
    readValue: () => filterValueFromInput(field, operator, input.value),
    reset: () => { input.value = ""; },
  };
}

function filterOptionsForField(view: ResourceViewState, field: ResourceField): RelationOption[] {
  if (field.type === "boolean") {
    return [
      { value: "true", label: t("true") },
      { value: "false", label: t("false") },
    ];
  }
  if (field.option_source?.kind === "static") {
    return field.option_source.options.map((option) => ({
      value: option.value,
      label: localizedText(option.label, option.i18n?.label),
    }));
  }
  const optionMap = view.optionMaps[field.key];
  if (!optionMap) {
    return [];
  }
  return Array.from(optionMap.entries()).map(([value, label]) => ({ value, label }));
}

function filterInputType(field: ResourceField): string {
  if (field.type === "integer" || field.type === "decimal") return "number";
  if (field.type === "date") return "date";
  if (field.type === "datetime") return "datetime-local";
  if (field.type === "email") return "email";
  return "text";
}

function filterValueFromInput(field: ResourceField, operator: FilterOperatorDefinition, raw: string): JsonValue {
  if (operator.value_kind === "multiple") {
    return raw.split(",").map((part) => coerceFilterScalar(field, part.trim())).filter((value) => value !== "");
  }
  return coerceFilterScalar(field, raw.trim());
}

function coerceFilterScalar(field: ResourceField, raw: string): JsonPrimitive {
  if (raw === "") return "";
  if (field.type === "integer") {
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? raw : parsed;
  }
  if (field.type === "decimal") {
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? raw : parsed;
  }
  if (field.type === "boolean") {
    if (["true", "1", "yes", "si", "sí"].includes(raw.toLowerCase())) return true;
    if (["false", "0", "no"].includes(raw.toLowerCase())) return false;
  }
  return raw;
}

function formatFilterValue(value: JsonValue | undefined): string {
  if (value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function renderRecordsTable(view: ResourceViewState): HTMLElement {
  const schema = view.schema;
  const columns = listFields(schema);
  if (view.records.length === 0) {
    return el("div", { class: "card" }, [el("div", { class: "empty" }, [t("no_records_returned")])]);
  }

  const table = el("table");
  const headRow = el("tr");
  const selectableRows = view.records
    .map((record) => recordIdentity(record))
    .filter((identity): identity is string => identity !== null);
  const canBatchSelect = canResourceAction(schema, "batch_delete") && selectableRows.length > 0;
  if (canBatchSelect) {
    const allSelected = selectableRows.every((id) => view.selectedIdentities.has(id));
    const selectAll = el("input", { type: "checkbox", checked: allSelected && selectableRows.length > 0 });
    selectAll.addEventListener("change", () => {
      if (selectAll.checked) {
        selectableRows.forEach((id) => view.selectedIdentities.add(id));
      } else {
        selectableRows.forEach((id) => view.selectedIdentities.delete(id));
      }
      render();
    });
    headRow.append(el("th", {}, [selectAll]));
  }
  for (const field of columns) {
    const th = el("th");
    const label = el("button", { class: "button flat", type: "button" }, [fieldName(field), field.pii ? " ⚠" : ""]);
    label.disabled = !field.sortable;
    label.title = field.sortable ? t("sort_by_field") : t("sorting_not_declared");
    label.addEventListener("click", () => {
      if (!field.sortable) {
        return;
      }
      if (view.sortField === field.key) {
        view.sortDirection = view.sortDirection === "asc" ? "desc" : "asc";
      } else {
        view.sortField = field.key;
        view.sortDirection = "asc";
      }
      view.page = 1;
      void reloadResourceView();
    });
    th.append(label);
    if (view.sortField === field.key) {
      th.append(` ${view.sortDirection === "asc" ? "↑" : "↓"}`);
    }
    headRow.append(th);
  }
  headRow.append(el("th", {}, [t("actions")]));
  table.append(el("thead", {}, [headRow]));

  const body = el("tbody");
  for (const record of view.records) {
    const row = el("tr");
    const rowIdentity = recordIdentity(record);
    if (canBatchSelect) {
      const checkbox = el("input", { type: "checkbox", checked: rowIdentity !== null && view.selectedIdentities.has(rowIdentity), disabled: rowIdentity === null });
      checkbox.addEventListener("change", () => {
        if (!rowIdentity) {
          return;
        }
        if (checkbox.checked) {
          view.selectedIdentities.add(rowIdentity);
        } else {
          view.selectedIdentities.delete(rowIdentity);
        }
        render();
      });
      row.append(el("td", {}, [checkbox]));
    }
    for (const field of columns) {
      row.append(el("td", {}, [renderCell(field, record[field.key], view.optionMaps[field.key])]));
    }
    row.append(el("td", {}, [renderRowActions(schema, record)]));
    body.append(row);
  }
  table.append(body);
  return el("div", { class: "table-wrap" }, [table]);
}

function renderRowActions(schema: ResourceSchema, record: ResourceRecord): HTMLElement {
  const actions = el("div", { class: "row-actions" });
  const identity = recordIdentity(record);
  const label = recordLabel(schema, record);
  const canView = canResourceAction(schema, "retrieve") && Boolean(identity);
  const canEdit = canResourceAction(schema, "update") && Boolean(identity && editableFields(schema, false).length > 0);
  const canDelete = canResourceAction(schema, "delete") && Boolean(identity);

  const viewButton = el("button", { class: "button", type: "button", disabled: canView ? null : true }, [t("view")]);
  viewButton.addEventListener("click", () => {
    if (canView) {
      openRecordForm(schema, "view", identity ?? "", label);
    }
  });

  const editButton = el("button", { class: "button", type: "button", disabled: canEdit ? null : true }, [t("edit")]);
  editButton.addEventListener("click", () => {
    if (canEdit) {
      openRecordForm(schema, "edit", identity ?? "", label);
    }
  });

  const deleteButton = el("button", { class: "button danger", type: "button", disabled: canDelete ? null : true }, [t("delete")]);
  deleteButton.addEventListener("click", () => {
    if (canDelete) {
      void deleteRecord(schema, identity ?? "", label);
    }
  });

  actions.append(viewButton, editButton, deleteButton);
  for (const button of relatedListButtons(schema, record)) {
    actions.append(button);
  }
  return actions;
}

function relatedListButtons(schema: ResourceSchema, record: ResourceRecord): HTMLButtonElement[] {
  return (schema.related_lists ?? []).map((relatedList) => {
    const value = record[relatedList.source_field];
    const canOpen = value !== null && value !== undefined && isScalarRecordValue(value)
      && state.resources.some((resource) => resource.key === relatedList.target_resource_alias);
    const button = el("button", {
      class: "button",
      type: "button",
      disabled: canOpen ? null : true,
      title: canOpen ? `${t("open_related")} ${relatedListName(relatedList)}` : t("related_unavailable"),
    }, [relatedListName(relatedList)]);
    button.addEventListener("click", () => {
      if (!canOpen || !isScalarRecordValue(value)) {
        return;
      }
      const filterValue: JsonValue = relatedList.operator === "isAnyOf" ? [value] : value;
      const filterModel: GridFilterModel = {
        items: [{
          field: relatedList.target_field,
          operator: relatedList.operator,
          value: filterValue,
        }],
        quickFilterValues: [],
        linkOperator: "and",
      };
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("filters", JSON.stringify(filterModel));
      void selectResource(relatedList.target_resource_alias, params);
    });
    return button;
  });
}

function isScalarRecordValue(value: RecordValue): value is JsonPrimitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function recordDetailPath(schema: ResourceSchema, identity: string): string {
  return `/api/resources/${encodeURIComponent(schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}`;
}

function recordUpdatePath(schema: ResourceSchema, identity: string): string {
  return recordDetailPath(schema, identity);
}

function recordDeletePath(schema: ResourceSchema, identity: string): string {
  return recordDetailPath(schema, identity);
}

function renderCell(field: ResourceField, value: RecordValue, optionMap?: Map<string, string>): Node {
  const control = controlForField(field);
  if (value === null || value === undefined || value === "") {
    return el("span", { class: "cell-muted" }, ["—"]);
  }

  if (field.type === "boolean") {
    return document.createTextNode(value === true ? t("yes") : t("no"));
  }

  if (field.type === "foreign_key") {
    return document.createTextNode(optionLabel(optionMap, value));
  }

  if (control === "many_to_many_select") {
    const values = Array.isArray(value) ? value : [value];
    return document.createTextNode(values.map((item) => optionLabel(optionMap, item)).join(", "));
  }

  if (field.type === "json") {
    return el("pre", { class: "cell-json" }, [safeJson(value)]);
  }

  if (field.type === "datetime") {
    return document.createTextNode(formatDateTime(String(value)));
  }

  if (field.type === "rich_text") {
    return document.createTextNode(stripTags(String(value)));
  }

  return document.createTextNode(String(value));
}

function renderPagination(view: ResourceViewState): HTMLElement {
  const totalPages = Math.max(1, Math.ceil(view.count / Math.max(1, view.pageSize)));
  const previous = el("button", { class: "button", type: "button", disabled: view.page <= 1 }, [t("previous")]);
  previous.addEventListener("click", () => {
    view.page = Math.max(1, view.page - 1);
    void reloadResourceView();
  });
  const next = el("button", { class: "button", type: "button", disabled: view.page >= totalPages }, [t("next")]);
  next.addEventListener("click", () => {
    view.page += 1;
    void reloadResourceView();
  });
  return el("div", { class: "pagination" }, [
    el("span", {}, [`${view.count} ${t("records")}`]),
    previous,
    el("span", {}, [`${t("page")} ${view.page} / ${totalPages}`]),
    next,
  ]);
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
    state.error = error instanceof Error ? error.message : t("load_resources_failed");
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

async function selectSetupWorkbookPage(updateHash = true): Promise<void> {
  if (updateHash && location.hash !== SETUP_WORKBOOK_HASH) {
    history.replaceState(null, "", SETUP_WORKBOOK_HASH);
  }
  state.selectedWorkflow = "setup_workbook";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
  if (!state.setupWorkbook.manifest) {
    await loadSetupWorkbookManifest();
  }
}

async function selectMatrixEditorPage(updateHash = true): Promise<void> {
  if (updateHash && location.hash !== MATRIX_EDITOR_HASH) {
    history.replaceState(null, "", MATRIX_EDITOR_HASH);
  }
  state.selectedWorkflow = "matrix_editor";
  state.selectedResourceKey = null;
  state.resourceView = null;
  state.message = null;
  render();
  if (!currentMatrixEditorUniverse()) {
    await loadMatrixEditorUniverse();
  }
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
    state.error = error instanceof Error ? error.message : t("load_resource_failed");
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
    view.error = error instanceof Error ? error.message : t("load_records_failed");
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
    const optionMaps = await loadFormOptions(schema, record, fields);
    clear(body);
    body.append(renderRecordForm(modal, schema, mode, record, optionMaps, identity));
  } catch (error) {
    clear(body);
    body.append(el("div", { class: "error" }, [error instanceof Error ? error.message : t("load_form_failed")]));
  }
}

async function loadFormOptions(
  schema: ResourceSchema,
  record: ResourceRecord,
  fields: ResourceField[],
): Promise<Record<string, RelationOption[]>> {
  const optionFields = fields.filter((field) => field.option_source || field.relation);
  const result: Record<string, RelationOption[]> = {};
  await Promise.all(optionFields.map(async (field) => {
    if (field.option_source?.kind === "static") {
      result[field.key] = field.option_source.options.map((option) => ({
        value: option.value,
        label: localizedText(option.label, option.i18n?.label),
      }));
      return;
    }
    if (field.relation) {
      result[field.key] = await fetchRelationOptions(schema, field, record, true);
    }
  }));
  return result;
}

async function fetchRelationOptions(
  schema: ResourceSchema,
  field: ResourceField,
  values: Record<string, RecordValue> = {},
  requireDependencies = false,
  search = "",
): Promise<RelationOption[]> {
  const params = optionQueryParams(field, values, requireDependencies, search);
  if (!params) {
    return [];
  }
  try {
    const response = await apiFetch<OptionsResponse>(resourceOptionsPath(schema, field.key, params));
    return response.options;
  } catch {
    return [];
  }
}

function optionQueryParams(
  field: ResourceField,
  values: Record<string, RecordValue> = {},
  requireDependencies = false,
  search = "",
): Record<string, string> | null {
  const pageSize = field.relation?.page_size ?? 100;
  const params: Record<string, string> = { page_size: String(pageSize) };
  const dependencyFilterModel = relationDependencyFilterModel(field, values, requireDependencies);
  if (dependencyFilterModel === null) {
    return null;
  }
  if (dependencyFilterModel.items.length > 0) {
    params.filters = JSON.stringify(dependencyFilterModel);
  }
  if (search.trim()) {
    params.q = search.trim();
  }
  return params;
}

function relationDependencyFilterModel(
  field: ResourceField,
  values: Record<string, RecordValue>,
  requireDependencies: boolean,
): GridFilterModel | null {
  const dependencies = field.relation?.dependencies ?? [];
  const items: GridFilterItem[] = [];
  for (const dependency of dependencies) {
    const sourceValue = values[dependency.source_field];
    if (isMissingDependencyValue(sourceValue)) {
      if (requireDependencies) {
        return null;
      }
      continue;
    }
    items.push({
      field: dependency.target_field,
      operator: dependency.operator,
      value: dependencyFilterValue(dependency.operator, sourceValue),
    });
  }
  return { items, quickFilterValues: [], linkOperator: "and" };
}

function dependencyFilterValue(operator: string, value: RecordValue): JsonValue {
  if (operator === "isAnyOf") {
    return Array.isArray(value) ? value.filter(isJsonPrimitive) : isJsonPrimitive(value) ? [value] : [];
  }
  return isJsonPrimitive(value) || Array.isArray(value) || (value && typeof value === "object") ? value : null;
}

function isMissingDependencyValue(value: RecordValue): boolean {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

function isJsonPrimitive(value: RecordValue): value is JsonPrimitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function validationAttributes(field: ResourceField, readonly: boolean): Record<string, string | number | boolean | null | undefined> {
  const validation = field.validation ?? {};
  return {
    required: (validation.required ?? field.required) && !readonly,
    maxlength: validation.max_length,
    minlength: validation.min_length,
    max: validation.max_value,
    min: validation.min_value,
    step: validation.step,
    pattern: validation.pattern,
    title: validationTitle(field),
  };
}

function validationTitle(field: ResourceField): string | undefined {
  return field.validation?.pattern ? `${t("expected_pattern")}: ${field.validation.pattern}` : undefined;
}

function validationHintNodes(field: ResourceField, readonly: boolean): Node[] {
  if (readonly) {
    return [];
  }
  const hints = validationHints(field);
  return hints.length ? [el("small", { class: "validation-hints" }, [hints.join(" · ")])] : [];
}

function validationHints(field: ResourceField): string[] {
  const validation = field.validation ?? {};
  const hints = new Set<string>();
  if ((validation.required ?? field.required) && !field.nullable) hints.add(t("required"));
  if (validation.min_length !== undefined) hints.add(formatText("min_chars", { value: validation.min_length }));
  if (validation.max_length !== undefined) hints.add(formatText("max_chars", { value: validation.max_length }));
  if (validation.min_value !== undefined) hints.add(formatText("min_number", { value: validation.min_value }));
  if (validation.max_value !== undefined) hints.add(formatText("max_number", { value: validation.max_value }));
  if (validation.decimal_places !== undefined) hints.add(formatText("decimal_places", { value: validation.decimal_places }));
  if (validation.format === "email") hints.add(t("email_format"));
  if (validation.format === "json") hints.add(t("valid_json"));
  if (validation.pattern) hints.add(t("must_match_pattern"));
  return [...hints];
}

function controlForField(field: ResourceField): AdminControl {
  if (field.admin_control) {
    return field.admin_control;
  }
  if (field.type === "boolean") return "checkbox";
  if (field.type === "text" || field.type === "rich_text") return "textarea";
  if (field.type === "json") return "json_textarea";
  if (field.type === "integer" || field.type === "decimal") return "number_input";
  if (field.type === "date") return "date_input";
  if (field.type === "datetime") return "datetime_input";
  if (field.type === "email") return "email_input";
  if (field.type === "enum") return "enum_select";
  if (field.type === "foreign_key") return "fk_select";
  if (field.type === "many_to_many") return "many_to_many_select";
  return "text_input";
}

function usesTypeaheadOptions(field: ResourceField): boolean {
  return field.relation?.option_control === "typeahead";
}
function renderRecordForm(
  modal: HTMLElement,
  schema: ResourceSchema,
  mode: "create" | "view" | "edit",
  record: ResourceRecord,
  optionsByField: Record<string, RelationOption[]>,
  identity = "",
): HTMLElement {
  const readonly = mode === "view";
  const form = el("form", { class: "stack" });
  const fields = sortFormFields(readonly ? detailFields(schema) : editableFields(schema, mode === "create"));
  const grid = el("div", { class: "form-grid" });

  let currentSection: string | null = null;
  for (const field of fields) {
    const section = fieldUiText(field, "section")?.trim() || null;
    if (section && section !== currentSection) {
      grid.append(el("div", { class: "form-section field--full" }, [section]));
      currentSection = section;
    }
    grid.append(renderInputField(field, record[field.key], optionsByField[field.key] ?? [], readonly));
  }

  const errorBox = el("div", { class: "error", hidden: true });
  const footer = el("div", { class: "modal__footer" });
  const cancel = el("button", { class: "button", type: "button" }, [readonly ? t("close") : t("cancel")]);
  cancel.addEventListener("click", () => modal.remove());
  footer.append(cancel);

  if (!readonly) {
    const submit = el("button", { class: "button primary", type: "submit" }, [mode === "create" ? t("create_resource") : t("save")]);
    footer.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitRecordForm(form, submit, errorBox, modal, schema, mode, fields, identity);
    });
  }

  form.append(grid, errorBox, footer);
  wireTypeaheadRelationSelectors(form, schema, fields, readonly);
  wireDependentRelationSelectors(form, schema, fields, readonly);
  return form;
}

function sortFormFields(fields: ResourceField[]): ResourceField[] {
  return [...fields].sort((left, right) => {
    if (fieldDependsOn(left, right.key)) return 1;
    if (fieldDependsOn(right, left.key)) return -1;
    const leftPriority = left.ui?.priority ?? left.relation?.priority ?? 1000;
    const rightPriority = right.ui?.priority ?? right.relation?.priority ?? 1000;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    return fieldName(left).localeCompare(fieldName(right));
  });
}

function fieldDependsOn(field: ResourceField, sourceFieldKey: string): boolean {
  return (field.relation?.depends_on ?? []).includes(sourceFieldKey);
}

function renderInputField(field: ResourceField, value: RecordValue, options: RelationOption[], readonly: boolean): HTMLElement {
  const labelChildren: Array<Node | string> = [fieldName(field)];
  if (field.required && !readonly) {
    labelChildren.push(el("span", { class: "required" }, [" *"]));
  }
  if (field.pii) {
    labelChildren.push(el("span", { class: "pii" }, [" PII"]));
  }

  const input = inputForField(field, value, options, readonly);
  return el("div", { class: fieldContainerClass(field) }, [
    el("label", { for: field.key }, labelChildren),
    input,
    fieldHelpText(field) ? el("small", {}, [fieldHelpText(field) ?? ""]) : null,
    ...validationHintNodes(field, readonly),
  ]);
}


function fieldContainerClass(field: ResourceField): string {
  const width = field.ui?.width;
  if (width === "full") return "field field--full";
  if (width === "half") return "field field--half";
  if (width === "third") return "field field--third";
  return "field";
}

function inputForField(field: ResourceField, value: RecordValue, options: RelationOption[], readonly: boolean): HTMLElement {
  const control = controlForField(field);
  if (control === "checkbox") {
    const input = el("input", {
      id: field.key,
      name: field.key,
      type: "checkbox",
      checked: value === true,
      disabled: readonly,
      "data-field-type": field.type,
    });
    return el("div", { class: "checkbox-row" }, [input, el("span", {}, [value === true ? t("yes") : t("no")])]);
  }

  if (control === "enum_select" || control === "fk_select") {
    const select = el("select", {
      id: field.key,
      name: field.key,
      class: "select",
      disabled: readonly,
      ...validationAttributes(field, readonly),
      "data-field-type": field.type,
    });
    if (field.nullable || !field.required) {
      select.append(el("option", { value: "" }, [fieldUiText(field, "placeholder") ?? "—"]));
    }
    for (const option of options) {
      const optionValue = String(option.value);
      select.append(el("option", { value: optionValue, selected: String(value ?? "") === optionValue }, [option.label]));
    }
    if (control === "fk_select" && usesTypeaheadOptions(field) && !readonly) {
      return relationTypeaheadControl(field, select);
    }
    return select;
  }

  if (control === "many_to_many_select") {
    const selected = new Set((Array.isArray(value) ? value : []).map((item) => String(item)));
    const select = el("select", {
      id: field.key,
      name: field.key,
      class: "select",
      multiple: true,
      disabled: readonly,
      "data-field-type": field.type,
    });
    for (const option of options) {
      const optionValue = String(option.value);
      select.append(el("option", { value: optionValue, selected: selected.has(optionValue) }, [option.label]));
    }
    if (usesTypeaheadOptions(field) && !readonly) {
      return relationTypeaheadControl(field, select);
    }
    return select;
  }

  if (control === "textarea" || control === "json_textarea") {
    const textValue = field.type === "json" ? safeJson(value ?? null) : String(value ?? "");
    return el("textarea", {
      id: field.key,
      name: field.key,
      class: "textarea",
      disabled: readonly,
      ...validationAttributes(field, readonly),
      placeholder: fieldUiText(field, "placeholder"),
      "data-field-type": field.type,
    }, [textValue]);
  }

  const type = inputType(field, control);
  return el("input", {
    id: field.key,
    name: field.key,
    class: "input",
    type,
    value: inputValue(field, value),
    disabled: readonly,
    ...validationAttributes(field, readonly),
    placeholder: fieldUiText(field, "placeholder"),
    "data-field-type": field.type,
  });
}

function relationTypeaheadControl(field: ResourceField, select: HTMLSelectElement): HTMLElement {
  const search = el("input", {
    class: "input relation-search",
    type: "search",
    placeholder: fieldUiText(field, "placeholder") ?? t("search_options"),
    "data-typeahead-for": field.key,
    "aria-label": formatText("search_field_options", { field: fieldName(field) }),
  });
  const wrapper = el("div", { class: "relation-typeahead" }, [search, select]);
  return wrapper;
}

function wireTypeaheadRelationSelectors(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  readonly: boolean,
): void {
  if (readonly) {
    return;
  }
  const typeaheadFields = fields.filter((field) => usesTypeaheadOptions(field));
  for (const field of typeaheadFields) {
    const search = typeaheadSearchInput(form, field.key);
    const select = form.elements.namedItem(field.key);
    if (!search || !(select instanceof HTMLSelectElement)) {
      continue;
    }
    search.addEventListener("change", () => {
      void refreshOneRelationSelector(form, schema, fields, field);
    });
  }
}

function typeaheadSearchInput(form: HTMLFormElement, fieldKey: string): HTMLInputElement | null {
  return Array.from(form.querySelectorAll<HTMLInputElement>("input[data-typeahead-for]")).find((input) => input.dataset.typeaheadFor === fieldKey) ?? null;
}

async function refreshOneRelationSelector(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  field: ResourceField,
): Promise<void> {
  const select = form.elements.namedItem(field.key);
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }
  const currentValue = select.multiple
    ? Array.from(select.selectedOptions).map((option) => option.value)
    : select.value;
  const values = formValues(form, fields);
  const search = typeaheadSearchInput(form, field.key)?.value ?? "";
  const params = optionQueryParams(field, values, true, search);
  if (!params) {
    replaceSelectOptions(select, field, [], select.multiple ? [] : "", t("select_dependencies_first"));
    select.disabled = true;
    return;
  }
  select.disabled = true;
  const options = await fetchRelationOptions(schema, field, values, true, search);
  replaceSelectOptions(select, field, options, currentValue, options.length ? "—" : t("no_options_match"));
  select.disabled = false;
}

function wireDependentRelationSelectors(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  readonly: boolean,
): void {
  if (readonly) {
    return;
  }
  const dependentFields = fields.filter((field) => ((field.relation?.dependencies ?? []).length > 0));
  if (dependentFields.length === 0) {
    return;
  }
  setDependentSelectorAvailability(form, fields, dependentFields);
  const sourceFieldKeys = new Set(dependentFields.flatMap((field) => field.relation?.depends_on ?? []));
  for (const sourceFieldKey of sourceFieldKeys) {
    const element = form.elements.namedItem(sourceFieldKey);
    if (element instanceof HTMLElement) {
      element.addEventListener("change", () => {
        void refreshDependentRelationSelectors(form, schema, fields, dependentFields);
      });
    }
  }
}

function setDependentSelectorAvailability(
  form: HTMLFormElement,
  fields: ResourceField[],
  dependentFields: ResourceField[],
): void {
  const values = formValues(form, fields);
  for (const field of dependentFields) {
    const select = form.elements.namedItem(field.key);
    if (!(select instanceof HTMLSelectElement)) {
      continue;
    }
    const dependenciesReady = relationDependencyFilterModel(field, values, true) !== null;
    select.disabled = !dependenciesReady;
    if (!dependenciesReady) {
      replaceSelectOptions(select, field, [], select.multiple ? [] : "", t("select_dependencies_first"));
    }
  }
}

async function refreshDependentRelationSelectors(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  dependentFields: ResourceField[],
): Promise<void> {
  for (const field of sortFormFields(dependentFields)) {
    const select = form.elements.namedItem(field.key);
    if (!(select instanceof HTMLSelectElement)) {
      continue;
    }
    await refreshOneRelationSelector(form, schema, fields, field);
  }
}

function formValues(form: HTMLFormElement, fields: ResourceField[]): Record<string, RecordValue> {
  const values: Record<string, RecordValue> = {};
  for (const field of fields) {
    const element = form.elements.namedItem(field.key);
    if (!element) {
      continue;
    }
    values[field.key] = valueFromElement(element, field);
  }
  return values;
}

function replaceSelectOptions(
  select: HTMLSelectElement,
  field: ResourceField,
  options: RelationOption[],
  selectedValue: string | string[],
  emptyLabel = "—",
): void {
  const selected = new Set(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
  clear(select);
  if (!select.multiple && (field.nullable || !field.required || options.length === 0)) {
    select.append(el("option", { value: "" }, [emptyLabel]));
  }
  for (const option of options) {
    const optionValue = String(option.value);
    select.append(el("option", { value: optionValue, selected: selected.has(optionValue) }, [option.label]));
  }
}

async function submitRecordForm(
  form: HTMLFormElement,
  submit: HTMLButtonElement,
  errorBox: HTMLElement,
  modal: HTMLElement,
  schema: ResourceSchema,
  mode: "create" | "edit",
  fields: ResourceField[],
  identity = "",
): Promise<void> {
  submit.disabled = true;
  submit.textContent = mode === "create" ? t("creating") : t("saving");
  errorBox.hidden = true;
  errorBox.textContent = "";

  try {
    const clientErrors = clientValidationErrors(form, fields);
    if (clientErrors.length > 0) {
      errorBox.hidden = false;
      errorBox.textContent = clientErrors.join("\n");
      form.reportValidity();
      return;
    }
    const payload = formPayload(form, fields, mode);
    if (mode === "create") {
      await apiFetch<ResourceRecord>(resourceCreatePath(schema), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.message = null;
      notify("success", `${resourceName(schema)} ${t("created")}.`);
    } else {
      await apiFetch<ResourceRecord>(recordUpdatePath(schema, identity), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      state.message = null;
      notify("success", `${resourceName(schema)} ${t("updated")}.`);
    }
    modal.remove();
    await reloadResourceView();
  } catch (error) {
    const message = error instanceof Error ? error.message : t("save_failed");
    errorBox.hidden = false;
    errorBox.textContent = message;
    notify("error", message);
  } finally {
    submit.disabled = false;
    submit.textContent = mode === "create" ? t("create_resource") : t("save");
    render();
  }
}


function clientValidationErrors(form: HTMLFormElement, fields: ResourceField[]): string[] {
  const errors: string[] = [];
  if (!form.checkValidity()) {
    errors.push(t("fix_highlighted_fields"));
  }
  for (const field of fields) {
    const element = form.elements.namedItem(field.key);
    if (!(element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement)) {
      continue;
    }
    const raw = element.value.trim();
    if (field.type === "json" && raw) {
      try {
        JSON.parse(raw);
      } catch {
        errors.push(`${fieldName(field)} ${t("valid_json_required")}`);
      }
    }
  }
  return Array.from(new Set(errors));
}

function formPayload(form: HTMLFormElement, fields: ResourceField[], mode: "create" | "edit"): Record<string, JsonValue> {
  const payload: Record<string, JsonValue> = {};
  for (const field of fields) {
    const element = form.elements.namedItem(field.key);
    if (!element) {
      continue;
    }
    const value = valueFromElement(element, field);
    if (mode === "edit" && field.write_only && (value === "" || value === null)) {
      continue;
    }
    if (mode === "create" && !field.required && (value === "" || value === null || (Array.isArray(value) && value.length === 0))) {
      continue;
    }
    payload[field.key] = value;
  }
  return payload;
}

function valueFromElement(element: RadioNodeList | Element, field: ResourceField): JsonValue {
  if (element instanceof HTMLInputElement && field.type === "boolean") {
    return element.checked;
  }
  if (element instanceof HTMLSelectElement && field.type === "many_to_many") {
    return Array.from(element.selectedOptions).map((option) => coerceScalar(option.value));
  }
  const raw = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement
    ? element.value
    : "";
  if (raw === "") {
    return field.nullable ? null : "";
  }
  if (field.type === "integer") {
    const parsed = Number.parseInt(raw, 10);
    return Number.isNaN(parsed) ? raw : parsed;
  }
  if (field.type === "decimal") {
    const parsed = Number.parseFloat(raw);
    return Number.isNaN(parsed) ? raw : parsed;
  }
  if (field.type === "foreign_key") {
    return coerceScalar(raw);
  }
  if (field.type === "json") {
    try {
      return JSON.parse(raw) as JsonValue;
    } catch {
      return raw;
    }
  }
  return raw;
}

function coerceScalar(value: string): string | number {
  if (/^-?\d+$/.test(value)) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  }
  return value;
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
    view.error = error instanceof Error ? error.message : t("batch_delete_failed");
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
      state.resourceView.error = error instanceof Error ? error.message : t("delete_failed");
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

function listFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => !field.write_only && field.visible_in_list);
}

function detailFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => !field.write_only);
}

function editableFields(schema: ResourceSchema, creating: boolean): ResourceField[] {
  return schema.fields.filter((field) => field.editable && (creating || !field.readonly_on_update));
}

function canResourceAction(schema: ResourceSchema, action: ResourceAction): boolean {
  return schema.actions?.[action] === true;
}

function recordIdentity(record: ResourceRecord): string | null {
  const identity = record.__identity;
  return typeof identity === "string" && identity.trim() ? identity : null;
}

function schemaHasDependentRelations(schema: ResourceSchema): boolean {
  return schema.fields.some((field) => (field.relation?.depends_on.length ?? 0) > 0);
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

function optionLabel(optionMap: Map<string, string> | undefined, value: RecordValue): string {
  if (value === null || value === undefined) {
    return "—";
  }
  const key = String(value);
  return optionMap?.get(key) ?? key;
}

function safeJson(value: RecordValue): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function stripTags(value: string): string {
  const template = document.createElement("template");
  template.innerHTML = value;
  return template.content.textContent ?? "";
}

function inputType(field: ResourceField, control: AdminControl): string {
  if (control === "email_input") return "email";
  if (control === "number_input") return "number";
  if (control === "date_input") return "date";
  if (control === "datetime_input") return "datetime-local";
  switch (field.type) {
    case "email":
      return "email";
    case "integer":
    case "decimal":
      return "number";
    case "date":
      return "date";
    case "datetime":
      return "datetime-local";
    case "string":
    default:
      return "text";
  }
}

function inputValue(field: ResourceField, value: RecordValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (field.type === "datetime" && typeof value === "string") {
    return value.slice(0, 16);
  }
  return String(value);
}

function displayUser(user: AuthUser): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name ? `${name} (${user.username})` : user.username;
}

window.addEventListener("hashchange", () => {
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
  const parsed = parseResourceHash();
  if (parsed.resourceKey) {
    void selectResource(parsed.resourceKey, parsed.params, false);
  }
});

async function boot(): Promise<void> {
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
  const parsed = parseResourceHash();
  if (parsed.resourceKey && state.resources.some((resource) => resource.key === parsed.resourceKey)) {
    await selectResource(parsed.resourceKey, parsed.params, false);
  }
  render();
}

void boot();
