import { apiFetch, apiFetchBlob } from "./api";
import type { JsonValue } from "./types";

export type ReportExportFormat = "json" | "html" | "pdf" | "csv" | "xlsx" | "slides";
export type ReportExportDeliveryMode = "in_app_render" | "download" | "scheduled_delivery";
export type ReportSnapshotStatus = "complete" | "stale" | "incomplete" | "review_pending" | "manual_scoring_pending";
export type ReportExportStatus = "queued" | "generating" | "ready" | "failed" | "revoked" | "superseded";

export type ReportSnapshotDatasetCounter = {
  key: string;
  total: number;
  reportable: number;
  right: number;
  wrong: number;
  accuracy_percent: number | null;
};

export type ReportSnapshotDataset = {
  dataset_status: string;
  definition_key: string;
  definition_schema_version: number;
  scope: Record<string, JsonValue>;
  denominator_policy: Record<string, JsonValue>;
  denominators: Record<string, number | string>;
  metrics: Record<string, JsonValue>;
  dimensions: Record<string, ReportSnapshotDatasetCounter[]>;
  question_resolution_rows: Array<Record<string, JsonValue>>;
  warnings: JsonValue[];
};

export type ReportSnapshotParticipationDenominators = {
  appointment_participation_fact_model?: string;
  appointment_participation_facts?: number;
  reportable_participation_facts?: number;
  removed_before_start_participation_facts?: number;
  absent_participation_facts?: number;
  started_participation_facts?: number;
  finished_participation_facts?: number;
  offline_uploaded_participation_facts?: number;
};

export type ReportSnapshotPayload = Record<string, JsonValue> & {
  dataset?: ReportSnapshotDataset;
};

export type ReportSnapshotComputeInput = {
  definition_key: string;
  organization_id: number;
  institution_id?: number;
  appointment_id?: number;
  evaluation_id?: number;
  student_id?: number;
  permission_profile?: string;
};

export type ReportExportCreateInput = {
  snapshot_id: number;
  export_format: ReportExportFormat;
  delivery_mode?: ReportExportDeliveryMode;
  student_level?: boolean;
  official?: boolean;
  export_reason?: string;
};

export type ReportExportRevokeInput = {
  revoke_reason?: string;
};

export type ReportSnapshotResponse = {
  id: number;
  definition_key: string;
  definition_schema_version?: number;
  organization_id: number;
  institution_id?: number | null;
  scope: Record<string, JsonValue>;
  scope_hash: string;
  source_hash: string;
  status: ReportSnapshotStatus;
  payload: ReportSnapshotPayload;
  warnings?: JsonValue[];
  incomplete_reasons?: JsonValue[];
  stale_reasons?: JsonValue[];
  computed_at?: string | null;
};

export type ReportExportResponse = {
  id: number;
  snapshot_id: number;
  definition_key: string;
  organization_id: number;
  institution_id?: number | null;
  scope_hash: string;
  source_hash: string;
  export_format: ReportExportFormat;
  delivery_mode: ReportExportDeliveryMode;
  status: ReportExportStatus;
  audit_required: boolean;
  audit_event_id?: number | null;
  checksum_sha256: string;
  storage_path: string;
  content_type: string;
  file_generation_status: string;
  file_size_bytes?: number | null;
  download_url?: string;
  blockers?: string[];
};

export function reportSnapshotDataset(snapshot: Pick<ReportSnapshotResponse, "payload">): ReportSnapshotDataset | undefined {
  return snapshot.payload.dataset;
}

export function reportExportDownloadPath(exportId: number): string {
  return `/api/reports/exports/${exportId}/download/`;
}

export function reportExportRevokePath(exportId: number): string {
  return `/api/reports/exports/${exportId}/revoke/`;
}

export async function computeReportSnapshot(input: ReportSnapshotComputeInput): Promise<ReportSnapshotResponse> {
  return apiFetch<ReportSnapshotResponse>("/api/reports/snapshots/compute/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createReportExport(input: ReportExportCreateInput): Promise<ReportExportResponse> {
  return apiFetch<ReportExportResponse>("/api/reports/exports/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function downloadReportExport(exportId: number): Promise<Blob> {
  return apiFetchBlob(reportExportDownloadPath(exportId));
}

export async function revokeReportExport(exportId: number, input: ReportExportRevokeInput = {}): Promise<ReportExportResponse> {
  return apiFetch<ReportExportResponse>(reportExportRevokePath(exportId), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function triggerReportExportDownload(exportResponse: Pick<ReportExportResponse, "id" | "definition_key" | "export_format">): Promise<void> {
  const blob = await downloadReportExport(exportResponse.id);
  const extension = exportResponse.export_format === "slides" ? "pptx" : exportResponse.export_format;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `report-${exportResponse.definition_key}-export-${exportResponse.id}.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function reportSnapshotParticipationDenominators(
  snapshot: Pick<ReportSnapshotResponse, "payload">
): ReportSnapshotParticipationDenominators {
  const denominators = snapshot.payload.dataset?.denominators ?? {};
  return {
    appointment_participation_fact_model: String(denominators.appointment_participation_fact_model ?? ""),
    appointment_participation_facts: Number(denominators.appointment_participation_facts ?? 0),
    reportable_participation_facts: Number(denominators.reportable_participation_facts ?? 0),
    removed_before_start_participation_facts: Number(denominators.removed_before_start_participation_facts ?? 0),
    absent_participation_facts: Number(denominators.absent_participation_facts ?? 0),
    started_participation_facts: Number(denominators.started_participation_facts ?? 0),
    finished_participation_facts: Number(denominators.finished_participation_facts ?? 0),
    offline_uploaded_participation_facts: Number(denominators.offline_uploaded_participation_facts ?? 0),
  };
}
