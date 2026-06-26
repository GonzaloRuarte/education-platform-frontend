import type {
  JsonValue,
  ManualScoringQueueResponse,
  ManualScoringQueueRow,
  ManualScoringState,
  ManualScoringStateKey,
  Toast,
} from "../core/types";
import { el } from "../core/dom";
import { apiFetch, publicErrorMessage, withQueryParams } from "../api/api";
import { BUSINESS_WORKFLOW_TEST_IDS } from "../core/testIds";
import {
  clearManualScoringDraft,
  loadManualScoringDraft,
  saveManualScoringDraft,
  type ManualScoringAnnotationDraft,
} from "./manualScoringDrafts";

export interface ManualScoringViewRuntime {
  manualScoring: ManualScoringState;
  t: (key: string) => string;
  render: () => void;
  notify: (tone: Toast["tone"], message: string) => void;
}

let runtime: ManualScoringViewRuntime;

const SCORING_STATES: ManualScoringStateKey[] = [
  "manual_scoring_pending",
  "auto_scored",
  "manual_override",
  "manually_scored",
];

export function renderManualScoringPage(nextRuntime: ManualScoringViewRuntime): HTMLElement {
  runtime = nextRuntime;
  if (!runtime.manualScoring.queue && !runtime.manualScoring.loading) {
    void loadManualScoringQueue();
  }

  const stateFilter = el("select", {
    class: "select",
    "aria-label": runtime.t("manual_scoring_state_filter"),
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.stateFilter,
  }) as HTMLSelectElement;
  for (const state of SCORING_STATES) {
    stateFilter.append(el("option", {
      value: state,
      selected: runtime.manualScoring.scoringState === state ? true : null,
    }, [manualScoringStateLabel(state)]));
  }
  stateFilter.addEventListener("change", () => {
    runtime.manualScoring.scoringState = stateFilter.value as ManualScoringStateKey;
    runtime.manualScoring.queue = null;
    runtime.manualScoring.selectedQuestionResolutionId = null;
    runtime.manualScoring.error = null;
    runtime.render();
    void loadManualScoringQueue();
  });

  const reloadButton = el("button", {
    class: "button",
    type: "button",
    disabled: runtime.manualScoring.loading ? true : null,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.reloadButton,
  }, [runtime.t("manual_scoring_reload")]);
  reloadButton.addEventListener("click", () => {
    void loadManualScoringQueue();
  });

  const notices: Node[] = [];
  if (runtime.manualScoring.error) {
    notices.push(el("div", { class: "error" }, [runtime.manualScoring.error]));
  }
  if (runtime.manualScoring.loading) {
    notices.push(el("div", { class: "notice" }, [runtime.t("loading_records")]));
  }

  return el("section", { class: "stack manual-scoring", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.page }, [
    el("div", { class: "page-header" }, [
      el("div", {}, [
        el("h2", { class: "page-title" }, [runtime.t("manual_scoring_title")]),
        el("p", { class: "page-subtitle" }, [runtime.t("manual_scoring_subtitle")]),
      ]),
      el("div", { class: "toolbar" }, [stateFilter, reloadButton]),
    ]),
    ...notices,
    renderManualScoringQueue(),
    renderManualScoringForm(),
  ]);
}

async function loadManualScoringQueue(): Promise<void> {
  runtime.manualScoring.loading = true;
  runtime.manualScoring.error = null;
  try {
    runtime.manualScoring.queue = await apiFetch<ManualScoringQueueResponse>(withQueryParams("/api/resolutions/manual-scoring-queue/", {
      scoring_state: runtime.manualScoring.scoringState,
      limit: "50",
      offset: "0",
    }));
    if (
      runtime.manualScoring.selectedQuestionResolutionId !== null
      && !(runtime.manualScoring.queue.results ?? []).some((row) => row.question_resolution_id === runtime.manualScoring.selectedQuestionResolutionId)
    ) {
      runtime.manualScoring.selectedQuestionResolutionId = null;
    }
  } catch (error) {
    runtime.manualScoring.error = publicErrorMessage(error, runtime.t("manual_scoring_load_failed"));
    runtime.notify("error", runtime.manualScoring.error);
  } finally {
    runtime.manualScoring.loading = false;
    runtime.render();
  }
}

