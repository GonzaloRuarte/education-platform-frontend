import type { JsonValue } from "./types";

export type ManualScoringAnnotationDraft = {
  anchor_start: number;
  anchor_end: number;
  anchor_quote?: string;
  comment: string;
};

export type ManualScoringCorrectionDraft = {
  question_resolution_id: number;
  manual_score: number | null;
  manual_score_max?: number | null;
  manual_score_reason?: string;
  annotations: ManualScoringAnnotationDraft[];
  updated_at: string;
  extra?: Record<string, JsonValue>;
};

export function manualScoringDraftStorageKey(questionResolutionId: number): string {
  return `retrobolt.manual-scoring.draft.${questionResolutionId}`;
}

export function saveManualScoringDraft(draft: ManualScoringCorrectionDraft, storage: Storage = window.localStorage): void {
  storage.setItem(manualScoringDraftStorageKey(draft.question_resolution_id), JSON.stringify(draft));
}

export function loadManualScoringDraft(
  questionResolutionId: number,
  storage: Storage = window.localStorage,
): ManualScoringCorrectionDraft | null {
  const raw = storage.getItem(manualScoringDraftStorageKey(questionResolutionId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ManualScoringCorrectionDraft;
  } catch {
    return null;
  }
}

export function clearManualScoringDraft(questionResolutionId: number, storage: Storage = window.localStorage): void {
  storage.removeItem(manualScoringDraftStorageKey(questionResolutionId));
}
