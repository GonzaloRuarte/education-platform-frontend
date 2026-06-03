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
  description?: LocalizedText;
  admin_help_text?: LocalizedText;
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

type ResourceAction = "list" | "retrieve" | "create" | "update" | "delete";

type StaticOption = {
  value: string;
  label: string;
  i18n?: { label?: LocalizedText };
};

type OptionSource =
  | {
      kind: "static";
      options: StaticOption[];
    }
  | {
      kind: "resource";
      resource_key: string;
      value_field: string;
      label_field: string;
      depends_on: string[];
    };

type RelationDefinition = {
  kind: "foreign_key" | "many_to_many";
  resource_key: string;
  value_field: string;
  label_field: string;
  searchable_fields?: string[];
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
  pattern?: string;
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
  label: string;
  type: FieldType;
  required: boolean;
  nullable: boolean;
  editable: boolean;
  readonly_on_update: boolean;
  visible_in_list: boolean;
  searchable: boolean;
  sortable: boolean;
  filterable: boolean;
  pii: boolean;
  visible_capability: string | null;
  write_only: boolean;
  help_text?: string;
  admin_control?: AdminControl | null;
  validation?: FieldValidation;
  ui?: FieldUi;
  i18n?: FieldI18n;
  option_source?: OptionSource;
  relation?: RelationDefinition;
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
  key: string;
  label: string;
  target_resource_key: string;
  target_field: string;
  source_field: string;
  operator: string;
  i18n?: { label?: LocalizedText };
};

type RecordResourceUrls = {
  detail?: string;
  update?: string;
  delete?: string;
};

type ResourceUrls = {
  schema?: string;
  list?: string;
  create?: string;
  batch_delete?: string;
  options_template?: string;
};

type RecordPayloadContract = {
  relation_values?: string;
  reverse_relations?: string;
  nested_relations?: boolean;
  write_shape?: string;
  metadata_fields?: string[];
};

type MigrationSafetyContract = {
  schema_evolution?: string;
  query_construction?: string;
  unsupported_fields_or_operators?: string;
  frontend_query_shape?: string;
  permission_changes?: string;
  database_policy_mirroring?: {
    status?: string;
    source_of_truth?: string;
    database_roles?: string[];
    reason?: string;
  };
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

type ListQueryContract = {
  filters?: {
    query_param?: string;
    encoding?: string;
    supported_operators?: string[];
    operators?: FilterOperatorDefinition[];
  };
};

type RecordIdentity = {
  kind: "single_pk" | "composite" | string;
  fields: string[];
};

type ResourceSchema = {
  key: string;
  label: string;
  plural_label: string;
  primary_key_fields: string[];
  fields: ResourceField[];
  capabilities: Partial<Record<ResourceAction, string>>;
  business_actions: ResourceAction[];
  default_sort: string[];
  page_size: number;
  description?: string;
  admin_help_text?: string;
  destructive_actions?: Record<string, DestructiveAction>;
  resource_urls?: ResourceUrls;
  record_payload_contract?: RecordPayloadContract;
  migration_safety_contract?: MigrationSafetyContract;
  navigation?: ResourceNavigation;
  record_identity?: RecordIdentity;
  i18n?: ResourceI18n;
  display_label_field?: string | null;
  related_lists?: RelatedListDefinition[];
  list_query_contract?: ListQueryContract;
};

type ResourcesResponse = {
  resources: ResourceSchema[];
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
  capabilities: string[];
  user: AuthUser;
};

type AppState = {
  resources: ResourceSchema[];
  selectedResourceKey: string | null;
  resourceFilter: string;
  resourceView: ResourceViewState | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  locale: Locale;
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
  selectedIds: Set<string>;
  loading: boolean;
  error: string | null;
};

type ApiErrorPayload = {
  detail?: string;
  message?: string;
  request_id?: string;
  [key: string]: unknown;
};

const SURFACE = "db_admin";
const ACCESS_DB_ADMIN = "access_db_admin";
const DEFAULT_PAGE_SIZE = 25;
const STORAGE_SESSION = "retrobolt.admin.session";
const STORAGE_API_BASE = "retrobolt.admin.apiBaseUrl";
const STORAGE_LOCALE = "retrobolt.admin.locale";
const RESOURCE_HASH_PREFIX = "#/resources/";
const appRootElement = document.getElementById("app");

if (!(appRootElement instanceof HTMLElement)) {
  throw new Error("Missing #app root element.");
}

const appRoot: HTMLElement = appRootElement;

const state: AppState = {
  resources: [],
  selectedResourceKey: null,
  resourceFilter: "",
  resourceView: null,
  loading: false,
  error: null,
  message: null,
  locale: loadLocale(),
};

function loadLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_LOCALE);
  if (stored === "en" || stored === "es") return stored;
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function setLocale(locale: Locale): void {
  state.locale = locale;
  localStorage.setItem(STORAGE_LOCALE, locale);
}

