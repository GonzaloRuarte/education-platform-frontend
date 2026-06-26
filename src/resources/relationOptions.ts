import { apiFetch } from "../api/api.js";
import { resourceOptionsPath } from "../api/resourceEndpoints.js";
import type {
  GridFilterItem,
  GridFilterModel,
  JsonPrimitive,
  JsonValue,
  OptionsResponse,
  RecordValue,
  RelationOption,
  ResourceField,
  ResourceSchema,
} from "../core/types.js";

export async function fetchRelationOptions(
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

export function optionQueryParams(
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

export function relationDependencyFilterModel(
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