function renderManualScoringQueue(): HTMLElement {
  const queue = runtime.manualScoring.queue;
  if (!queue) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.queue }, [
      el("div", { class: "card__body" }, [runtime.t("loading_records")]),
    ]);
  }
  const rows = queue.results ?? [];
  if (rows.length === 0) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.queue }, [
      el("div", { class: "card__body stack" }, [
        el("h3", {}, [runtime.t("manual_scoring_queue")]),
        el("div", { class: "empty" }, [runtime.t("manual_scoring_empty")]),
      ]),
    ]);
  }

  return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.queue }, [
    el("div", { class: "card__body stack" }, [
      el("div", { class: "toolbar" }, [
        el("h3", {}, [runtime.t("manual_scoring_queue")]),
        el("span", { class: "toolbar__spacer" }),
        el("span", { class: "meta-line" }, [`${rows.length}/${queue.count}`]),
      ]),
      el("div", { class: "records-table__wrap" }, [
        el("table", { class: "records-table" }, [
          el("thead", {}, [
            el("tr", {}, [
              el("th", {}, [runtime.t("manual_scoring_question")]),
              el("th", {}, [runtime.t("manual_scoring_student")]),
              el("th", {}, [runtime.t("manual_scoring_answer_type")]),
              el("th", {}, [runtime.t("manual_scoring_submitted_value")]),
              el("th", {}, [runtime.t("manual_scoring_state")]),
              el("th", {}, [runtime.t("actions")]),
            ]),
          ]),
          el("tbody", {}, rows.map(renderManualScoringQueueRow)),
        ]),
      ]),
    ]),
  ]);
}

function renderManualScoringQueueRow(row: ManualScoringQueueRow): HTMLElement {
  const selected = runtime.manualScoring.selectedQuestionResolutionId === row.question_resolution_id;
  const selectButton = el("button", { class: "button", type: "button" }, [
    selected ? runtime.t("manual_scoring_selected") : runtime.t("manual_scoring_select"),
  ]);
  selectButton.addEventListener("click", () => selectManualScoringRow(row));
  return el("tr", { class: selected ? "selected" : "" }, [
    el("td", {}, [summarize(row.question?.content || `#${row.question?.id ?? row.question_resolution_id}`, 120)]),
    el("td", {}, [manualScoringStudentLabel(row)]),
    el("td", {}, [row.answer_type]),
    el("td", { class: "cell-json" }, [formatSubmittedValue(row.submitted_value)]),
    el("td", {}, [String(row.scoring_state)]),
    el("td", {}, [selectButton]),
  ]);
}

function selectManualScoringRow(row: ManualScoringQueueRow): void {
  runtime.manualScoring.selectedQuestionResolutionId = row.question_resolution_id;
  runtime.manualScoring.isRight = row.manual_is_right === true ? "true" : row.manual_is_right === false ? "false" : "";
  runtime.manualScoring.manualScore = row.manual_score === null || row.manual_score === undefined ? "" : String(row.manual_score);
  runtime.manualScoring.manualScoreMax = row.manual_score_max === null || row.manual_score_max === undefined
    ? (row.rubric?.max_score === null || row.rubric?.max_score === undefined ? "" : String(row.rubric.max_score))
    : String(row.manual_score_max);
  runtime.manualScoring.reason = row.manual_score_reason || "";
  const draft = loadManualScoringDraft(row.question_resolution_id);
  if (draft) {
    runtime.manualScoring.manualScore = draft.manual_score === null ? "" : String(draft.manual_score);
    runtime.manualScoring.manualScoreMax = draft.manual_score_max === null || draft.manual_score_max === undefined ? runtime.manualScoring.manualScoreMax : String(draft.manual_score_max);
    runtime.manualScoring.reason = draft.manual_score_reason || runtime.manualScoring.reason;
  }
  runtime.render();
}