function localizedText(fallback: string, text?: LocalizedText): string {
  if (!text) return fallback;
  return text[state.locale] || text.en || text.es || fallback;
}

function resourceName(resource: ResourceSchema, plural = false): string {
  return localizedText(
    plural ? (resource.plural_label || resource.label || resource.key) : (resource.label || resource.key),
    plural ? resource.i18n?.plural_label : resource.i18n?.label,
  );
}

function resourceDescription(resource: ResourceSchema): string {
  return localizedText(resource.description ?? "", resource.i18n?.description);
}

function resourceHelpText(resource: ResourceSchema): string {
  return localizedText(resource.admin_help_text ?? "", resource.i18n?.admin_help_text);
}

function fieldName(field: ResourceField): string {
  return localizedText(field.label || field.key, field.i18n?.label);
}

function relatedListName(relatedList: RelatedListDefinition): string {
  return localizedText(relatedList.label, relatedList.i18n?.label);
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
  const stored = localStorage.getItem(STORAGE_API_BASE);
  if (stored !== null) {
    return stored;
  }
  return window.__RETROBOLT_ADMIN_CONFIG__?.apiBaseUrl ?? "";
}

function setApiBaseUrl(value: string): void {
  localStorage.setItem(STORAGE_API_BASE, trimTrailingSlash(value.trim()));
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return `${trimTrailingSlash(configApiBaseUrl())}${path}`;
}

function resourcePath(resourceKey: string): string {
  return `/api/resources/${encodeURIComponent(resourceKey)}/`;
}

function recordsPath(resourceKey: string): string {
  return `/api/resources/${encodeURIComponent(resourceKey)}/records/`;
}

function recordPath(resourceKey: string, recordPk: string): string {
  return `/api/resources/${encodeURIComponent(resourceKey)}/records/${encodeURIComponent(recordPk)}/`;
}

function optionsPath(resourceKey: string, fieldKey: string): string {
  return `/api/resources/${encodeURIComponent(resourceKey)}/options/${encodeURIComponent(fieldKey)}/`;
}

function resourceListPath(schema: ResourceSchema, params: Record<string, string> = {}): string {
  return schema.resource_urls?.list
    ? withQueryParams(schema.resource_urls.list, params)
    : withSurface(recordsPath(schema.key), params);
}

function resourceCreatePath(schema: ResourceSchema): string {
  return schema.resource_urls?.create ?? withSurface(recordsPath(schema.key));
}

function resourceBatchDeletePath(schema: ResourceSchema): string {
  return schema.resource_urls?.batch_delete ?? withSurface(recordsPath(schema.key));
}

function resourceOptionsPath(schema: ResourceSchema, fieldKey: string, params: Record<string, string> = {}): string {
  const template = schema.resource_urls?.options_template;
  if (template) {
    return withQueryParams(template.replace("{field_key}", encodeURIComponent(fieldKey)), params);
  }
  return withSurface(optionsPath(schema.key, fieldKey), params);
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
      Array.isArray(parsed.capabilities) &&
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

function hasCapability(capability: string): boolean {
  return readSession()?.capabilities.includes(capability) ?? false;
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

async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const session = readSession();
  const headers = new Headers(init.headers);
  if (session) {
    headers.set("Authorization", `Bearer ${session.token.access}`);
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(apiUrl(path), { ...init, headers });
  if (response.status === 401 && retry && (await refreshAccessToken())) {
    return apiFetch<T>(path, init, false);
  }

  if (!response.ok) {
    throw new Error(await responseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
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
  const operators = schema.list_query_contract?.filters?.operators ?? [];
  if (operators.length === 0) {
    return fallbackOperatorsForField(field);
  }
  return operators.filter((operator) => !operator.field_types || operator.field_types.includes(field.type));
}

function fallbackOperatorsForField(field: ResourceField): FilterOperatorDefinition[] {
  const all: FilterOperatorDefinition[] = [
    { key: "contains", label: "contains", value_kind: "single", field_types: ["string", "text", "rich_text", "email"], value_control: { kind: "field", multiple: false } },
    { key: "equals", label: "equals", value_kind: "single", value_control: { kind: "field", multiple: false } },
    { key: "isAnyOf", label: "is any of", value_kind: "multiple", value_control: { kind: "field", multiple: true } },
    { key: "isEmpty", label: "is empty", value_kind: "none", value_control: { kind: "none", multiple: false } },
    { key: "isNotEmpty", label: "is not empty", value_kind: "none", value_control: { kind: "none", multiple: false } },
  ];
  return all.filter((operator) => !operator.field_types || operator.field_types.includes(field.type));
}

function operatorLabel(operator: FilterOperatorDefinition): string {
  return localizedText(operator.label || operator.key, operator.i18n?.label);
}

function operatorNeedsValue(operator: FilterOperatorDefinition | undefined): boolean {
  return (operator?.value_kind ?? "single") !== "none";
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

function render(): void {
  clear(appRoot);
  const session = readSession();
  if (!session) {
    appRoot.append(renderLogin());
    return;
  }

  if (!session.capabilities.includes(ACCESS_DB_ADMIN)) {
    appRoot.append(renderForbidden(session));
    return;
  }

  appRoot.append(renderShell(session));
}

function renderLogin(): HTMLElement {
  const apiBaseInput = el("input", {
    class: "input",
    name: "apiBaseUrl",
    autocomplete: "url",
    placeholder: "Same origin",
    value: configApiBaseUrl(),
  });
  const usernameInput = el("input", {
    class: "input",
    name: "username",
    autocomplete: "username",
    required: true,
    placeholder: "Username",
  });
  const passwordInput = el("input", {
    class: "input",
    name: "password",
    type: "password",
    autocomplete: "current-password",
    required: true,
    placeholder: "Password",
  });
  const errorBox = el("div", { class: "error", hidden: true });
  const submit = el("button", { class: "button primary", type: "submit" }, ["Sign in"]);

  const form = el("form", { class: "stack" }, [
    fieldShell("API base URL", apiBaseInput, "Blank means same origin as this frontend."),
    fieldShell("Username", usernameInput),
    fieldShell("Password", passwordInput),
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
          el("h1", {}, ["Retrobolt DB Admin"]),
          el("p", {}, ["Generic runtime admin. No table or field knowledge is compiled into this UI."]),
        ]),
        form,
      ]),
    ]),
  ]);
}

