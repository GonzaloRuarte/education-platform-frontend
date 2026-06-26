import { clear, el } from "../core/dom.js";
import { publicErrorMessage, saveSession, withQueryParams } from "../api/api.js";
import { FUTURE_BUSINESS_FRONTEND_TEST_IDS } from "../core/testIds.js";
import type { Toast } from "../core/types.js";
import {
  authorizeStudentExam,
  clearStudentExamOfflineState,
  fetchReleasedStudentCorrection,
  loadStudentExamOfflineState,
  resumeStudentExam,
  saveStudentExamOfflineState,
  submitStudentExam,
  uploadStudentExamState,
  type StudentCorrectionQuestion,
  type StudentCorrectionResponse,
  type StudentExamAnswer,
  type StudentExamAuthorizeResponse,
  type StudentExamPage,
  type StudentExamQuestion,
  type StudentExamResolutionStatus,
  type StudentExamStateAnswer,
  type StudentExamStatePayload,
} from "../api/studentExamApi.js";

export interface StudentExamRuntime {
  t: (key: string) => string;
  render: () => void;
  notify: (tone: Toast["tone"], message: string) => void;
}

type SyncState = "idle" | "local" | "syncing" | "synced" | "failed" | "submitted";

const TEST_IDS = FUTURE_BUSINESS_FRONTEND_TEST_IDS.studentExam;
let runtime: StudentExamRuntime;
let personalId = "";
let loading = false;
let error: string | null = null;
let examStatus: StudentExamResolutionStatus | null = null;
let answers: Record<string, StudentExamStateAnswer> = {};
let syncState: SyncState = "idle";
let correction: StudentCorrectionResponse | null = null;
let correctionError: string | null = null;

export function renderStudentExamPage(nextRuntime: StudentExamRuntime): HTMLElement {
  runtime = nextRuntime;
  if (!examStatus) {
    return renderEntryPage();
  }
  return renderExamShell();
}

export function renderStudentCorrectionPage(nextRuntime: StudentExamRuntime): HTMLElement {
  runtime = nextRuntime;
  const params = new URLSearchParams(location.hash.split("?")[1] ?? "");
  const resolutionId = Number(params.get("evaluation_resolution_id") || params.get("resolution_id") || "0");
  if (!Number.isFinite(resolutionId) || resolutionId <= 0) {
    return el("main", { class: "main" }, [
      el("section", { class: "card", "data-testid": TEST_IDS.correctionView }, [
        el("div", { class: "card__body stack" }, [
          el("h1", { class: "page-title" }, [runtime.t("student_correction_title")]),
          el("div", { class: "error" }, [runtime.t("student_correction_resolution_required")]),
        ]),
      ]),
    ]);
  }
  if (!correction && !loading) {
    void loadCorrection(resolutionId);
  }
  return renderCorrectionShell();
}

function renderEntryPage(): HTMLElement {
  const input = el("input", {
    class: "input",
    name: "personal_id",
    required: true,
    autocomplete: "username",
    value: personalId,
    placeholder: runtime.t("student_exam_personal_id"),
    "data-testid": TEST_IDS.personalIdInput,
  }) as HTMLInputElement;
  input.addEventListener("input", () => {
    personalId = input.value;
  });

  const submit = el("button", {
    class: "button primary",
    type: "submit",
    disabled: loading ? true : null,
    "data-testid": TEST_IDS.authorizeSubmit,
  }, [loading ? runtime.t("loading_records") : runtime.t("student_exam_enter")]);

  const form = el("form", { class: "stack", "data-testid": TEST_IDS.authorizeForm }, [
    field(runtime.t("student_exam_personal_id"), input),
    el("p", { class: "meta-line" }, [runtime.t("student_exam_personal_id_context")]),
    error ? el("div", { class: "error" }, [error]) : null,
    submit,
  ]);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void authorizeAndResume();
  });

  return el("main", { class: "login-page", "data-testid": TEST_IDS.entryPage }, [
    el("section", { class: "card login-card" }, [
      el("div", { class: "card__body stack" }, [
        el("h1", {}, [runtime.t("student_exam_title")]),
        el("p", { class: "cell-muted" }, [runtime.t("student_exam_subtitle")]),
        form,
      ]),
    ]),
  ]);
}

