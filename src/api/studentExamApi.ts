import { apiFetch, withQueryParams } from "./api.js";
import type { JsonValue, TokenPair } from "../core/types.js";

export type StudentExamAuthorizeInput = {
  personal_id: string;
};

export type StudentExamAuthorizeResponse = TokenPair;

export type StudentExamAnswerType = "Numeric" | "MultipleChoice" | "OpenEnded";

export type StudentExamOption = {
  id: number;
  name: string;
  content: string;
};

export type StudentExamAnswer = {
  id: number;
  resource_type: StudentExamAnswerType;
  specific_data?: Record<string, JsonValue> | null;
};

export type StudentExamQuestion = {
  id: number;
  order: number;
  content: string;
  section_title?: string | null;
  answer: StudentExamAnswer;
};

export type StudentExamEvaluation = {
  id: number;
  code?: string;
  title?: string;
  header?: string;
  subject?: string;
  pages: StudentExamPage[];
  pages_quantity: number;
};

export type StudentExamLastUploadedState = {
  answers?: Record<string, StudentExamStateAnswer>;
};

export type StudentExamResolutionMeta = {
  last_uploaded_state?: StudentExamLastUploadedState | null;
  started_at?: string;
  submit_by_time?: string;
  server_now?: string;
  max_duration_minutes?: number;
};

export type StudentExamPage = {
  pinned_text?: string | null;
  questions: StudentExamQuestion[];
};

export type StudentExamResolutionStatus = {
  appointment_id: number;
  student_personal_id: string;
  evaluation?: StudentExamEvaluation;
  resolution?: StudentExamResolutionMeta;
  last_uploaded_state?: StudentExamLastUploadedState | null;
  submit_by_time?: string;
  remaining_time_visible?: false;
  offline_continue_required?: true;
  finished_at?: string | null;
  pages?: StudentExamPage[];
  pages_quantity?: number;
  [key: string]: JsonValue | StudentExamPage[] | StudentExamEvaluation | StudentExamResolutionMeta | StudentExamLastUploadedState | null | undefined;
};

export type StudentExamStateAnswer = {
  id: number;
  resource_type: StudentExamAnswerType;
  last_update_datetime?: string;
  specific_data: Record<string, JsonValue>;
};

export type StudentExamStatePayload = {
  appointment_id: number;
  student_personal_id: string;
  last_login_datetime?: string;
  last_update_datetime: string;
  answers: Record<string, StudentExamStateAnswer>;
};

export type StudentCorrectionAnnotation = {
  id?: number;
  anchor_start: number;
  anchor_end: number;
  anchor_quote?: string;
  comment: string;
  created_by?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ObjectiveAcceptedAnswerScore = {
  id?: number | null;
  numeric_value?: number | null;
  choice_value?: string[];
  score: number;
  label?: string;
  order?: number;
};

export type ObjectiveCorrectAnswerPayload = {
  value?: number;
  chosen_options?: string[];
  max_score?: number;
  accepted_answers?: ObjectiveAcceptedAnswerScore[];
  options?: Array<{ name: string; content: string; is_true: boolean }>;
};

export type StudentCorrectionQuestion = {
  question_resolution_id: number;
  answer_type: StudentExamAnswerType | string;
  is_right: boolean;
  auto_score?: number | null;
  auto_score_max?: number | null;
  manual_score?: number | null;
  manual_score_max?: number | null;
  manual_score_reason?: string;
  scoring_source?: "automatic" | "manual" | string;
  effective_score?: number | null;
  effective_score_max?: number | null;
  correct_answer?: ObjectiveCorrectAnswerPayload | Record<string, JsonValue> | null;
  question?: { id?: number; content?: string };
  submitted_value?: Record<string, JsonValue>;
  annotations?: StudentCorrectionAnnotation[];
};

export type StudentCorrectionResponse = {
  evaluation_resolution_id: number;
  released_at: string;
  release_note?: string;
  questions: StudentCorrectionQuestion[];
};

export function studentExamAuthorizePath(): string {
  return "/api/resolutions/authorize/";
}

export function studentExamResumePath(): string {
  return "/api/resolutions/resume/";
}

export function studentExamUploadStatePath(): string {
  return "/api/resolutions/upload-state/";
}

export function studentExamSubmitPath(): string {
  return "/api/resolutions/submit/";
}

export function studentCorrectionPath(evaluationResolutionId: number): string {
  return withQueryParams("/api/resolutions/student-correction/", {
    evaluation_resolution_id: String(evaluationResolutionId),
  });
}

export async function authorizeStudentExam(input: StudentExamAuthorizeInput): Promise<StudentExamAuthorizeResponse> {
  return apiFetch<StudentExamAuthorizeResponse>(studentExamAuthorizePath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resumeStudentExam(): Promise<StudentExamResolutionStatus> {
  return apiFetch<StudentExamResolutionStatus>(studentExamResumePath(), { method: "POST" });
}

export async function uploadStudentExamState(input: StudentExamStatePayload): Promise<Record<string, JsonValue>> {
  return apiFetch<Record<string, JsonValue>>(studentExamUploadStatePath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function submitStudentExam(input: StudentExamStatePayload): Promise<null> {
  return apiFetch<null>(studentExamSubmitPath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchReleasedStudentCorrection(evaluationResolutionId: number): Promise<StudentCorrectionResponse> {
  return apiFetch<StudentCorrectionResponse>(studentCorrectionPath(evaluationResolutionId));
}


export type StudentExamOfflineState = {
  appointment_id: number;
  student_personal_id: string;
  payload: StudentExamStatePayload;
  saved_at: string;
  sync_status: "local_only" | "syncing" | "synced" | "sync_failed";
};

export function studentExamOfflineStateKey(appointmentId: number, personalId: string): string {
  return `retrobolt.student-exam.offline.${appointmentId}.${personalId}`;
}

export function saveStudentExamOfflineState(state: StudentExamOfflineState, storage: Storage = window.localStorage): void {
  storage.setItem(studentExamOfflineStateKey(state.appointment_id, state.student_personal_id), JSON.stringify(state));
}

export function loadStudentExamOfflineState(
  appointmentId: number,
  personalId: string,
  storage: Storage = window.localStorage,
): StudentExamOfflineState | null {
  const raw = storage.getItem(studentExamOfflineStateKey(appointmentId, personalId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudentExamOfflineState;
  } catch {
    return null;
  }
}

export function clearStudentExamOfflineState(
  appointmentId: number,
  personalId: string,
  storage: Storage = window.localStorage,
): void {
  storage.removeItem(studentExamOfflineStateKey(appointmentId, personalId));
}