function renderManualScoringForm(): HTMLElement {
  const selected = selectedManualScoringRow();
  if (!selected) {
    return el("section", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.scoreForm }, [
      el("div", { class: "card__body stack" }, [
        el("h3", {}, [runtime.t("manual_scoring_form")]),
        el("p", { class: "cell-muted" }, [runtime.t("manual_scoring_select_help")]),
      ]),
    ]);
  }

  const correctSelect = el("select", { class: "select", required: true, name: "is_right" }) as HTMLSelectElement;
  correctSelect.append(
    el("option", { value: "", selected: runtime.manualScoring.isRight === "" ? true : null }, [runtime.t("manual_scoring_choose")]),
    el("option", { value: "true", selected: runtime.manualScoring.isRight === "true" ? true : null }, [runtime.t("yes")]),
    el("option", { value: "false", selected: runtime.manualScoring.isRight === "false" ? true : null }, [runtime.t("no")]),
  );
  correctSelect.addEventListener("change", () => {
    runtime.manualScoring.isRight = correctSelect.value;
  });

  const scoreInput = el("input", { class: "input", type: "number", min: "0", step: "0.01", value: runtime.manualScoring.manualScore, name: "manual_score" }) as HTMLInputElement;
  scoreInput.addEventListener("input", () => {
    runtime.manualScoring.manualScore = scoreInput.value;
    saveSelectedDraft(selected);
  });
  const maxInput = el("input", { class: "input", type: "number", min: "0", step: "0.01", value: runtime.manualScoring.manualScoreMax, name: "manual_score_max" }) as HTMLInputElement;
  maxInput.addEventListener("input", () => {
    runtime.manualScoring.manualScoreMax = maxInput.value;
    saveSelectedDraft(selected);
  });
  const reasonInput = el("textarea", { class: "input", rows: 3, name: "reason", value: runtime.manualScoring.reason }) as HTMLTextAreaElement;
  reasonInput.addEventListener("input", () => {
    runtime.manualScoring.reason = reasonInput.value;
    saveSelectedDraft(selected);
  });

  const submit = el("button", {
    class: "button primary",
    type: "submit",
    disabled: runtime.manualScoring.loading ? true : null,
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.submitButton,
  }, [runtime.t("manual_scoring_submit")]);

  const form = el("form", { class: "card", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.scoreForm }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [runtime.t("manual_scoring_form")]),
      el("p", { class: "cell-muted" }, [manualScoringFormContext(selected)]),
      renderRubricContext(selected),
      fieldShell(runtime.t("manual_scoring_is_right"), correctSelect),
      fieldShell(runtime.t("manual_scoring_score"), scoreInput),
      fieldShell(runtime.t("manual_scoring_score_max"), maxInput),
      fieldShell(runtime.t("manual_scoring_reason"), reasonInput),
      renderAnnotationEditor(selected),
      renderReleaseCorrectionControl(selected),
      submit,
    ]),
  ]);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void submitManualScore();
  });
  return form;
}

function renderRubricContext(row: ManualScoringQueueRow): HTMLElement {
  const rubric = row.rubric;
  if (!rubric || (!rubric.title && !rubric.description && (rubric.max_score === null || rubric.max_score === undefined))) {
    return el("div", { class: "notice" }, [runtime.t("manual_scoring_no_rubric")]);
  }
  const parts: Node[] = [];
  if (rubric.title) {
    parts.push(el("strong", {}, [rubric.title]));
  }
  if (rubric.description) {
    parts.push(el("div", { class: "cell-json" }, [summarize(rubric.description, 300)]));
  }
  if (rubric.max_score !== null && rubric.max_score !== undefined) {
    parts.push(el("div", { class: "meta-line" }, [`${runtime.t("manual_scoring_rubric_max_score")}: ${rubric.max_score}`]));
  }
  return el("section", { class: "notice" }, [
    el("div", { class: "meta-line" }, [runtime.t("manual_scoring_rubric")]),
    ...parts,
  ]);
}

