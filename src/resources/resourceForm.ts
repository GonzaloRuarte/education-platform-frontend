import { publicErrorMessage } from "../api/api.js";
import { clear, el } from "../core/dom.js";
import { inputType, inputValue, safeJson } from "../core/fieldFormatting.js";
import { fetchRelationOptions, optionQueryParams, relationDependencyFilterModel } from "./relationOptions.js";
import { detailFields, editableFields } from "./resourceModel.js";
import type {
  AdminControl,
  JsonValue,
  LocalizedText,
  RecordValue,
  RelationOption,
  ResourceField,
  ResourceRecord,
  ResourceSchema,
} from "../core/types.js";

export type ResourceFormMode = "create" | "view" | "edit";

type FormSubmitArgs = {
  schema: ResourceSchema;
  mode: Exclude<ResourceFormMode, "view">;
  identity: string;
  payload: Record<string, JsonValue>;
};

export type ResourceFormRuntime = {
  t: (key: string) => string;
  formatText: (key: string, values: Record<string, string | number>) => string;
  localizedText: (fallback: string, text?: LocalizedText) => string;
  fieldName: (field: ResourceField) => string;
  fieldHelpText: (field: ResourceField) => string | undefined;
  fieldUiText: (field: ResourceField, key: "section" | "placeholder") => string | undefined;
  submitRecordPayload: (args: FormSubmitArgs) => Promise<ResourceRecord>;
  afterSuccessfulSubmit: (schema: ResourceSchema, mode: Exclude<ResourceFormMode, "view">, record: ResourceRecord) => Promise<void>;
  reportError: (message: string) => void;
  render: () => void;
};

export async function loadFormOptions(
  schema: ResourceSchema,
  record: ResourceRecord,
  fields: ResourceField[],
  runtime: ResourceFormRuntime,
): Promise<Record<string, RelationOption[]>> {
  const optionFields = fields.filter((field) => field.option_source || field.relation);
  const result: Record<string, RelationOption[]> = {};
  await Promise.all(optionFields.map(async (field) => {
    if (field.option_source?.kind === "static") {
      result[field.key] = field.option_source.options.map((option) => ({
        value: option.value,
        label: runtime.localizedText(option.label, option.i18n?.label),
      }));
      return;
    }
    if (field.relation) {
      result[field.key] = await fetchRelationOptions(schema, field, record, true);
    }
  }));
  return result;
}

export function renderRecordForm(
  modal: HTMLElement,
  schema: ResourceSchema,
  mode: ResourceFormMode,
  record: ResourceRecord,
  optionsByField: Record<string, RelationOption[]>,
  identity: string,
  runtime: ResourceFormRuntime,
): HTMLElement {
  const readonly = mode === "view";
  const form = el("form", { class: "stack" });
  const fields = sortFormFields(readonly ? detailFields(schema) : editableFields(schema, mode === "create"), runtime);
  const grid = el("div", { class: "form-grid" });

  let currentSection: string | null = null;
  for (const field of fields) {
    const section = runtime.fieldUiText(field, "section")?.trim() || null;
    if (section && section !== currentSection) {
      grid.append(el("div", { class: "form-section field--full" }, [section]));
      currentSection = section;
    }
    grid.append(renderInputField(field, record[field.key], optionsByField[field.key] ?? [], readonly, runtime));
  }

  const errorBox = el("div", { class: "error", hidden: true });
  const footer = el("div", { class: "modal__footer" });
  const cancel = el("button", { class: "button", type: "button" }, [readonly ? runtime.t("close") : runtime.t("cancel")]);
  cancel.addEventListener("click", () => modal.remove());
  footer.append(cancel);

  if (!readonly) {
    const submit = el("button", { class: "button primary", type: "submit" }, [mode === "create" ? runtime.t("create_resource") : runtime.t("save")]);
    footer.append(submit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void submitRecordForm(form, submit, errorBox, modal, schema, mode, fields, identity, runtime);
    });
  }

  form.append(grid, errorBox, footer);
  wireTypeaheadRelationSelectors(form, schema, fields, readonly, runtime);
  wireDependentRelationSelectors(form, schema, fields, readonly, runtime);
  return form;
}

function sortFormFields(fields: ResourceField[], runtime: ResourceFormRuntime): ResourceField[] {
  return [...fields].sort((left, right) => {
    if (fieldDependsOn(left, right.key)) return 1;
    if (fieldDependsOn(right, left.key)) return -1;
    const leftPriority = left.ui?.priority ?? left.relation?.priority ?? 1000;
    const rightPriority = right.ui?.priority ?? right.relation?.priority ?? 1000;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;
    return runtime.fieldName(left).localeCompare(runtime.fieldName(right));
  });
}

