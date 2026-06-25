import type { ResourceSchema } from "./types";
import { SURFACE } from "./constants";
import { withQueryParams } from "./api";

export function resourceSchemaPath(resourceKey: string): string {
  return `/api/resources/${encodeURIComponent(resourceKey)}/?surface=${SURFACE}`;
}

export function resourceListPath(schema: ResourceSchema, params: Record<string, string> = {}): string {
  return withQueryParams(`/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/?surface=${SURFACE}`, params);
}

export function resourceCreatePath(schema: ResourceSchema): string {
  return `/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/?surface=${SURFACE}`;
}

export function resourceBatchDeletePath(schema: ResourceSchema): string {
  return `/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/?surface=${SURFACE}`;
}

export function resourceOptionsPath(schema: ResourceSchema, fieldKey: string, params: Record<string, string> = {}): string {
  return withQueryParams(`/api/resources/${encodeURIComponent(schema.alias || schema.key)}/options/${encodeURIComponent(fieldKey)}/?surface=${SURFACE}`, params);
}

export function recordDetailPath(schema: ResourceSchema, identity: string): string {
  return `/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}`;
}

export function recordUpdatePath(schema: ResourceSchema, identity: string): string {
  return `/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}`;
}

export function recordDeletePath(schema: ResourceSchema, identity: string): string {
  return `/api/resources/${encodeURIComponent(schema.alias || schema.key)}/records/${encodeURIComponent(identity)}/?surface=${SURFACE}`;
}
