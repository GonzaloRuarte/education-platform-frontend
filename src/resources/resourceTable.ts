import type {
  AdminControl,
  GridFilterModel,
  JsonValue,
  RecordValue,
  RelatedListDefinition,
  ResourceField,
  ResourceRecord,
  ResourceSchema,
  ResourceViewState,
} from "../core/types.js";
import { el } from "../core/dom.js";
import { formatDateTime, isScalarRecordValue, optionLabel, safeJson, stripTags } from "../core/fieldFormatting.js";
import { canResourceAction, editableFields, listFields, recordIdentity } from "./resourceModel.js";

export type ResourceTableRuntime = {
  controlForField: (field: ResourceField) => AdminControl;
  deleteRecord: (schema: ResourceSchema, identity: string, label: string) => void | Promise<void>;
  fieldName: (field: ResourceField) => string;
  openRecordForm: (schema: ResourceSchema, mode: "create" | "edit" | "view", identity?: string, label?: string) => void;
  recordLabel: (schema: ResourceSchema, record: ResourceRecord) => string;
  relatedListName: (relatedList: RelatedListDefinition) => string;
  reloadResourceView: () => void | Promise<void>;
  render: () => void;
  resourceExists: (resourceKey: string) => boolean;
  selectResource: (resourceKey: string, params?: URLSearchParams) => void | Promise<void>;
  t: (key: string) => string;
};

export function renderRecordsTable(view: ResourceViewState, runtime: ResourceTableRuntime): HTMLElement {
  const schema = view.schema;
  const columns = listFields(schema);
  if (view.records.length === 0) {
    return el("div", { class: "card" }, [el("div", { class: "empty" }, [runtime.t("no_records_returned")])]);
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
      runtime.render();
    });
    headRow.append(el("th", {}, [selectAll]));
  }
  for (const field of columns) {
    const th = el("th");
    const label = el("button", { class: "button flat", type: "button" }, [runtime.fieldName(field), field.pii ? " ⚠" : ""]);
    label.disabled = !field.sortable;
    label.title = field.sortable ? runtime.t("sort_by_field") : runtime.t("sorting_not_declared");
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
      void runtime.reloadResourceView();
    });
    th.append(label);
    if (view.sortField === field.key) {
      th.append(` ${view.sortDirection === "asc" ? "↑" : "↓"}`);
    }
    headRow.append(th);
  }
  headRow.append(el("th", {}, [runtime.t("actions")]));
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
        runtime.render();
      });
      row.append(el("td", {}, [checkbox]));
    }
    for (const field of columns) {
      row.append(el("td", {}, [renderCell(field, record[field.key], runtime, view.optionMaps[field.key])]));
    }
    row.append(el("td", {}, [renderRowActions(schema, record, runtime)]));
    body.append(row);
  }
  table.append(body);
  return el("div", { class: "table-wrap" }, [table]);
}

export function renderPagination(view: ResourceViewState, runtime: Pick<ResourceTableRuntime, "reloadResourceView" | "t">): HTMLElement {
  const totalPages = Math.max(1, Math.ceil(view.count / Math.max(1, view.pageSize)));
  const previous = el("button", { class: "button", type: "button", disabled: view.page <= 1 }, [runtime.t("previous")]);
  previous.addEventListener("click", () => {
    view.page = Math.max(1, view.page - 1);
    void runtime.reloadResourceView();
  });
  const next = el("button", { class: "button", type: "button", disabled: view.page >= totalPages }, [runtime.t("next")]);
  next.addEventListener("click", () => {
    view.page += 1;
    void runtime.reloadResourceView();
  });
  return el("div", { class: "pagination" }, [
    el("span", {}, [`${view.count} ${runtime.t("records")}`]),
    previous,
    el("span", {}, [`${runtime.t("page")} ${view.page} / ${totalPages}`]),
    next,
  ]);
}

function renderRowActions(schema: ResourceSchema, record: ResourceRecord, runtime: ResourceTableRuntime): HTMLElement {
  const actions = el("div", { class: "row-actions" });
  const identity = recordIdentity(record);
  const label = runtime.recordLabel(schema, record);
  const canView = canResourceAction(schema, "retrieve") && Boolean(identity);
  const canEdit = canResourceAction(schema, "update") && Boolean(identity && editableFields(schema, false).length > 0);
  const canDelete = canResourceAction(schema, "delete") && Boolean(identity);

  const viewButton = el("button", { class: "button", type: "button", disabled: canView ? null : true }, [runtime.t("view")]);
  viewButton.addEventListener("click", () => {
    if (canView) {
      runtime.openRecordForm(schema, "view", identity ?? "", label);
    }
  });

  const editButton = el("button", { class: "button", type: "button", disabled: canEdit ? null : true }, [runtime.t("edit")]);
  editButton.addEventListener("click", () => {
    if (canEdit) {
      runtime.openRecordForm(schema, "edit", identity ?? "", label);
    }
  });

  const deleteButton = el("button", { class: "button danger", type: "button", disabled: canDelete ? null : true }, [runtime.t("delete")]);
  deleteButton.addEventListener("click", () => {
    if (canDelete) {
      void runtime.deleteRecord(schema, identity ?? "", label);
    }
  });

  actions.append(viewButton, editButton, deleteButton);
  for (const button of relatedListButtons(schema, record, runtime)) {
    actions.append(button);
  }
  return actions;
}

function relatedListButtons(schema: ResourceSchema, record: ResourceRecord, runtime: ResourceTableRuntime): HTMLButtonElement[] {
  return (schema.related_lists ?? []).map((relatedList) => {
    const value = record[relatedList.source_field];
    const canOpen = value !== null && value !== undefined && isScalarRecordValue(value)
      && runtime.resourceExists(relatedList.target_resource_alias);
    const button = el("button", {
      class: "button",
      type: "button",
      disabled: canOpen ? null : true,
      title: canOpen ? `${runtime.t("open_related")} ${runtime.relatedListName(relatedList)}` : runtime.t("related_unavailable"),
    }, [runtime.relatedListName(relatedList)]);
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
      void runtime.selectResource(relatedList.target_resource_alias, params);
    });
    return button;
  });
}

function renderCell(field: ResourceField, value: RecordValue, runtime: ResourceTableRuntime, optionMap?: Map<string, string>): Node {
  const control = runtime.controlForField(field);
  if (value === null || value === undefined || value === "") {
    return el("span", { class: "cell-muted" }, ["—"]);
  }

  if (field.type === "boolean") {
    return document.createTextNode(value === true ? runtime.t("yes") : runtime.t("no"));
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