function fieldDependsOn(field: ResourceField, sourceFieldKey: string): boolean {
  return (field.relation?.depends_on ?? []).includes(sourceFieldKey);
}

function renderInputField(
  field: ResourceField,
  value: RecordValue,
  options: RelationOption[],
  readonly: boolean,
  runtime: ResourceFormRuntime,
): HTMLElement {
  const labelChildren: Array<Node | string> = [runtime.fieldName(field)];
  if (field.required && !readonly) {
    labelChildren.push(el("span", { class: "required" }, [" *"]));
  }
  if (field.pii) {
    labelChildren.push(el("span", { class: "pii" }, [" PII"]));
  }

  const input = inputForField(field, value, options, readonly, runtime);
  return el("div", { class: fieldContainerClass(field) }, [
    el("label", { for: field.key }, labelChildren),
    input,
    runtime.fieldHelpText(field) ? el("small", {}, [runtime.fieldHelpText(field) ?? ""]) : null,
    ...validationHintNodes(field, readonly, runtime),
  ]);
}

function fieldContainerClass(field: ResourceField): string {
  const width = field.ui?.width;
  if (width === "full") return "field field--full";
  if (width === "half") return "field field--half";
  if (width === "third") return "field field--third";
  return "field";
}

function inputForField(
  field: ResourceField,
  value: RecordValue,
  options: RelationOption[],
  readonly: boolean,
  runtime: ResourceFormRuntime,
): HTMLElement {
  const control = controlForField(field);
  if (control === "checkbox") {
    const input = el("input", {
      id: field.key,
      name: field.key,
      type: "checkbox",
      checked: value === true,
      disabled: readonly,
      "data-field-type": field.type,
    });
    return el("div", { class: "checkbox-row" }, [input, el("span", {}, [value === true ? runtime.t("yes") : runtime.t("no")])]);
  }

  if (control === "enum_select" || control === "fk_select") {
    const select = el("select", {
      id: field.key,
      name: field.key,
      class: "select",
      disabled: readonly,
      ...validationAttributes(field, readonly, runtime),
      "data-field-type": field.type,
    });
    if (field.nullable || !field.required) {
      select.append(el("option", { value: "" }, [runtime.fieldUiText(field, "placeholder") ?? "—"]));
    }
    for (const option of options) {
      const optionValue = String(option.value);
      select.append(el("option", { value: optionValue, selected: String(value ?? "") === optionValue }, [option.label]));
    }
    if (control === "fk_select" && usesTypeaheadOptions(field) && !readonly) {
      return relationTypeaheadControl(field, select, runtime);
    }
    return select;
  }

  if (control === "many_to_many_select") {
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
    if (usesTypeaheadOptions(field) && !readonly) {
      return relationTypeaheadControl(field, select, runtime);
    }
    return select;
  }

  if (control === "textarea" || control === "json_textarea") {
    const textValue = field.type === "json" ? safeJson(value ?? null) : String(value ?? "");
    return el("textarea", {
      id: field.key,
      name: field.key,
      class: "textarea",
      disabled: readonly,
      ...validationAttributes(field, readonly, runtime),
      placeholder: runtime.fieldUiText(field, "placeholder"),
      "data-field-type": field.type,
    }, [textValue]);
  }

  const type = inputType(field, control);
  return el("input", {
    id: field.key,
    name: field.key,
    class: "input",
    type,
    value: inputValue(field, value),
    disabled: readonly,
    ...validationAttributes(field, readonly, runtime),
    placeholder: runtime.fieldUiText(field, "placeholder"),
    "data-field-type": field.type,
  });
}

export function controlForField(field: ResourceField): AdminControl {
  if (field.admin_control) {
    return field.admin_control;
  }
  if (field.type === "boolean") return "checkbox";
  if (field.type === "text" || field.type === "rich_text") return "textarea";
  if (field.type === "json") return "json_textarea";
  if (field.type === "integer" || field.type === "decimal") return "number_input";
  if (field.type === "date") return "date_input";
  if (field.type === "datetime") return "datetime_input";
  if (field.type === "email") return "email_input";
  if (field.type === "enum") return "enum_select";
  if (field.type === "foreign_key") return "fk_select";
  if (field.type === "many_to_many") return "many_to_many_select";
  return "text_input";
}

function validationAttributes(
  field: ResourceField,
  readonly: boolean,
  runtime: ResourceFormRuntime,
): Record<string, string | number | boolean | null | undefined> {
  const validation = field.validation ?? {};
  return {
    required: (validation.required ?? field.required) && !readonly,
    maxlength: validation.max_length,
    minlength: validation.min_length,
    max: validation.max_value,
    min: validation.min_value,
    step: validation.step,
    pattern: validation.pattern,
    title: validationTitle(field, runtime),
  };
}

