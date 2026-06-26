import type {
  JsonValue,
  RecordValue,
  AuditViewKind,
  AuditRecord,
  AuditListResponse,
  AuditDetailResponse,
  AuditViewFilters,
  AuditViewState,
} from "../core/types.js";
import { el } from "../core/dom.js";
import { parsePositiveInt } from "../core/filters.js";
import { safeJson } from "../core/fieldFormatting.js";
import { BUSINESS_WORKFLOW_TEST_IDS } from "../core/testIds.js";

export interface AuditViewRuntime {
  state: AuditViewState;
  t: (key: string) => string;
  render: () => void;
  loadAuditViewList: () => Promise<void> | void;
  loadAuditViewDetail: (id: string) => Promise<void> | void;
}

export function renderAuditViewPage(runtime: AuditViewRuntime): HTMLElement {
  const { state, t } = runtime;
  if (!state.list && !state.loading) {
    void runtime.loadAuditViewList();
  }

  const kindSelect = el("select", { class: "select", "aria-label": t("audit_view") });
  for (const kind of ["batches", "events"] as AuditViewKind[]) {
    kindSelect.append(el("option", { value: kind, selected: state.kind === kind ? true : null }, [kind === "batches" ? t("audit_batches") : t("audit_events")]));
  }
  kindSelect.addEventListener("change", () => {
    const nextKind: AuditViewKind = kindSelect.value === "events" ? "events" : "batches";
    if (state.kind === nextKind) {
      return;
    }
    state.kind = nextKind;
    state.list = null;
    state.detail = null;
    state.selectedId = null;
    state.filters.offset = "0";
    state.error = null;
    runtime.render();
    void runtime.loadAuditViewList();
  });

  const loadButton = el("button", { class: "button", type: "button", disabled: state.loading ? true : null }, [t("refresh_resource")]);
  loadButton.addEventListener("click", () => {
    state.filters.offset = "0";
    void runtime.loadAuditViewList();
  });

  const notices: HTMLElement[] = [];
  if (state.error) {
    notices.push(el("div", { class: "error" }, [state.error]));
  }
  if (state.loading) {
    notices.push(el("div", { class: "notice" }, [t("loading_records")]));
  }

  return el("section", { class: "stack audit-view", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.auditView.page }, [
    el("div", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [t("audit_view_title")]),
        el("p", { class: "page-subtitle" }, [t("audit_view_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [kindSelect, loadButton]),
    ]),
    ...notices,
    renderAuditFilterCard(runtime),
    renderAuditListCard(runtime),
    state.detail ? renderAuditDetailCard(runtime, state.detail) : null,
  ]);
}

function renderAuditFilterCard(runtime: AuditViewRuntime): HTMLElement {
  const { state, t } = runtime;
  const statusInput = auditFilterInput(runtime, "status", t("audit_status"));
  const sourceInput = auditFilterInput(runtime, "source", t("audit_source"));
  const domainInput = auditFilterInput(runtime, "domain", t("audit_domain"));
  const eventTypeInput = auditFilterInput(runtime, "eventType", t("audit_event_type"));
  const limitInput = auditFilterInput(runtime, "limit", t("audit_limit"), "number");
  const offsetInput = auditFilterInput(runtime, "offset", t("audit_offset"), "number");
  const applyButton = el("button", { class: "button primary", type: "button", disabled: state.loading ? true : null }, [t("audit_filters")]);
  applyButton.addEventListener("click", () => {
    void runtime.loadAuditViewList();
  });

  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [t("audit_filters")]),
      el("div", { class: "form-grid" }, [
        auditFilterField(t("audit_status"), statusInput),
        auditFilterField(t("audit_source"), sourceInput),
        auditFilterField(t("audit_domain"), domainInput),
        state.kind === "events" ? auditFilterField(t("audit_event_type"), eventTypeInput) : null,
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

function auditFilterInput(runtime: AuditViewRuntime, key: keyof AuditViewFilters, label: string, type = "text"): HTMLInputElement {
  const input = el("input", {
    class: "input",
    type,
    placeholder: label,
    value: runtime.state.filters[key],
  });
  input.addEventListener("input", () => {
    runtime.state.filters[key] = input.value;
  });
  return input;
}

function renderAuditListCard(runtime: AuditViewRuntime): HTMLElement {
  const { state, t } = runtime;
  const list = state.list;
  const rows = list?.results ?? [];
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [state.kind === "batches" ? t("audit_batches") : t("audit_events")]),
        list ? el("span", { class: "badge" }, [`${t("audit_count")}: ${list.count ?? rows.length}`]) : null,
        list?.domain ? el("span", { class: "badge" }, [`${t("audit_domain")}: ${list.domain}`]) : null,
      ]),
      list?.scope ? el("div", { class: "notice" }, [`${t("audit_scope")}: ${safeJson(list.scope)}`]) : null,
      el("p", { class: "cell-muted" }, [t("audit_redacted_notice")]),
      rows.length ? renderAuditTable(runtime, rows) : el("div", { class: "empty" }, [t("audit_no_records")]),
      renderAuditPagination(runtime, list),
    ]),
  ]);
}

function renderAuditTable(runtime: AuditViewRuntime, rows: AuditRecord[]): HTMLElement {
  const { state, t } = runtime;
  const header = state.kind === "batches"
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
        void runtime.loadAuditViewDetail(id);
      }
    });
    const cells = state.kind === "batches"
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

function renderAuditPagination(runtime: AuditViewRuntime, list: AuditListResponse | null): HTMLElement {
  const { state, t } = runtime;
  if (!list) {
    return el("div");
  }
  const limit = list.limit ?? parsePositiveInt(state.filters.limit, 50);
  const offset = list.offset ?? parsePositiveInt(state.filters.offset, 0);
  const count = list.count ?? 0;
  const previousButton = el("button", { class: "button", type: "button", disabled: offset <= 0 || state.loading ? true : null }, [t("previous")]);
  previousButton.addEventListener("click", () => {
    state.filters.offset = String(Math.max(0, offset - limit));
    void runtime.loadAuditViewList();
  });
  const nextButton = el("button", { class: "button", type: "button", disabled: offset + limit >= count || state.loading ? true : null }, [t("next")]);
  nextButton.addEventListener("click", () => {
    state.filters.offset = String(offset + limit);
    void runtime.loadAuditViewList();
  });
  return el("div", { class: "pagination" }, [
    el("span", {}, [`${offset + 1}-${Math.min(offset + limit, count)} / ${count}`]),
    previousButton,
    nextButton,
  ]);
}

function renderAuditDetailCard(runtime: AuditViewRuntime, detail: AuditDetailResponse): HTMLElement {
  const { t } = runtime;
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
