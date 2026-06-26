import type { JsonValue, ResourceExposureManifestItem, ResourceExposureState } from "../core/types";
import { el } from "../core/dom";
import { safeJson } from "../core/fieldFormatting";
import { BUSINESS_WORKFLOW_TEST_IDS } from "../core/testIds";

export interface ResourceExposureViewRuntime {
  state: ResourceExposureState;
  t: (key: string) => string;
  render: () => void;
  loadResourceExposureManifest: () => Promise<void> | void;
  renderLoadingPage: (message: string) => HTMLElement;
  fieldShell: (label: string, input: HTMLElement, helpText?: string) => HTMLElement;
}

export function renderResourceExposurePage(runtime: ResourceExposureViewRuntime): HTMLElement {
  const { state, t } = runtime;
  if (!state.manifest && !state.loading) {
    void runtime.loadResourceExposureManifest();
  }

  const refreshButton = el("button", { class: "button", type: "button", disabled: state.loading ? true : null }, [t("refresh_resource")]);
  refreshButton.addEventListener("click", () => {
    void runtime.loadResourceExposureManifest();
  });

  const notices: Node[] = [];
  if (state.error) {
    notices.push(el("div", { class: "error" }, [state.error]));
  }
  if (state.loading) {
    notices.push(runtime.renderLoadingPage(t("loading_resource")));
  }

  return el("section", { class: "stack resource-exposure", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.resourceExposure.page }, [
    el("header", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [t("resource_exposure_title")]),
        el("p", { class: "page-subtitle" }, [t("resource_exposure_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [refreshButton]),
    ]),
    ...notices,
    renderResourceExposureSummary(runtime),
    renderResourceExposureFilters(runtime),
    renderResourceExposureTable(runtime),
  ]);
}

function renderResourceExposureSummary(runtime: ResourceExposureViewRuntime): HTMLElement {
  const { state, t } = runtime;
  const manifest = state.manifest;
  if (!manifest) {
    return el("section", { class: "card" }, [el("div", { class: "card__body cell-muted" }, [t("resource_exposure_load_failed")])]);
  }
  const counts = manifest.counts_by_exposure ?? {};
  const countBadges = Object.entries(counts).map(([key, value]) => el("span", { class: "badge" }, [`${key}: ${value}`]));
  return el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [t("resource_exposure_counts")]),
        manifest.platform_only ? el("span", { class: "badge" }, [t("resource_exposure_platform_only")]) : null,
      ]),
      el("div", { class: "toolbar" }, countBadges),
      manifest.classification_ssot ? el("p", { class: "meta-line" }, [`SSOT: ${manifest.classification_ssot}`]) : null,
      el("p", { class: "meta-line" }, [t("resource_exposure_legend")]),
      manifest.redacted_internal_resource_inspection
        ? el("div", { class: "notice" }, [`${t("resource_exposure_redaction")}: ${safeJson(manifest.redacted_internal_resource_inspection as Record<string, JsonValue>)}`])
        : null,
    ]),
  ]);
}

function renderResourceExposureFilters(runtime: ResourceExposureViewRuntime): HTMLElement {
  const { state, t } = runtime;
  const exposureSelect = el("select", { class: "input" });
  exposureSelect.append(el("option", { value: "", selected: state.exposureFilter === "" ? true : null }, [t("all")]));
  for (const exposure of resourceExposureOptions(state)) {
    exposureSelect.append(el("option", { value: exposure, selected: state.exposureFilter === exposure ? true : null }, [exposure]));
  }
  exposureSelect.addEventListener("change", () => {
    state.exposureFilter = exposureSelect.value;
    runtime.render();
  });

  const queryInput = el("input", { class: "input", type: "search", value: state.query, placeholder: t("resource_exposure_query") });
  queryInput.addEventListener("input", () => {
    state.query = queryInput.value;
    runtime.render();
  });

  return el("section", { class: "card" }, [
    el("div", { class: "card__body toolbar" }, [
      runtime.fieldShell(t("resource_exposure_filter"), exposureSelect),
      runtime.fieldShell(t("resource_exposure_query"), queryInput),
    ]),
  ]);
}

function renderResourceExposureTable(runtime: ResourceExposureViewRuntime): HTMLElement {
  const { t } = runtime;
  const resources = filteredResourceExposureItems(runtime.state);
  if (!resources.length) {
    return el("section", { class: "card" }, [el("div", { class: "card__body empty" }, [t("resource_exposure_no_resources")])]);
  }
  const rows = resources.map((item) => el("tr", {}, [
    el("td", {}, [item.resource_key]),
    el("td", {}, [item.model]),
    el("td", {}, [item.exposure]),
    el("td", {}, [item.inspection_mode]),
    el("td", {}, [item.generic_discovery_eligible ? t("yes") : t("no")]),
    el("td", {}, [`${item.path}:${item.line}`]),
  ]));
  return el("section", { class: "card" }, [
    el("div", { class: "card__body table-wrap" }, [
      el("table", { class: "records-table" }, [
        el("thead", {}, [el("tr", {}, [
          el("th", {}, ["resource_key"]),
          el("th", {}, ["model"]),
          el("th", {}, ["exposure"]),
          el("th", {}, ["inspection_mode"]),
          el("th", {}, ["generic_discovery_eligible"]),
          el("th", {}, ["source"]),
        ])]),
        el("tbody", {}, rows),
      ]),
    ]),
  ]);
}

function resourceExposureOptions(state: ResourceExposureState): string[] {
  return Object.keys(state.manifest?.counts_by_exposure ?? {}).sort();
}

function filteredResourceExposureItems(state: ResourceExposureState): ResourceExposureManifestItem[] {
  const manifest = state.manifest;
  const resources = manifest?.resources ?? [];
  const exposure = state.exposureFilter;
  const query = state.query.trim().toLowerCase();
  return resources.filter((item) => {
    if (exposure && item.exposure !== exposure) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [item.model, item.resource_key, item.path, item.inspection_mode, item.exposure]
      .some((value) => value.toLowerCase().includes(query));
  });
}