async function authorizeAndResume(): Promise<void> {
  if (!personalId.trim()) {
    error = runtime.t("student_exam_personal_id_required");
    runtime.render();
    return;
  }
  loading = true;
  error = null;
  runtime.render();
  try {
    const token: StudentExamAuthorizeResponse = await authorizeStudentExam({ personal_id: personalId.trim() });
    saveSession({ token, user: { username: personalId.trim() } });
    await resumeExam();
  } catch (err) {
    error = publicErrorMessage(err, runtime.t("student_exam_authorize_failed"));
  } finally {
    loading = false;
    runtime.render();
  }
}

async function resumeExam(): Promise<void> {
  examStatus = await resumeStudentExam();
  personalId = String(examStatus.student_personal_id || personalId);
  answers = answersFromServerOrLocal(examStatus);
  syncState = "idle";
}

function answersFromServerOrLocal(status: StudentExamResolutionStatus): Record<string, StudentExamStateAnswer> {
  const last = status.resolution?.last_uploaded_state?.answers ?? status.last_uploaded_state?.answers;
  const local = loadStudentExamOfflineState(status.appointment_id, status.student_personal_id);
  if (local?.payload?.answers && Object.keys(local.payload.answers).length > Object.keys(last ?? {}).length) {
    syncState = local.sync_status === "sync_failed" ? "failed" : "local";
    return local.payload.answers;
  }
  return (last ?? {}) as Record<string, StudentExamStateAnswer>;
}

function renderExamShell(): HTMLElement {
  const status = examStatus;
  if (!status) return renderEntryPage();
  const evaluation = status.evaluation;
  const topSubmitButton = finalSubmitButton(TEST_IDS.submitButton);
  const bottomSubmitButton = finalSubmitButton(`${TEST_IDS.submitButton}-bottom`);
  return el("main", { class: "main", "data-testid": TEST_IDS.shell }, [
    el("section", { class: "stack" }, [
      el("div", { class: "page-header" }, [
        el("div", {}, [
          el("h1", { class: "page-title" }, [evaluation?.title || runtime.t("student_exam_title")]),
          el("p", { class: "page-subtitle" }, [runtime.t("student_exam_no_visible_timer")]),
        ]),
        topSubmitButton,
      ]),
      renderStatusBar(),
      el("div", { class: "toolbar", "data-testid": TEST_IDS.questionNavigation }, [
        ...(evaluation?.pages ?? []).map((_, index) => el("span", { class: "meta-line" }, [`${runtime.t("page")} ${index + 1}`])),
      ]),
      el("section", { class: "stack", "data-testid": TEST_IDS.content }, renderPages(status.evaluation?.pages ?? [])),
      bottomSubmitButton,
      el("div", { class: "notice", "data-testid": TEST_IDS.supportDrawer }, [runtime.t("student_exam_support_help")]),
      el("div", { class: "notice", "data-testid": TEST_IDS.accessibilityControls }, [runtime.t("student_exam_accessibility_help")]),
      el("div", { class: "notice", "data-testid": TEST_IDS.downloadControls }, [runtime.t("student_exam_offline_help")]),
      el("div", { class: "notice", "data-testid": TEST_IDS.supportControls }, [runtime.t("student_exam_support_controls_help")]),
      el("span", { tabindex: "-1", "data-testid": TEST_IDS.returnFocusTarget }),
    ]),
  ]);
}

function renderStatusBar(): HTMLElement {
  return el("div", { class: "toolbar" }, [
    el("span", { class: "notice", "data-testid": TEST_IDS.autosaveStatus }, [runtime.t(`student_exam_sync_${syncState}`)]),
    el("span", { class: "notice", "data-testid": TEST_IDS.offlineStatus }, [navigator.onLine ? runtime.t("student_exam_online") : runtime.t("student_exam_offline")]),
  ]);
}

