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
  depends_on: string[];
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
  option_source?: OptionSource;
  relation?: RelationDefinition;
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
  list_query_contract?: unknown;
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
};

type ResourceViewState = {
  schema: ResourceSchema;
  records: ResourceRecord[];
  count: number;
  page: number;
  pageSize: number;
  quickSearch: string;
  sortField: string;
  sortDirection: "asc" | "desc";
  optionMaps: Record<string, Map<string, string>>;
  loading: boolean;
  error: string | null;
};

type ApiErrorPayload = {
  detail?: string;
  message?: string;
  [key: string]: unknown;
};

const SURFACE = "db_admin";
const ACCESS_DB_ADMIN = "access_db_admin";
const DEFAULT_PAGE_SIZE = 25;
const STORAGE_SESSION = "retrobolt.admin.session";
const STORAGE_API_BASE = "retrobolt.admin.apiBaseUrl";
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
};

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

function withSurface(path: string, extraParams: Record<string, string> = {}): string {
  const [base, query = ""] = path.split("?");
  if (base === undefined) {
    throw new Error("Invalid API path.");
  }
  const params = new URLSearchParams(query);
  params.set("surface", SURFACE);
  for (const [key, value] of Object.entries(extraParams)) {
    if (value !== "") {
      params.set(key, value);
    }
  }
  return `${base}?${params.toString()}`;
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

  if (payload?.detail) {
    return payload.detail;
  }
  if (payload?.message) {
    return payload.message;
  }
  if (payload) {
    return flattenApiError(payload);
  }
  return `${response.status} ${response.statusText}`;
}

function flattenApiError(payload: ApiErrorPayload): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(payload)) {
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

  const visibleResources = filteredResources();
  const nav = el("nav", { class: "resource-nav", "aria-label": "Resources" });
  for (const resource of visibleResources) {
    const item = el("button", {
      class: resource.key === state.selectedResourceKey ? "active" : "",
      type: "button",
      title: resource.key,
    }, [resource.plural_label || resource.label || resource.key]);
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
    el("div", { class: "sidebar__section stack" }, [filterInput, refresh]),
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
  createButton.disabled = !canUseSinglePk(schema) || !hasCapability(ACCESS_DB_ADMIN) || editableFields(schema, true).length === 0;
  createButton.addEventListener("click", () => openRecordForm(schema, "create"));

  const refreshButton = el("button", { class: "button", type: "button" }, ["Refresh"]);
  refreshButton.addEventListener("click", () => {
    void reloadResourceView();
  });

  const quickSearch = el("input", {
    class: "input search",
    placeholder: "Quick search",
    value: view.quickSearch,
  });
  quickSearch.addEventListener("change", () => {
    view.quickSearch = quickSearch.value.trim();
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
    headerBits.push(el("span", { class: "badge" }, ["detail/edit/delete disabled: composite key metadata needed"]));
  }

  const notices: Node[] = [];
  if (schemaHasDependentRelations(schema)) {
    notices.push(el("div", { class: "notice" }, [
      "This schema declares dependent relation selectors. The current backend options endpoint does not publish a dependency-filter protocol, so this generic UI loads scoped options without cascading.",
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
        el("h2", { class: "page-title" }, [schema.plural_label || schema.label]),
        el("p", { class: "page-subtitle" }, [
          "Runtime schema-driven DB Admin resource. The frontend does not compile table, model, or field definitions.",
        ]),
        el("div", { class: "meta-line" }, headerBits),
      ]),
      el("div", { class: "toolbar" }, [createButton, refreshButton]),
    ]),
    ...notices,
    el("div", { class: "toolbar" }, [
      quickSearch,
      el("span", { class: "toolbar__spacer" }),
      el("label", { class: "meta-line" }, ["Rows", pageSize]),
    ]),
    view.loading ? renderLoadingPage("Loading records...") : renderRecordsTable(view),
    renderPagination(view),
  ]);
}

