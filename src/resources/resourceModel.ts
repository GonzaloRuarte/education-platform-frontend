import type { ResourceAction, ResourceField, ResourceRecord, ResourceSchema } from "../core/types";

export function listFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => !field.write_only && field.visible_in_list);
}

export function detailFields(schema: ResourceSchema): ResourceField[] {
  return schema.fields.filter((field) => !field.write_only);
}

export function editableFields(schema: ResourceSchema, creating: boolean): ResourceField[] {
  return schema.fields.filter((field) => field.editable && (creating || !field.readonly_on_update));
}

export function canResourceAction(schema: ResourceSchema, action: ResourceAction): boolean {
  return schema.actions?.[action] === true;
}

export function recordIdentity(record: ResourceRecord): string | null {
  const identity = record.__identity;
  return typeof identity === "string" && identity.trim() ? identity : null;
}

export function schemaHasDependentRelations(schema: ResourceSchema): boolean {
  return schema.fields.some((field) => (field.relation?.depends_on.length ?? 0) > 0);
}
