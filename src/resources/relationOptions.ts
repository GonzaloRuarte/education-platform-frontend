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

const RELATION_OPTION_CACHE_TTL_MS = 5 * 60 * 1000;

type CachedOptions = {
  expiresAt: number;
  options: RelationOption[];
};

const relationOptionCache = new Map<string, CachedOptions>();

export function clearRelationOptionCache(): void {
  relationOptionCache.clear();
}

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
  const cacheKey = relationOptionCacheKey(schema, field, params);
  const cached = relationOptionCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.options;
  }
  try {
    const response = await apiFetch<OptionsResponse>(resourceOptionsPath(schema, field.key, params));
    relationOptionCache.set(cacheKey, {
      expiresAt: Date.now() + RELATION_OPTION_CACHE_TTL_MS,
      options: response.options,
    });
    return response.options;
  } catch {
    return cached?.options ?? [];
  }
}

function relationOptionCacheKey(schema: ResourceSchema, field: ResourceField, params: Record<string, string>): string {
  return JSON.stringify({
    resource: schema.key,
    field: field.key,
    params: Object.fromEntries(Object.entries(params).sort(([left], [right]) => left.localeCompare(right))),
  });
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
