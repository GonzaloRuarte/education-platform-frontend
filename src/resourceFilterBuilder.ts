import type {
  FilterControlReader,
  FilterOperatorDefinition,
  GridFilterItem,
  JsonPrimitive,
  JsonValue,
  RelationOption,
  ResourceField,
  ResourceViewState,
} from "./types";
import { clear, el } from "./dom";
import { filterableFields, operatorNeedsValue, operatorsForField } from "./filters";

export interface ResourceFilterBuilderRuntime {
  t: (key: string) => string;
  localizedText: (fallback: string, text?: { en?: string; es?: string }) => string;
  fieldName: (field: ResourceField) => string;
  operatorLabel: (operator: FilterOperatorDefinition) => string;
  reloadResourceView: () => Promise<void>;
}

export function renderFilterBuilder(view: ResourceViewState, runtime: ResourceFilterBuilderRuntime): HTMLElement {
  const { t, fieldName, operatorLabel, reloadResourceView } = runtime;
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
  let valueControl: FilterControlReader = emptyFilterControl(t);
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
    valueControl = renderFilterValueControl(view, selectedField(), selectedOperator(), runtime);
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

function emptyFilterControl(t: (key: string) => string): FilterControlReader {
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
  runtime: ResourceFilterBuilderRuntime,
): FilterControlReader {
  const { t } = runtime;
  if (!operator || !operatorNeedsValue(operator) || operator.value_control?.kind === "none") {
    return emptyFilterControl(t);
  }

  const multiple = operator.value_control?.multiple ?? operator.value_kind === "multiple";
  const options = filterOptionsForField(view, field, runtime);
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

function filterOptionsForField(view: ResourceViewState, field: ResourceField, runtime: ResourceFilterBuilderRuntime): RelationOption[] {
  if (field.type === "boolean") {
    return [
      { value: "true", label: runtime.t("true") },
      { value: "false", label: runtime.t("false") },
    ];
  }
  if (field.option_source?.kind === "static") {
    return field.option_source.options.map((option) => ({
      value: option.value,
      label: runtime.localizedText(option.label, option.i18n?.label),
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