function renderRecordsTable(view: ResourceViewState): HTMLElement {
  const schema = view.schema;
  const columns = listFields(schema);
  if (view.records.length === 0) {
    return el("div", { class: "card" }, [el("div", { class: "empty" }, ["No records returned."])]);
  }

  const table = el("table");
  const headRow = el("tr");
  for (const field of columns) {
    const th = el("th");
    const label = el("button", { class: "button flat", type: "button" }, [field.label, field.pii ? " ⚠" : ""]);
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
  const disabled = !recordId;

  const viewButton = el("button", { class: "button", type: "button", disabled }, ["View"]);
  viewButton.addEventListener("click", () => {
    if (recordId) {
      openRecordForm(schema, "view", recordId);
    }
  });

  const editButton = el("button", { class: "button", type: "button", disabled: disabled || editableFields(schema, false).length === 0 }, ["Edit"]);
  editButton.addEventListener("click", () => {
    if (recordId) {
      openRecordForm(schema, "edit", recordId);
    }
  });

  const deleteButton = el("button", { class: "button danger", type: "button", disabled }, ["Delete"]);
  deleteButton.addEventListener("click", () => {
    if (recordId) {
      void deleteRecord(schema, recordId);
    }
  });

  actions.append(viewButton, editButton, deleteButton);
  return actions;
}

function renderCell(field: ResourceField, value: RecordValue, optionMap?: Map<string, string>): Node {
  if (value === null || value === undefined || value === "") {
    return el("span", { class: "cell-muted" }, ["—"]);
  }

  if (field.type === "boolean") {
    return document.createTextNode(value === true ? "Yes" : "No");
  }

  if (field.type === "foreign_key") {
    return document.createTextNode(optionLabel(optionMap, value));
  }

  if (field.type === "many_to_many") {
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
      (left.plural_label || left.label || left.key).localeCompare(right.plural_label || right.label || right.key),
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

async function selectResource(resourceKey: string): Promise<void> {
  const desiredHash = `#/resources/${encodeURIComponent(resourceKey)}`;
  if (location.hash !== desiredHash) {
    history.replaceState(null, "", desiredHash);
  }
  state.selectedResourceKey = resourceKey;
  state.resourceView = null;
  state.message = null;
  render();
  await loadResourceView(resourceKey);
}

async function loadResourceView(resourceKey: string): Promise<void> {
  try {
    const schema = await apiFetch<ResourceSchema>(withSurface(resourcePath(resourceKey)));
    const view: ResourceViewState = {
      schema,
      records: [],
      count: 0,
      page: 1,
      pageSize: schema.page_size || DEFAULT_PAGE_SIZE,
      quickSearch: "",
      sortField: "",
      sortDirection: "asc",
      optionMaps: {},
      loading: true,
      error: null,
    };
    state.resourceView = view;
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
  await loadRecords(state.resourceView);
  render();
}

async function loadRecords(view: ResourceViewState): Promise<void> {
  view.loading = true;
  view.error = null;
  render();
  try {
    await loadListOptionMaps(view);
    const params: Record<string, string> = {
      page: String(view.page),
      page_size: String(view.pageSize),
    };
    if (view.quickSearch) {
      params.filters = JSON.stringify({ items: [], quickFilterValues: [view.quickSearch] });
    }
    if (view.sortField) {
      params.sort = JSON.stringify([{ field: view.sortField, sort: view.sortDirection }]);
    }
    const response = await apiFetch<PaginatedRecords>(withSurface(recordsPath(view.schema.key), params));
    view.records = response.results;
    view.count = response.count;
  } catch (error) {
    view.error = error instanceof Error ? error.message : "Failed to load records.";
  } finally {
    view.loading = false;
  }
}

async function loadListOptionMaps(view: ResourceViewState): Promise<void> {
  const relationFields = listFields(view.schema).filter((field) => field.relation);
  await Promise.all(relationFields.map((field) => loadOptionMap(view, field)));
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
    const response = await apiFetch<OptionsResponse>(withSurface(optionsPath(view.schema.key, field.key)));
    for (const option of response.options) {
      map.set(String(option.value), option.label);
    }
  } catch {
    // Do not block record listing because label lookup failed. Raw IDs remain visible.
  }
  view.optionMaps[field.key] = map;
}

function openRecordForm(schema: ResourceSchema, mode: "create" | "view" | "edit", recordId?: string): void {
  const modal = el("div", { class: "modal-backdrop" });
  const title = mode === "create" ? `Create ${schema.label}` : mode === "edit" ? `Edit ${schema.label}` : `${schema.label} details`;
  const body = el("div", { class: "modal__body" }, [renderLoadingPage("Loading form...")]);
  const close = el("button", { class: "button", type: "button" }, ["Close"]);
  close.addEventListener("click", () => modal.remove());
  const modalPanel = el("section", { class: "modal" }, [
    el("header", { class: "modal__header" }, [el("h3", { class: "modal__title" }, [title]), close]),
    body,
  ]);
  modal.append(modalPanel);
  document.body.append(modal);
  void populateRecordForm(modal, body, schema, mode, recordId);
}

async function populateRecordForm(
  modal: HTMLElement,
  body: HTMLElement,
  schema: ResourceSchema,
  mode: "create" | "view" | "edit",
  recordId?: string,
): Promise<void> {
  try {
    const record = mode === "create" ? {} : await apiFetch<ResourceRecord>(withSurface(recordPath(schema.key, requireRecordId(recordId))));
    const optionMaps = await loadFormOptions(schema);
    clear(body);
    body.append(renderRecordForm(modal, schema, mode, record, optionMaps, recordId));
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

async function loadFormOptions(schema: ResourceSchema): Promise<Record<string, RelationOption[]>> {
  const optionFields = schema.fields.filter((field) => field.option_source || field.relation);
  const result: Record<string, RelationOption[]> = {};
  await Promise.all(optionFields.map(async (field) => {
    if (field.option_source?.kind === "static") {
      result[field.key] = field.option_source.options.map((option) => ({ value: option.value, label: option.label }));
      return;
    }
    if (field.relation) {
      try {
        const response = await apiFetch<OptionsResponse>(withSurface(optionsPath(schema.key, field.key)));
        result[field.key] = response.options;
      } catch {
        result[field.key] = [];
      }
    }
  }));
  return result;
}

function renderRecordForm(
  modal: HTMLElement,
  schema: ResourceSchema,
  mode: "create" | "view" | "edit",
  record: ResourceRecord,
  optionsByField: Record<string, RelationOption[]>,
  recordId?: string,
): HTMLElement {
  const readonly = mode === "view";
  const form = el("form", { class: "stack" });
  const fields = readonly ? detailFields(schema) : editableFields(schema, mode === "create");
  const grid = el("div", { class: "form-grid" });

  for (const field of fields) {
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
      void submitRecordForm(form, submit, errorBox, modal, schema, mode, fields, recordId);
    });
  }

  form.append(grid, errorBox, footer);
  return form;
}

function renderInputField(field: ResourceField, value: RecordValue, options: RelationOption[], readonly: boolean): HTMLElement {
  const labelChildren: Array<Node | string> = [field.label];
  if (field.required && !readonly) {
    labelChildren.push(el("span", { class: "required" }, [" *"]));
  }
  if (field.pii) {
    labelChildren.push(el("span", { class: "pii" }, ["PII"]));
  }

  const input = inputForField(field, value, options, readonly);
  return el("div", { class: "field" }, [
    el("label", { for: field.key }, labelChildren),
    input,
    field.help_text ? el("small", {}, [field.help_text]) : null,
    field.visible_capability ? el("small", {}, [`Visible only with capability: ${field.visible_capability}`]) : null,
  ]);
}

function inputForField(field: ResourceField, value: RecordValue, options: RelationOption[], readonly: boolean): HTMLElement {
  if (field.type === "boolean") {
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

  if (field.type === "enum" || field.type === "foreign_key") {
    const select = el("select", {
      id: field.key,
      name: field.key,
      class: "select",
      disabled: readonly,
      required: field.required && !readonly,
      "data-field-type": field.type,
    });
    if (field.nullable || !field.required) {
      select.append(el("option", { value: "" }, ["—"]));
    }
    for (const option of options) {
      const optionValue = String(option.value);
      select.append(el("option", { value: optionValue, selected: String(value ?? "") === optionValue }, [option.label]));
    }
    return select;
  }

  if (field.type === "many_to_many") {
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
    return select;
  }

  if (field.type === "text" || field.type === "rich_text" || field.type === "json") {
    const textValue = field.type === "json" ? safeJson(value ?? null) : String(value ?? "");
    return el("textarea", {
      id: field.key,
      name: field.key,
      class: "textarea",
      disabled: readonly,
      required: field.required && !readonly,
      "data-field-type": field.type,
    }, [textValue]);
  }

  const type = inputType(field.type);
  return el("input", {
    id: field.key,
    name: field.key,
    class: "input",
    type,
    value: inputValue(field, value),
    disabled: readonly,
    required: field.required && !readonly,
    "data-field-type": field.type,
  });
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
): Promise<void> {
  submit.disabled = true;
  submit.textContent = mode === "create" ? "Creating..." : "Saving...";
  errorBox.hidden = true;
  errorBox.textContent = "";

  try {
    const payload = formPayload(form, fields, mode);
    if (mode === "create") {
      await apiFetch<ResourceRecord>(withSurface(recordsPath(schema.key)), {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.message = `${schema.label} created.`;
    } else {
      await apiFetch<ResourceRecord>(withSurface(recordPath(schema.key, requireRecordId(recordId))), {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      state.message = `${schema.label} updated.`;
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

async function deleteRecord(schema: ResourceSchema, recordId: string): Promise<void> {
  const confirmed = window.confirm(`Delete this ${schema.label}?`);
  if (!confirmed) {
    return;
  }
  try {
    await apiFetch<void>(withSurface(recordPath(schema.key, recordId)), { method: "DELETE" });
    state.message = `${schema.label} deleted.`;
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
  if (!needle) {
    return state.resources;
  }
  return state.resources.filter((resource) =>
    [resource.key, resource.label, resource.plural_label].some((value) => value.toLowerCase().includes(needle)),
  );
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

function canUseSinglePk(schema: ResourceSchema): boolean {
  return schema.primary_key_fields.length === 1;
}

function recordPk(schema: ResourceSchema, record: ResourceRecord): string | null {
  if (!canUseSinglePk(schema)) {
    return null;
  }
  const [pkField] = schema.primary_key_fields;
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

function inputType(fieldType: FieldType): string {
  switch (fieldType) {
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
  const key = location.hash.startsWith("#/resources/") ? decodeURIComponent(location.hash.slice("#/resources/".length)) : null;
  if (key && key !== state.selectedResourceKey) {
    void selectResource(key);
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
    const hashKey = location.hash.startsWith("#/resources/") ? decodeURIComponent(location.hash.slice("#/resources/".length)) : null;
    if (hashKey && state.resources.some((resource) => resource.key === hashKey)) {
      await selectResource(hashKey);
    }
  }
  render();
}

void boot();