async function handleLogin(form: HTMLFormElement, submit: HTMLButtonElement, errorBox: HTMLElement): Promise<void> {
  const data = new FormData(form);
  const username = String(data.get("username") ?? "");
  const password = String(data.get("password") ?? "");
  const apiBaseUrl = String(data.get("apiBaseUrl") ?? "");
  setApiBaseUrl(apiBaseUrl);

  submit.disabled = true;
  submit.textContent = "Signing in...";
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
    await loadResources();
  } catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = error instanceof Error ? error.message : "Login failed.";
  } finally {
    submit.disabled = false;
    submit.textContent = "Sign in";
    render();
  }
}

function renderForbidden(session: AuthSession): HTMLElement {
  const logoutButton = el("button", { class: "button" }, ["Sign out"]);
  logoutButton.addEventListener("click", () => {
    clearSession();
    state.resources = [];
    render();
  });

  return el("main", { class: "login-page" }, [
    el("section", { class: "card login-card" }, [
      el("div", { class: "card__body stack" }, [
        el("h1", {}, ["DB Admin access required"]),
        el("p", {}, [
          `${displayUser(session.user)} is authenticated, but this frontend only exposes the runtime DB Admin surface and requires `,
          el("code", {}, [ACCESS_DB_ADMIN]),
          ".",
        ]),
        logoutButton,
      ]),
    ]),
  ]);
}

function renderShell(session: AuthSession): HTMLElement {
  const shell = el("div", { class: "app-shell" });
  shell.append(renderSidebar(session));
  shell.append(renderMain());
  return shell;
}

function renderSidebar(session: AuthSession): HTMLElement {
  const filterInput = el("input", {
    class: "resource-filter",
    placeholder: "Filter resources...",
    value: state.resourceFilter,
  });
  filterInput.addEventListener("input", () => {
    state.resourceFilter = filterInput.value;
    render();
  });

  const localeSelect = el("select", { class: "select small", "aria-label": "Language" });
  localeSelect.append(
    el("option", { value: "en", selected: state.locale === "en" }, ["English"]),
    el("option", { value: "es", selected: state.locale === "es" }, ["Español"]),
  );
  localeSelect.addEventListener("change", () => {
    setLocale(localeSelect.value === "es" ? "es" : "en");
    render();
  });

  const visibleResources = filteredResources();
  const nav = el("nav", { class: "resource-nav", "aria-label": "Resources" });
  let currentGroup = "";
  for (const resource of visibleResources) {
    const group = resource.navigation?.group ?? "Resources";
    if (group !== currentGroup) {
      currentGroup = group;
      nav.append(el("div", { class: "resource-group" }, [group]));
    }
    const item = el("button", {
      class: resource.key === state.selectedResourceKey ? "active" : "",
      type: "button",
      title: resource.key,
    }, [resourceName(resource, true)]);
    item.addEventListener("click", () => {
      void selectResource(resource.key);
    });
    nav.append(item);
  }
  if (visibleResources.length === 0) {
    nav.append(el("div", { class: "empty" }, ["No resources match."]));
  }

  const refresh = el("button", { class: "logout", type: "button" }, ["Refresh resources"]);
  refresh.addEventListener("click", () => {
    void loadResources();
  });

  const logout = el("button", { class: "logout", type: "button" }, ["Sign out"]);
  logout.addEventListener("click", () => {
    clearSession();
    state.resources = [];
    state.selectedResourceKey = null;
    state.resourceView = null;
    render();
  });

  return el("aside", { class: "sidebar" }, [
    el("div", {}, [
      el("h1", { class: "sidebar__title" }, ["Retrobolt Admin"]),
      el("p", { class: "sidebar__subtitle" }, ["Runtime DB Admin surface"]),
    ]),
    el("div", { class: "user-card" }, [
      el("strong", {}, [displayUser(session.user)]),
      el("span", {}, [`${session.capabilities.length} capabilities loaded`]),
    ]),
    el("div", { class: "sidebar__section stack" }, [filterInput, localeSelect, refresh]),
    nav,
    el("div", { class: "sidebar__section" }, [logout]),
  ]);
}

