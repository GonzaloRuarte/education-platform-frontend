import type {
  FilterOperatorDefinition,
  GridFilterItem,
  GridFilterModel,
  ResourceField,
  ResourceSchema,
  ResourceViewState,
} from "./types.js";

export function defaultFilterModel(): GridFilterModel {
  return { items: [], quickFilterValues: [], linkOperator: "and" };
}

export function parseFilterModel(raw: string | null): GridFilterModel {
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

export function filterModelWithQuickSearch(filterModel: GridFilterModel, value: string): GridFilterModel {
  return {
    ...filterModel,
    quickFilterValues: value ? [value] : [],
  };
}

export function hasActiveFilters(view: ResourceViewState): boolean {
  return view.filterModel.items.length > 0 || view.filterModel.quickFilterValues.length > 0;
}

export function filterModelForRequest(view: ResourceViewState): GridFilterModel {
  return filterModelWithQuickSearch(view.filterModel, view.quickSearch);
}

export function hasFilterPayload(filterModel: GridFilterModel): boolean {
  return filterModel.items.length > 0 || filterModel.quickFilterValues.length > 0;
}

export function filterableFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => field.filterable && !field.write_only);
}

export function operatorsForField(schema: ResourceSchema, field: ResourceField): FilterOperatorDefinition[] {
  return field.filter?.operators ?? [];
}

export function operatorNeedsValue(operator: FilterOperatorDefinition | undefined): boolean {
  return (operator?.value_kind ?? "single") !== "none";
}

export function sanitizeFilterModel(schema: ResourceSchema, filterModel: GridFilterModel): GridFilterModel {
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

export function sanitizeSortState(schema: ResourceSchema, sort: { sortField: string; sortDirection: "asc" | "desc" }): { sortField: string; sortDirection: "asc" | "desc" } {
  if (!sort.sortField) return sort;
  return schema.fields.some((field) => field.key === sort.sortField && field.sortable)
    ? sort
    : { sortField: "", sortDirection: "asc" };
}

export function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseSortState(raw: string | null): { sortField: string; sortDirection: "asc" | "desc" } {
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

export function resourceViewParams(view: ResourceViewState): URLSearchParams {
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