function validationTitle(field: ResourceField, runtime: ResourceFormRuntime): string | undefined {
  return field.validation?.pattern ? `${runtime.t("expected_pattern")}: ${field.validation.pattern}` : undefined;
}

function validationHintNodes(field: ResourceField, readonly: boolean, runtime: ResourceFormRuntime): Node[] {
  if (readonly) {
    return [];
  }
  const hints = validationHints(field, runtime);
  return hints.length ? [el("small", { class: "validation-hints" }, [hints.join(" · ")])] : [];
}

function validationHints(field: ResourceField, runtime: ResourceFormRuntime): string[] {
  const validation = field.validation ?? {};
  const hints = new Set<string>();
  if ((validation.required ?? field.required) && !field.nullable) hints.add(runtime.t("required"));
  if (validation.min_length !== undefined) hints.add(runtime.formatText("min_chars", { value: validation.min_length }));
  if (validation.max_length !== undefined) hints.add(runtime.formatText("max_chars", { value: validation.max_length }));
  if (validation.min_value !== undefined) hints.add(runtime.formatText("min_number", { value: validation.min_value }));
  if (validation.max_value !== undefined) hints.add(runtime.formatText("max_number", { value: validation.max_value }));
  if (validation.decimal_places !== undefined) hints.add(runtime.formatText("decimal_places", { value: validation.decimal_places }));
  if (validation.format === "email") hints.add(runtime.t("email_format"));
  if (validation.format === "json") hints.add(runtime.t("valid_json"));
  if (validation.pattern) hints.add(runtime.t("must_match_pattern"));
  return [...hints];
}

function relationTypeaheadControl(field: ResourceField, select: HTMLSelectElement, runtime: ResourceFormRuntime): HTMLElement {
  const search = el("input", {
    class: "input relation-search",
    type: "search",
    placeholder: runtime.fieldUiText(field, "placeholder") ?? runtime.t("search_options"),
    "data-typeahead-for": field.key,
    "aria-label": runtime.formatText("search_field_options", { field: runtime.fieldName(field) }),
  });
  return el("div", { class: "relation-typeahead" }, [search, select]);
}

function usesTypeaheadOptions(field: ResourceField): boolean {
  return field.relation?.option_control === "typeahead";
}

function wireTypeaheadRelationSelectors(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  readonly: boolean,
  runtime: ResourceFormRuntime,
): void {
  if (readonly) {
    return;
  }
  const typeaheadFields = fields.filter((field) => usesTypeaheadOptions(field));
  for (const field of typeaheadFields) {
    const search = typeaheadSearchInput(form, field.key);
    const select = form.elements.namedItem(field.key);
    if (!search || !(select instanceof HTMLSelectElement)) {
      continue;
    }
    search.addEventListener("change", () => {
      void refreshOneRelationSelector(form, schema, fields, field, runtime);
    });
  }
}

function typeaheadSearchInput(form: HTMLFormElement, fieldKey: string): HTMLInputElement | null {
  return Array.from(form.querySelectorAll<HTMLInputElement>("input[data-typeahead-for]")).find((input) => input.dataset.typeaheadFor === fieldKey) ?? null;
}

async function refreshOneRelationSelector(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  field: ResourceField,
  runtime: ResourceFormRuntime,
): Promise<void> {
  const select = form.elements.namedItem(field.key);
  if (!(select instanceof HTMLSelectElement)) {
    return;
  }
  const currentValue = select.multiple
    ? Array.from(select.selectedOptions).map((option) => option.value)
    : select.value;
  const values = formValues(form, fields);
  const search = typeaheadSearchInput(form, field.key)?.value ?? "";
  const params = optionQueryParams(field, values, true, search);
  if (!params) {
    replaceSelectOptions(select, field, [], select.multiple ? [] : "", runtime.t("select_dependencies_first"));
    select.disabled = true;
    return;
  }
  select.disabled = true;
  const options = await fetchRelationOptions(schema, field, values, true, search);
  replaceSelectOptions(select, field, options, currentValue, options.length ? "—" : runtime.t("no_options_match"));
  select.disabled = false;
}

function wireDependentRelationSelectors(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  readonly: boolean,
  runtime: ResourceFormRuntime,
): void {
  if (readonly) {
    return;
  }
  const dependentFields = fields.filter((field) => ((field.relation?.dependencies ?? []).length > 0));
  if (dependentFields.length === 0) {
    return;
  }
  setDependentSelectorAvailability(form, fields, dependentFields, runtime);
  const sourceFieldKeys = new Set(dependentFields.flatMap((field) => field.relation?.depends_on ?? []));
  for (const sourceFieldKey of sourceFieldKeys) {
    const element = form.elements.namedItem(sourceFieldKey);
    if (element instanceof HTMLElement) {
      element.addEventListener("change", () => {
        void refreshDependentRelationSelectors(form, schema, fields, dependentFields, runtime);
      });
    }
  }
}

