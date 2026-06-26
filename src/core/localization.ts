import type {
  DestructiveAction,
  FilterOperatorDefinition,
  LocalizedText,
  Locale,
  RelatedListDefinition,
  ResourceField,
  ResourceSchema,
} from "./types.js";
import { UI_TEXT } from "./i18n.js";

export function localizedTextForLocale(locale: Locale, fallback: string, text?: LocalizedText): string {
  if (!text) return fallback;
  return text[locale] || text.en || text.es || fallback;
}

export function translateForLocale(locale: Locale, key: string): string {
  return UI_TEXT[key]?.[locale] ?? UI_TEXT[key]?.es ?? key;
}

export function formatTextForLocale(locale: Locale, key: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translateForLocale(locale, key),
  );
}

export function resourceNameForLocale(locale: Locale, resource: ResourceSchema, plural = false): string {
  return localizedTextForLocale(
    locale,
    plural ? (resource.plural_label || resource.label || resource.key) : (resource.label || resource.key),
    plural ? resource.i18n?.plural_label : resource.i18n?.label,
  );
}

export function fieldNameForLocale(locale: Locale, field: ResourceField): string {
  return localizedTextForLocale(locale, field.label || field.key, field.i18n?.label);
}

export function relatedListNameForLocale(locale: Locale, relatedList: RelatedListDefinition): string {
  return localizedTextForLocale(locale, relatedList.label ?? "", relatedList.i18n?.label);
}

export function fieldHelpTextForLocale(locale: Locale, field: ResourceField): string | undefined {
  const fallback = field.help_text ?? "";
  const text = localizedTextForLocale(locale, fallback, field.i18n?.help_text);
  return text || undefined;
}

export function fieldUiTextForLocale(locale: Locale, field: ResourceField, key: "section" | "placeholder"): string | undefined {
  const fallback = field.ui?.[key] ?? "";
  const text = localizedTextForLocale(locale, fallback, field.i18n?.ui?.[key]);
  return text || undefined;
}

export function actionLabelForLocale(locale: Locale, action: DestructiveAction | undefined, fallback: string): string {
  return localizedTextForLocale(locale, action?.label ?? fallback, action?.i18n?.label);
}

export function actionMessageForLocale(locale: Locale, action: DestructiveAction | undefined, fallback: string): string {
  return localizedTextForLocale(locale, action?.message ?? fallback, action?.i18n?.message);
}

export function operatorLabelForLocale(locale: Locale, operator: FilterOperatorDefinition): string {
  return localizedTextForLocale(locale, operator.label || operator.key, operator.i18n?.label);
}