function renderPages(pages: StudentExamPage[]): HTMLElement[] {
  return pages.map((page, index) => el("section", { class: "card" }, [
    el("div", { class: "card__body stack" }, [
      el("h2", {}, [`${runtime.t("page")} ${index + 1}`]),
      page.pinned_text ? el("div", { class: "notice" }, [page.pinned_text]) : null,
      ...(page.questions ?? []).map(renderQuestion),
    ]),
  ]));
}

function renderQuestion(question: StudentExamQuestion): HTMLElement {
  return el("article", { class: "stack", "data-testid": TEST_IDS.questionPrompt }, [
    el("h3", {}, [question.content]),
    renderAnswerControl(question),
  ]);
}

function renderAnswerControl(question: StudentExamQuestion): HTMLElement {
  const answer = question.answer;
  const saved = answers[String(question.id)]?.specific_data ?? {};
  const wrapper = el("div", { class: "stack", "data-testid": TEST_IDS.answerArea });
  if (answer.resource_type === "Numeric") {
    const input = el("input", { class: "input", type: "number", step: "any", value: String(saved.value ?? "") }) as HTMLInputElement;
    input.addEventListener("input", () => updateAnswer(question, answer, { value: input.value === "" ? 0 : Number(input.value) }));
    wrapper.append(input);
    return wrapper;
  }
  if (answer.resource_type === "MultipleChoice") {
    const rawOptions = answer.specific_data?.options;
    const options = Array.isArray(rawOptions) ? rawOptions as Array<{ name: string; content: string }> : [];
    const selected = new Set(Array.isArray(saved.chosen_options) ? saved.chosen_options.map(String) : []);
    for (const option of options) {
      const checkbox = el("input", { type: "checkbox", value: option.name, checked: selected.has(option.name) ? true : null }) as HTMLInputElement;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) selected.add(option.name); else selected.delete(option.name);
        updateAnswer(question, answer, { chosen_options: [...selected] });
      });
      wrapper.append(el("label", { class: "checkbox-line" }, [checkbox, ` ${option.content}`]));
    }
    return wrapper;
  }
  const textarea = el("textarea", { class: "textarea", rows: 6, value: String(saved.value ?? "") }) as HTMLTextAreaElement;
  textarea.addEventListener("input", () => updateAnswer(question, answer, { value: textarea.value }));
  wrapper.append(textarea);
  return wrapper;
}

function updateAnswer(question: StudentExamQuestion, answer: StudentExamAnswer, specificData: Record<string, unknown>): void {
  answers[String(question.id)] = {
    id: answer.id,
    resource_type: answer.resource_type,
    specific_data: specificData as StudentExamStateAnswer["specific_data"],
    last_update_datetime: new Date().toISOString(),
  };
  persistAndSync();
}

function currentPayload(): StudentExamStatePayload | null {
  if (!examStatus) return null;
  const now = new Date().toISOString();
  return {
    appointment_id: examStatus.appointment_id,
    student_personal_id: examStatus.student_personal_id,
    last_login_datetime: examStatus.resolution?.started_at ?? now,
    last_update_datetime: now,
    answers,
  };
}

function persistAndSync(): void {
  const payload = currentPayload();
  if (!payload || !examStatus) return;
  syncState = navigator.onLine ? "syncing" : "local";
  saveStudentExamOfflineState({
    appointment_id: examStatus.appointment_id,
    student_personal_id: examStatus.student_personal_id,
    payload,
    saved_at: new Date().toISOString(),
    sync_status: navigator.onLine ? "syncing" : "local_only",
  });
  runtime.render();
  if (!navigator.onLine) return;
  uploadStudentExamState(payload)
    .then(() => {
      syncState = "synced";
      if (examStatus) clearStudentExamOfflineState(examStatus.appointment_id, examStatus.student_personal_id);
      runtime.render();
    })
    .catch(() => {
      syncState = "failed";
      runtime.render();
    });
}