function fieldShell(label: string, input: HTMLElement): HTMLElement {
  return el("div", { class: "field" }, [el("label", {}, [label]), input]);
}

async function submitManualScore(): Promise<void> {
  const selectedId = runtime.manualScoring.selectedQuestionResolutionId;
  if (selectedId === null || runtime.manualScoring.isRight === "") {
    runtime.notify("error", runtime.t("manual_scoring_select_required"));
    return;
  }
  const manualScore = parseOptionalNumber(runtime.manualScoring.manualScore);
  const manualScoreMax = parseOptionalNumber(runtime.manualScoring.manualScoreMax);
  if (manualScore !== null && manualScoreMax !== null && manualScore > manualScoreMax) {
    runtime.notify("error", runtime.t("manual_scoring_score_invalid"));
    return;
  }

  runtime.manualScoring.loading = true;
  runtime.manualScoring.error = null;
  try {
    await apiFetch<Record<string, JsonValue>>("/api/resolutions/manual-score/", {
      method: "POST",
      body: JSON.stringify({
        question_resolution_id: selectedId,
        is_right: runtime.manualScoring.isRight === "true",
        manual_score: manualScore,
        manual_score_max: manualScoreMax,
        reason: runtime.manualScoring.reason,
        annotations: loadManualScoringDraft(selectedId)?.annotations ?? [],
      }),
    });
    clearManualScoringDraft(selectedId);
    runtime.notify("success", runtime.t("manual_scoring_saved"));
    runtime.manualScoring.selectedQuestionResolutionId = null;
    runtime.manualScoring.isRight = "";
    runtime.manualScoring.manualScore = "";
    runtime.manualScoring.manualScoreMax = "";
    runtime.manualScoring.reason = "";
    await loadManualScoringQueue();
  } catch (error) {
    runtime.manualScoring.error = publicErrorMessage(error, runtime.t("manual_scoring_save_failed"));
    runtime.notify("error", runtime.manualScoring.error);
  } finally {
    runtime.manualScoring.loading = false;
    runtime.render();
  }
}


function renderAnnotationEditor(row: ManualScoringQueueRow): HTMLElement {
  if (row.answer_type !== "OpenEnded") {
    return el("div", { class: "notice" }, [runtime.t("manual_scoring_annotations_open_ended_only")]);
  }
  const submittedText = String(row.submitted_value?.value ?? "");
  const draft = loadManualScoringDraft(row.question_resolution_id);
  const annotations = draft?.annotations ?? row.annotations ?? [];
  const textArea = el("textarea", {
    class: "textarea",
    rows: 7,
    readonly: true,
    value: submittedText,
  }) as HTMLTextAreaElement;
  const commentInput = el("textarea", {
    class: "textarea",
    rows: 3,
    placeholder: runtime.t("manual_scoring_annotation_comment"),
  }) as HTMLTextAreaElement;
  const addButton = el("button", { class: "button", type: "button" }, [runtime.t("manual_scoring_add_annotation")]);
  addButton.addEventListener("click", () => {
    const start = textArea.selectionStart ?? 0;
    const end = textArea.selectionEnd ?? start;
    const comment = commentInput.value.trim();
    if (!comment || end <= start) {
      runtime.notify("error", runtime.t("manual_scoring_annotation_required"));
      return;
    }
    const nextAnnotation: ManualScoringAnnotationDraft = {
      anchor_start: start,
      anchor_end: end,
      anchor_quote: submittedText.slice(start, end),
      comment,
    };
    saveSelectedDraft(row, [...annotations, nextAnnotation]);
    commentInput.value = "";
    runtime.render();
  });

  return el("section", { class: "notice stack", "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.textAnnotationEditor }, [
    el("div", { class: "meta-line" }, [runtime.t("manual_scoring_annotation_editor")]),
    textArea,
    fieldShell(runtime.t("manual_scoring_annotation_comment"), commentInput),
    addButton,
    annotations.length
      ? el("ul", {}, annotations.map((annotation, index) => el("li", {}, [
          el("strong", {}, [annotation.anchor_quote || `${annotation.anchor_start}-${annotation.anchor_end}`]),
          ` — ${annotation.comment} `,
          removeAnnotationButton(row, index, annotations as ManualScoringAnnotationDraft[]),
        ])))
      : el("div", { class: "cell-muted" }, [runtime.t("manual_scoring_no_annotations")]),
  ]);
}