function renderMain(): HTMLElement {
  const main = el("main", { class: "main" });
  if (state.loading) {
    main.append(renderLoadingPage("Loading admin resources..."));
    return main;
  }
  if (state.error) {
    main.append(renderErrorPage(state.error));
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
    main.append(renderLoadingPage("Loading resource..."));
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
  const retry = el("button", { class: "button primary", type: "button" }, ["Retry"]);
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
      el("h2", {}, ["No DB Admin resources returned"]),
      el("p", { class: "page-subtitle" }, [
        "The backend returned an empty resource list for surface=db_admin. Confirm the user has access_db_admin and that ResourceMeta resources are exposed.",
      ]),
    ]),
  ]);
}

function renderWelcomePage(): HTMLElement {
  const first = state.resources[0];
  const openFirst = el("button", { class: "button primary", type: "button", disabled: first ? null : true }, ["Open first resource"]);
  openFirst.addEventListener("click", () => {
    if (first) {
      void selectResource(first.key);
    }
  });
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h2", {}, ["DB Admin ready"]),
      el("p", { class: "page-subtitle" }, [
        `Discovered ${state.resources.length} resources at runtime. Select one from the sidebar to list, create, update, or delete records through the generic backend contract.`,
      ]),
      el("div", {}, [openFirst]),
    ]),
  ]);
}

function renderResourcePage(view: ResourceViewState): HTMLElement {
  const schema = view.schema;
  const createButton = el("button", { class: "button primary", type: "button" }, ["Create"]);
  createButton.disabled = !hasCapability(ACCESS_DB_ADMIN) || editableFields(schema, true).length === 0;
  createButton.addEventListener("click", () => openRecordForm(schema, "create"));

  const refreshButton = el("button", { class: "button", type: "button" }, ["Refresh"]);
  refreshButton.addEventListener("click", () => {
    void reloadResourceView();
  });

  const batchAction = schema.destructive_actions?.batch_delete;
  const batchDeleteButton = el("button", {
    class: "button danger",
    type: "button",
    disabled: view.selectedIds.size > 0 && canUseSinglePk(schema) ? null : true,
  }, [actionLabel(batchAction, `Delete selected (${view.selectedIds.size})`)]);
  batchDeleteButton.addEventListener("click", () => {
    if (view.selectedIds.size > 0 && canUseSinglePk(schema)) {
      void batchDeleteRecords(view);
    }
  });

  const quickSearch = el("input", {
    class: "input search",
    placeholder: "Quick search",
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

  const headerBits: Node[] = [
    el("span", { class: "badge" }, [`key: ${schema.key}`]),
    el("span", { class: "badge" }, [`pk: ${schema.primary_key_fields.join(", ")}`]),
    el("span", { class: "badge" }, [`${schema.fields.length} fields`]),
  ];
  if (!canUseSinglePk(schema)) {
    headerBits.push(el("span", { class: "badge" }, ["detail/edit/delete require backend record URLs"]));
  }
  if (schema.record_payload_contract) {
    headerBits.push(el("span", { class: "badge" }, [payloadContractLabel(schema.record_payload_contract)]));
  }
  if (schema.migration_safety_contract) {
    headerBits.push(el("span", { class: "badge" }, [migrationSafetyLabel(schema.migration_safety_contract)]));
  }

  const notices: Node[] = [];
  const resourceHelp = resourceHelpText(schema);
  if (resourceHelp) {
    notices.push(el("div", { class: "notice" }, [resourceHelp]));
  }
  if (hasActiveFilters(view)) {
    const clearFilters = el("button", { class: "button", type: "button" }, ["Clear filters"]);
    clearFilters.addEventListener("click", () => {
      view.filterModel = defaultFilterModel();
      view.quickSearch = "";
      view.page = 1;
      void reloadResourceView();
    });
    notices.push(el("div", { class: "notice" }, [
      "This list is filtered through backend-declared grid filter metadata.",
      clearFilters,
    ]));
  }
  if (schema.migration_safety_contract) {
    notices.push(el("div", { class: "notice" }, [migrationSafetyNotice(schema.migration_safety_contract)]));
  }
  if (schemaHasDependentRelations(schema)) {
    notices.push(el("div", { class: "notice" }, [
      "This schema declares dependent relation selectors. The form loads child options with backend-declared grid filters as parent values change.",
    ]));
  }
  if (state.message) {
    notices.push(el("div", { class: "success" }, [state.message]));
  }
  if (view.error) {
    notices.push(el("div", { class: "error" }, [view.error]));
  }

  return el("section", { class: "stack" }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [resourceName(schema, true)]),
        el("p", { class: "page-subtitle" }, [
          resourceDescription(schema) || "Runtime schema-driven DB Admin resource. The frontend does not compile table, model, or field definitions.",
        ]),
        el("div", { class: "meta-line" }, headerBits),
      ]),
      el("div", { class: "toolbar" }, [createButton, batchDeleteButton, refreshButton]),
    ]),
    ...notices,
    el("div", { class: "toolbar" }, [
      quickSearch,
      el("span", { class: "toolbar__spacer" }),
      el("label", { class: "meta-line" }, ["Rows", pageSize]),
    ]),
    renderFilterBuilder(view),
    view.loading ? renderLoadingPage("Loading records...") : renderRecordsTable(view),
    renderPagination(view),
  ]);
}