function finalSubmitButton(testId: string): HTMLElement {
  const button = el("button", { class: "button danger", type: "button", "data-testid": testId }, [runtime.t("student_exam_final_submit")]);
  button.addEventListener("click", () => {
    void finalSubmit();
  });
  return button;
}

async function finalSubmit(): Promise<void> {
  const payload = currentPayload();
  if (!payload || !examStatus) return;
  if (!window.confirm(runtime.t("student_exam_submit_confirm"))) return;
  loading = true;
  runtime.render();
  try {
    await submitStudentExam(payload);
    syncState = "submitted";
    clearStudentExamOfflineState(examStatus.appointment_id, examStatus.student_personal_id);
    runtime.notify("success", runtime.t("student_exam_submitted"));
  } catch (err) {
    syncState = "failed";
    runtime.notify("error", publicErrorMessage(err, runtime.t("student_exam_submit_failed")));
  } finally {
    loading = false;
    runtime.render();
  }
}

async function loadCorrection(evaluationResolutionId: number): Promise<void> {
  loading = true;
  correctionError = null;
  runtime.render();
  try {
    correction = await fetchReleasedStudentCorrection(evaluationResolutionId);
  } catch (err) {
    correctionError = publicErrorMessage(err, runtime.t("student_correction_load_failed"));
  } finally {
    loading = false;
    runtime.render();
  }
}

function renderCorrectionShell(): HTMLElement {
  return el("main", { class: "main" }, [
    el("section", { class: "stack", "data-testid": TEST_IDS.correctionView }, [
      el("div", { class: "page-header" }, [
        el("div", {}, [
          el("h1", { class: "page-title" }, [runtime.t("student_correction_title")]),
          correction?.release_note ? el("p", { class: "page-subtitle" }, [correction.release_note]) : null,
        ]),
      ]),
      correctionError ? el("div", { class: "error" }, [correctionError]) : null,
      loading ? el("div", { class: "notice" }, [runtime.t("loading_records")]) : null,
      ...(correction?.questions ?? []).map(renderCorrectionQuestion),
    ]),
  ]);
}

function renderCorrectionQuestion(question: StudentCorrectionQuestion): HTMLElement {
  return el("article", { class: "card", "data-testid": TEST_IDS.correctionQuestion }, [
    el("div", { class: "card__body stack" }, [
      el("h3", {}, [question.question?.content || `#${question.question_resolution_id}`]),
      el("div", { class: "meta-line", "data-testid": TEST_IDS.correctionScoreSource }, [
        `${runtime.t("student_correction_source")}: ${question.scoring_source || "—"}`,
      ]),
      el("div", {}, [`${runtime.t("student_correction_score")}: ${question.effective_score ?? question.auto_score ?? question.manual_score ?? 0}/${question.effective_score_max ?? question.auto_score_max ?? question.manual_score_max ?? "—"}`]),
      el("pre", { class: "cell-json" }, [JSON.stringify(question.submitted_value ?? {}, null, 2)]),
      question.answer_type !== "OpenEnded" ? el("pre", { class: "cell-json", "data-testid": TEST_IDS.correctionCorrectAnswer }, [JSON.stringify(question.correct_answer ?? {}, null, 2)]) : null,
      question.manual_score_reason ? el("div", { class: "notice" }, [question.manual_score_reason]) : null,
      ...(question.annotations ?? []).map((annotation) => el("blockquote", { class: "notice", "data-testid": TEST_IDS.correctionAnnotation }, [
        annotation.anchor_quote ? el("strong", {}, [annotation.anchor_quote]) : null,
        el("div", {}, [annotation.comment]),
      ])),
    ]),
  ]);
}

function field(label: string, input: HTMLElement): HTMLElement {
  return el("div", { class: "field" }, [el("label", {}, [label]), input]);
}