function removeAnnotationButton(row: ManualScoringQueueRow, index: number, annotations: ManualScoringAnnotationDraft[]): HTMLElement {
  const button = el("button", { class: "button flat", type: "button" }, [runtime.t("delete")]);
  button.addEventListener("click", () => {
    saveSelectedDraft(row, annotations.filter((_, currentIndex) => currentIndex !== index));
    runtime.render();
  });
  return button;
}

function renderReleaseCorrectionControl(row: ManualScoringQueueRow): HTMLElement {
  if (!row.evaluation_resolution_id) {
    return el("div", { class: "cell-muted" }, [runtime.t("manual_scoring_release_unavailable")]);
  }
  const button = el("button", {
    class: "button",
    type: "button",
    "data-testid": BUSINESS_WORKFLOW_TEST_IDS.manualScoring.releaseCorrectionButton,
  }, [runtime.t("manual_scoring_release_correction")]);
  button.addEventListener("click", () => {
    void releaseCorrection(row.evaluation_resolution_id as number);
  });
  return el("section", { class: "notice" }, [button]);
}

async function releaseCorrection(evaluationResolutionId: number): Promise<void> {
  try {
    await apiFetch<Record<string, JsonValue>>("/api/resolutions/release-correction/", {
      method: "POST",
      body: JSON.stringify({ evaluation_resolution_id: evaluationResolutionId }),
    });
    runtime.notify("success", runtime.t("manual_scoring_released"));
  } catch (error) {
    runtime.notify("error", publicErrorMessage(error, runtime.t("manual_scoring_release_failed")));
  }
}

function saveSelectedDraft(row: ManualScoringQueueRow, annotations?: ManualScoringAnnotationDraft[]): void {
  saveManualScoringDraft({
    question_resolution_id: row.question_resolution_id,
    manual_score: parseOptionalNumber(runtime.manualScoring.manualScore),
    manual_score_max: parseOptionalNumber(runtime.manualScoring.manualScoreMax),
    manual_score_reason: runtime.manualScoring.reason,
    annotations: annotations ?? loadManualScoringDraft(row.question_resolution_id)?.annotations ?? row.annotations ?? [],
    updated_at: new Date().toISOString(),
  });
}

function selectedManualScoringRow(): ManualScoringQueueRow | null {
  const selectedId = runtime.manualScoring.selectedQuestionResolutionId;
  if (selectedId === null) return null;
  return (runtime.manualScoring.queue?.results ?? []).find((row) => row.question_resolution_id === selectedId) ?? null;
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function manualScoringStateLabel(state: ManualScoringStateKey): string {
  return runtime.t(`manual_scoring_state_${state}`);
}

function manualScoringStudentLabel(row: ManualScoringQueueRow): string {
  const student = row.student;
  const personal = student?.personal_id ? ` · ${student.personal_id}` : "";
  const institution = student?.institution?.name || `#${student?.institution?.id ?? "—"}`;
  return `${institution}${personal}`;
}

function manualScoringFormContext(row: ManualScoringQueueRow): string {
  return `${row.answer_type} · ${summarize(row.question?.content || `#${row.question_resolution_id}`, 180)}`;
}

function formatSubmittedValue(value: Record<string, JsonValue> | undefined): string {
  if (!value) return "—";
  if (typeof value.value === "string" || typeof value.value === "number" || typeof value.value === "boolean") {
    return String(value.value);
  }
  return JSON.stringify(value);
}

function summarize(value: string, maxLength: number): string {
  const normalized = value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength - 1)}…` : normalized;
}