function migrationSafetyLabel(contract: MigrationSafetyContract): string {
  const schema = contract.schema_evolution || "schema";
  const query = contract.query_construction || "queries";
  return `migration/query safety: ${schema}, ${query}`;
}

function migrationSafetyNotice(contract: MigrationSafetyContract): string {
  const dbPolicy = contract.database_policy_mirroring?.status || "unspecified";
  const permissionChanges = contract.permission_changes || "unspecified";
  return `Permission changes: ${permissionChanges}. DB role/RLS mirroring: ${dbPolicy}.`;
}

function payloadContractLabel(contract: RecordPayloadContract): string {
  if (contract.nested_relations === false && contract.relation_values === "public_ids") {
    return "payload: relation IDs, no nested rows";
  }
  if (contract.nested_relations === false) {
    return "payload: no nested rows";
  }
  return "payload contract declared";
}

function renderFilterBuilder(view: ResourceViewState): HTMLElement {
  const fields = filterableFields(view.schema);
  if (fields.length === 0) {
    return el("div", { class: "filter-builder empty" }, ["No backend-declared filterable fields for this resource."]);
  }

  const existing = el("div", { class: "filter-list" });
  const itemFilters = view.filterModel.items;
  if (itemFilters.length === 0) {
    existing.append(el("span", { class: "cell-muted" }, ["No column filters."]));
  } else {
    itemFilters.forEach((item, index) => {
      const field = fields.find((candidate) => candidate.key === item.field);
      const operator = field ? operatorsForField(view.schema, field).find((candidate) => candidate.key === item.operator) : undefined;
      const remove = el("button", { class: "button flat", type: "button", title: "Remove filter" }, ["×"]);
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
    return el("div", { class: "filter-builder empty" }, ["No backend-declared filterable fields for this resource."]);
  }
  const fieldSelect = el("select", { class: "select" });
  for (const field of fields) {
    fieldSelect.append(el("option", { value: field.key }, [fieldName(field)]));
  }
  const operatorSelect = el("select", { class: "select" });
  const valueControlSlot = el("span", { class: "filter-value-control" });
  let valueControl: FilterControlReader = emptyFilterControl();
  const linkSelect = el("select", { class: "select small", "aria-label": "Filter link operator" }, [
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

  const add = el("button", { class: "button", type: "button" }, ["Add filter"]);
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
      el("strong", {}, ["Column filters"]),
      el("span", { class: "cell-muted" }, ["Backend-declared fields, operators, and value controls only"]),
    ]),
    existing,
    el("div", { class: "filter-builder__controls" }, [fieldSelect, operatorSelect, valueControlSlot, linkSelect, add]),
  ]);
}