function setDependentSelectorAvailability(
  form: HTMLFormElement,
  fields: ResourceField[],
  dependentFields: ResourceField[],
  runtime: ResourceFormRuntime,
): void {
  const values = formValues(form, fields);
  for (const field of dependentFields) {
    const select = form.elements.namedItem(field.key);
    if (!(select instanceof HTMLSelectElement)) {
      continue;
    }
    const dependenciesReady = relationDependencyFilterModel(field, values, true) !== null;
    select.disabled = !dependenciesReady;
    if (!dependenciesReady) {
      replaceSelectOptions(select, field, [], select.multiple ? [] : "", runtime.t("select_dependencies_first"));
    }
  }
}

async function refreshDependentRelationSelectors(
  form: HTMLFormElement,
  schema: ResourceSchema,
  fields: ResourceField[],
  dependentFields: ResourceField[],
  runtime: ResourceFormRuntime,
): Promise<void> {
  for (const field of sortFormFields(dependentFields, runtime)) {
    const select = form.elements.namedItem(field.key);
    if (!(select instanceof HTMLSelectElement)) {
      continue;
    }
    await refreshOneRelationSelector(form, schema, fields, field, runtime);
  }
}

function formValues(form: HTMLFormElement, fields: ResourceField[]): Record<string, RecordValue> {
  const values: Record<string, RecordValue> = {};
  for (const field of fields) {
    const element = form.elements.namedItem(field.key);
    if (!element) {
      continue;
    }
    values[field.key] = valueFromElement(element, field);
  }
  return values;
}

function replaceSelectOptions(
  select: HTMLSelectElement,
  field: ResourceField,
  options: RelationOption[],
  selectedValue: string | string[],
  emptyLabel = "—",
): void {
  const selected = new Set(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
  clear(select);
  if (!select.multiple && (field.nullable || !field.required || options.length === 0)) {
    select.append(el("option", { value: "" }, [emptyLabel]));
  }
  for (const option of options) {
    const optionValue = String(option.value);
    select.append(el("option", { value: optionValue, selected: selected.has(optionValue) }, [option.label]));
  }
}

async function submitRecordForm(
  form: HTMLFormElement,
  submit: HTMLButtonElement,
  errorBox: HTMLElement,
  modal: HTMLElement,
  schema: ResourceSchema,
  mode: Exclude<ResourceFormMode, "view">,
  fields: ResourceField[],
  identity: string,
  runtime: ResourceFormRuntime,
): Promise<void> {
  submit.disabled = true;
  submit.textContent = mode === "create" ? runtime.t("creating") : runtime.t("saving");
  errorBox.hidden = true;
  errorBox.textContent = "";

  try {
    const clientErrors = clientValidationErrors(form, fields, runtime);
    if (clientErrors.length > 0) {
      errorBox.hidden = false;
      errorBox.textContent = clientErrors.join("\n");
      form.reportValidity();
      return;
    }
    const payload = formPayload(form, fields, mode);
    const savedRecord = await runtime.submitRecordPayload({ schema, mode, identity, payload });
    modal.remove();
    await runtime.afterSuccessfulSubmit(schema, mode, savedRecord);
  } catch (error) {
    const message = publicErrorMessage(error, runtime.t("save_failed"));
    errorBox.hidden = false;
    errorBox.textContent = message;
    runtime.reportError(message);
  } finally {
    submit.disabled = false;
    submit.textContent = mode === "create" ? runtime.t("create_resource") : runtime.t("save");
    runtime.render();
  }
}

function clientValidationErrors(form: HTMLFormElement, fields: ResourceField[], runtime: ResourceFormRuntime): string[] {
  const errors: string[] = [];
  if (!form.checkValidity()) {
    errors.push(runtime.t("fix_highlighted_fields"));
  }
  for (const field of fields) {
    const element = form.elements.namedItem(field.key);
    if (!(element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement)) {
      continue;
    }
    const raw = element.value.trim();
    if (field.type === "json" && raw) {
      try {
        JSON.parse(raw);
      } catch {
        errors.push(`${runtime.fieldName(field)} ${runtime.t("valid_json_required")}`);
      }
    }
  }
  return Array.from(new Set(errors));
}

function formPayload(form: HTMLFormElement, fields: ResourceField[], mode: Exclude<ResourceFormMode, "view">): Record<string, JsonValue> {
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
