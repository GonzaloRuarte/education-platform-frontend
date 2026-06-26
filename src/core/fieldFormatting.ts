import type { AdminControl, JsonPrimitive, RecordValue, ResourceField } from "./types.js";

export function isScalarRecordValue(value: RecordValue): value is JsonPrimitive {
  return ["string", "number", "boolean"].includes(typeof value);
}

export function optionLabel(optionMap: Map<string, string> | undefined, value: RecordValue): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, RecordValue>;
    for (const key of ["label", "name", "title", "display", "value", "__identity", "id"]) {
      const candidate = record[key];
      if (isScalarRecordValue(candidate) && candidate !== null && String(candidate).trim()) {
        const candidateKey = String(candidate);
        return optionMap?.get(candidateKey) ?? candidateKey;
      }
    }
    return safeJson(value);
  }
  const key = String(value);
  return optionMap?.get(key) ?? key;
}

export function safeJson(value: RecordValue): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function stripTags(value: string): string {
  const template = document.createElement("template");
  template.innerHTML = value;
  return template.content.textContent ?? "";
}

export function inputType(field: ResourceField, control: AdminControl): string {
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

export function inputValue(field: ResourceField, value: RecordValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (field.type === "datetime" && typeof value === "string") {
    return value.slice(0, 16);
  }
  return String(value);
}

export function coerceScalar(value: string): string | number {
  if (/^-?\d+$/.test(value)) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isSafeInteger(parsed)) {
      return parsed;
    }
  }
  return value;
}