function emptyFilterControl(): FilterControlReader {
  return {
    element: el("span", { class: "cell-muted" }, ["No value"]),
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
      select.append(el("option", { value: "" }, ["Select value..."]));
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
    placeholder: multiple ? "Comma-separated values" : "Value",
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
      { value: "true", label: "True" },
      { value: "false", label: "False" },
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
    return el("div", { class: "card" }, [el("div", { class: "empty" }, ["No records returned."])]);
  }

  const table = el("table");
  const headRow = el("tr");
  const selectableRows = view.records
    .map((record) => recordPk(schema, record))
    .filter((id): id is string => id !== null);
  const canBatchSelect = canUseSinglePk(schema) && selectableRows.length > 0;
  if (canBatchSelect) {
    const allSelected = selectableRows.every((id) => view.selectedIds.has(id));
    const selectAll = el("input", { type: "checkbox", checked: allSelected && selectableRows.length > 0 });
    selectAll.addEventListener("change", () => {
      if (selectAll.checked) {
        selectableRows.forEach((id) => view.selectedIds.add(id));
      } else {
        selectableRows.forEach((id) => view.selectedIds.delete(id));
      }
      render();
    });
    headRow.append(el("th", {}, [selectAll]));
  }
  for (const field of columns) {
    const th = el("th");
    const label = el("button", { class: "button flat", type: "button" }, [fieldName(field), field.pii ? " ⚠" : ""]);
    label.disabled = !field.sortable;
    label.title = field.sortable ? "Sort by this field" : "Sorting not declared for this field";
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
  headRow.append(el("th", {}, ["Actions"]));
  table.append(el("thead", {}, [headRow]));

  const body = el("tbody");
  for (const record of view.records) {
    const row = el("tr");
    const rowId = recordPk(schema, record);
    if (canBatchSelect) {
      const checkbox = el("input", { type: "checkbox", checked: rowId !== null && view.selectedIds.has(rowId), disabled: rowId === null });
      checkbox.addEventListener("change", () => {
        if (!rowId) {
          return;
        }
        if (checkbox.checked) {
          view.selectedIds.add(rowId);
        } else {
          view.selectedIds.delete(rowId);
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
  const recordId = recordPk(schema, record);
  const urls = recordResourceUrls(record);
  const label = recordLabel(schema, record, recordId);
  const canView = Boolean(urls.detail || recordId);
  const canEdit = Boolean((urls.update || recordId) && editableFields(schema, false).length > 0);
  const canDelete = Boolean(urls.delete || recordId);

  const viewButton = el("button", { class: "button", type: "button", disabled: canView ? null : true }, ["View"]);
  viewButton.addEventListener("click", () => {
    if (canView) {
      openRecordForm(schema, "view", recordId ?? undefined, urls, label);
    }
  });

  const editButton = el("button", { class: "button", type: "button", disabled: canEdit ? null : true }, ["Edit"]);
  editButton.addEventListener("click", () => {
    if (canEdit) {
      openRecordForm(schema, "edit", recordId ?? undefined, urls, label);
    }
  });

  const deleteButton = el("button", { class: "button danger", type: "button", disabled: canDelete ? null : true }, ["Delete"]);
  deleteButton.addEventListener("click", () => {
    if (canDelete) {
      void deleteRecord(schema, recordId ?? undefined, urls, label);
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
      && state.resources.some((resource) => resource.key === relatedList.target_resource_key);
    const button = el("button", {
      class: "button",
      type: "button",
      disabled: canOpen ? null : true,
      title: canOpen ? `Open ${relatedListName(relatedList)} filtered by this row` : "Related resource is not available.",
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
      void selectResource(relatedList.target_resource_key, params);
    });
    return button;
  });
}

function isScalarRecordValue(value: RecordValue): value is JsonPrimitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function recordResourceUrls(record: ResourceRecord): RecordResourceUrls {
  const raw = record.__resource_urls;
  if (!raw || Array.isArray(raw) || typeof raw !== "object") {
    return {};
  }
  const urls: RecordResourceUrls = {};
  if (typeof raw.detail === "string") urls.detail = raw.detail;
  if (typeof raw.update === "string") urls.update = raw.update;
  if (typeof raw.delete === "string") urls.delete = raw.delete;
  return urls;
}

function recordDetailPath(schema: ResourceSchema, recordId?: string, urls: RecordResourceUrls = {}): string {
  return urls.detail ?? withSurface(recordPath(schema.key, requireRecordId(recordId)));
}

function recordUpdatePath(schema: ResourceSchema, recordId?: string, urls: RecordResourceUrls = {}): string {
  return urls.update ?? withSurface(recordPath(schema.key, requireRecordId(recordId)));
}

function recordDeletePath(schema: ResourceSchema, recordId?: string, urls: RecordResourceUrls = {}): string {
  return urls.delete ?? withSurface(recordPath(schema.key, requireRecordId(recordId)));
}

function renderCell(field: ResourceField, value: RecordValue, optionMap?: Map<string, string>): Node {
  const control = controlForField(field);
  if (value === null || value === undefined || value === "") {
    return el("span", { class: "cell-muted" }, ["—"]);
  }

  if (field.type === "boolean") {
    return document.createTextNode(value === true ? "Yes" : "No");
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
  const previous = el("button", { class: "button", type: "button", disabled: view.page <= 1 }, ["Previous"]);
  previous.addEventListener("click", () => {
    view.page = Math.max(1, view.page - 1);
    void reloadResourceView();
  });
  const next = el("button", { class: "button", type: "button", disabled: view.page >= totalPages }, ["Next"]);
  next.addEventListener("click", () => {
    view.page += 1;
    void reloadResourceView();
  });
  return el("div", { class: "pagination" }, [
    el("span", {}, [`${view.count} records`]),
    previous,
    el("span", {}, [`Page ${view.page} / ${totalPages}`]),
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

async function loadResources(): Promise<void> {
  state.loading = true;
  state.error = null;
  state.message = null;
  render();
  try {
    const response = await apiFetch<ResourcesResponse>(withSurface("/api/resources/"));
    state.resources = [...response.resources].sort((left, right) =>
      resourceName(left, true).localeCompare(resourceName(right, true)),
    );
    if (state.selectedResourceKey && !state.resources.some((resource) => resource.key === state.selectedResourceKey)) {
      state.selectedResourceKey = null;
      state.resourceView = null;
    }
  } catch (error) {
    state.error = error instanceof Error ? error.message : "Failed to load resources.";
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
  state.selectedResourceKey = resourceKey;
  state.resourceView = null;
  state.message = null;
  render();
  await loadResourceView(resourceKey, params);
}

async function loadResourceView(resourceKey: string, params: URLSearchParams = new URLSearchParams()): Promise<void> {
  try {
    const schema = await apiFetch<ResourceSchema>(withSurface(resourcePath(resourceKey)));
    const sort = parseSortState(params.get("sort"));
    const filterModel = parseFilterModel(params.get("filters"));
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
      selectedIds: new Set<string>(),
      loading: true,
      error: null,
    };
    state.resourceView = view;
    syncResourceViewHash(view);
    render();
    await loadRecords(view);
  } catch (error) {
    state.resourceView = null;
    state.error = error instanceof Error ? error.message : "Failed to load resource.";
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
    const visibleIds = new Set(view.records.map((record) => recordPk(view.schema, record)).filter((id): id is string => id !== null));
    view.selectedIds = new Set([...view.selectedIds].filter((id) => visibleIds.has(id)));
  } catch (error) {
    view.error = error instanceof Error ? error.message : "Failed to load records.";
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
  recordId?: string,
  urls: RecordResourceUrls = {},
  previewLabel = "",
): void {
  const modal = el("div", { class: "modal-backdrop" });
  const recordSuffix = previewLabel ? `: ${previewLabel}` : "";
  const schemaName = resourceName(schema);
  const title = mode === "create" ? `Create ${schemaName}` : mode === "edit" ? `Edit ${schemaName}${recordSuffix}` : `${schemaName} details${recordSuffix}`;
  const body = el("div", { class: "modal__body" }, [renderLoadingPage("Loading form...")]);
  const close = el("button", { class: "button", type: "button" }, ["Close"]);
  close.addEventListener("click", () => modal.remove());
  const modalPanel = el("section", { class: "modal" }, [
    el("header", { class: "modal__header" }, [el("h3", { class: "modal__title" }, [title]), close]),
    body,
  ]);
  modal.append(modalPanel);
  document.body.append(modal);
  void populateRecordForm(modal, body, schema, mode, recordId, urls);
}

async function populateRecordForm(
  modal: HTMLElement,
  body: HTMLElement,
  schema: ResourceSchema,
  mode: "create" | "view" | "edit",
  recordId?: string,
  urls: RecordResourceUrls = {},
): Promise<void> {
  try {
    const record = mode === "create" ? {} : await apiFetch<ResourceRecord>(recordDetailPath(schema, recordId, urls));
    const fields = mode === "view" ? detailFields(schema) : editableFields(schema, mode === "create");
    const optionMaps = await loadFormOptions(schema, record, fields);
    clear(body);
    body.append(renderRecordForm(modal, schema, mode, record, optionMaps, recordId, urls));
  } catch (error) {
    clear(body);
    body.append(el("div", { class: "error" }, [error instanceof Error ? error.message : "Failed to load form."]));
  }
}

function requireRecordId(recordId: string | undefined): string {
  if (!recordId) {
    throw new Error("Missing record id.");
  }
  return recordId;
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
    pattern: validation.pattern,
  };
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
  recordId?: string,
  urls: RecordResourceUrls = {},
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
  const cancel = el("button", { class: "button", type: "button" }, [readonly ? "Close" : "Cancel"]);
  cancel.addEventListener("click", () => modal.remove());
  footer.append(cancel);

  if (!readonly) {
    const submit = el("button", { class: "button primary", type: "submit" }, [mode === "create" ? "Create" : "Save"]);
    footer.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitRecordForm(form, submit, errorBox, modal, schema, mode, fields, recordId, urls);
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
    labelChildren.push(el("span", { class: "pii" }, ["PII"]));
  }

  const input = inputForField(field, value, options, readonly);
  return el("div", { class: fieldContainerClass(field) }, [
    el("label", { for: field.key }, labelChildren),
    input,
    fieldHelpText(field) ? el("small", {}, [fieldHelpText(field) ?? ""]) : null,
    field.visible_capability ? el("small", {}, [`Visible only with capability: ${field.visible_capability}`]) : null,
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
    return el("div", { class: "checkbox-row" }, [input, el("span", {}, [value === true ? "Yes" : "No"])]);
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
    placeholder: fieldUiText(field, "placeholder") ?? "Search options...",
    "data-typeahead-for": field.key,
    "aria-label": `Search ${fieldName(field)} options`,
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
    replaceSelectOptions(select, field, [], select.multiple ? [] : "", "Select dependencies first");
    select.disabled = true;
    return;
  }
  select.disabled = true;
  const options = await fetchRelationOptions(schema, field, values, true, search);
  replaceSelectOptions(select, field, options, currentValue, options.length ? "—" : "No options match");
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
      replaceSelectOptions(select, field, [], select.multiple ? [] : "", "Select dependencies first");
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
  recordId?: string,
  urls: RecordResourceUrls = {},
): Promise<void> {
  submit.disabled = true;
  submit.textContent = mode === "create" ? "Creating..." : "Saving...";
  errorBox.hidden = true;
  errorBox.textContent = "";

  try {
    const payload = formPayload(form, fields, mode);
    if (mode === "create") {
      await apiFetch<ResourceRecord>(resourceCreatePath(schema), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.message = `${resourceName(schema)} created.`;
    } else {
      await apiFetch<ResourceRecord>(recordUpdatePath(schema, recordId, urls), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      state.message = `${resourceName(schema)} updated.`;
    }
    modal.remove();
    await reloadResourceView();
  } catch (error) {
    errorBox.hidden = false;
    errorBox.textContent = error instanceof Error ? error.message : "Save failed.";
  } finally {
    submit.disabled = false;
    submit.textContent = mode === "create" ? "Create" : "Save";
    render();
  }
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
  const ids = [...view.selectedIds];
  if (ids.length === 0) {
    return;
  }
  const action = view.schema.destructive_actions?.batch_delete;
  const confirmed = action?.confirm === false || window.confirm(action?.message ?? `Delete ${ids.length} selected records?`);
  if (!confirmed) {
    return;
  }
  try {
    await apiFetch<void>(resourceBatchDeletePath(view.schema), {
      method: "DELETE",
      body: JSON.stringify({ ids: ids.map(coerceScalar) }),
    });
    view.selectedIds.clear();
    state.message = `${ids.length} ${resourceName(view.schema, true)} deleted.`;
    await reloadResourceView();
  } catch (error) {
    state.message = null;
    view.error = error instanceof Error ? error.message : "Batch delete failed.";
  } finally {
    render();
  }
}

async function deleteRecord(schema: ResourceSchema, recordId?: string, urls: RecordResourceUrls = {}, label = ""): Promise<void> {
  const action = schema.destructive_actions?.delete;
  const schemaName = resourceName(schema);
  const fallbackMessage = label ? `Delete this ${schemaName}: ${label}?` : `Delete this ${schemaName}?`;
  const confirmed = action?.confirm === false || window.confirm(actionMessage(action, fallbackMessage));
  if (!confirmed) {
    return;
  }
  try {
    await apiFetch<void>(recordDeletePath(schema, recordId, urls), { method: "DELETE" });
    state.message = label ? `${schemaName} ${label} deleted.` : `${schemaName} deleted.`;
    await reloadResourceView();
  } catch (error) {
    state.message = null;
    if (state.resourceView) {
      state.resourceView.error = error instanceof Error ? error.message : "Delete failed.";
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
  const pk = new Set(schema.primary_key_fields);
  return schema.fields.filter((field) => !field.write_only && (field.visible_in_list || pk.has(field.key)));
}

function detailFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => !field.write_only);
}

function editableFields(schema: ResourceSchema, creating: boolean): ResourceField[] {
  return schema.fields.filter((field) => field.editable && (creating || !field.readonly_on_update));
}

function identityFields(schema: ResourceSchema): string[] {
  return schema.record_identity?.fields ?? schema.primary_key_fields;
}

function canUseSinglePk(schema: ResourceSchema): boolean {
  return (schema.record_identity?.kind ?? "single_pk") === "single_pk" && identityFields(schema).length === 1;
}

function recordPk(schema: ResourceSchema, record: ResourceRecord): string | null {
  if (!canUseSinglePk(schema)) {
    return null;
  }
  const [pkField] = identityFields(schema);
  if (!pkField) {
    return null;
  }
  const value = record[pkField];
  if (value === null || value === undefined || Array.isArray(value) || typeof value === "object") {
    return null;
  }
  return String(value);
}

function schemaHasDependentRelations(schema: ResourceSchema): boolean {
  return schema.fields.some((field) => (field.relation?.depends_on.length ?? 0) > 0);
}


function recordLabel(schema: ResourceSchema, record: ResourceRecord, fallbackId: string | null = null): string {
  const backendLabel = record.__label;
  if (typeof backendLabel === "string" && backendLabel.trim()) {
    return backendLabel;
  }
  const displayField = schema.display_label_field;
  if (displayField) {
    const value = record[displayField];
    if (isScalarRecordValue(value) && value !== null && String(value).trim()) {
      return String(value);
    }
  }
  return fallbackId ?? resourceName(schema);
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
  if (session.capabilities.includes(ACCESS_DB_ADMIN)) {
    await loadResources();
    const parsed = parseResourceHash();
    if (parsed.resourceKey && state.resources.some((resource) => resource.key === parsed.resourceKey)) {
      await selectResource(parsed.resourceKey, parsed.params, false);
    }
  }
  render();
}

void boot();

