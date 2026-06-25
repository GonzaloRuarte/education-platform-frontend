import { apiFetch } from "./api";
import type { JsonValue } from "./types";

export type AppointmentTargetSubjectOffering = {
  id: number;
  division_id: number;
  division_name: string;
  subject_id: string | number;
  subject_name: string;
};

export type AppointmentDetailResponse = {
  id: number;
  begins_at: string;
  ends_at: string;
  cancelled_at?: string | null;
  cancellation_reason?: string;
  finalized_at?: string | null;
  rescheduled_at?: string | null;
  reschedule_reason?: string;
  enrollment_period?: number | null;
  subject_offerings: AppointmentTargetSubjectOffering[];
  evaluation_origin?: number | null;
  students?: Array<Record<string, JsonValue>>;
  evaluation_content_revalidation_required?: boolean;
  evaluation_content_hash_at_schedule?: string;
  evaluation_content_hash_checked_at?: string | null;
  evaluation_content_hash_mismatch_at?: string | null;
};

export type AppointmentDirectScheduleInput = {
  evaluation_id: number;
  begins_at: string;
  ends_at: string;
  enrollment_period_id?: number | null;
  subject_offering_ids?: number[];
  student_profile_ids?: number[];
};

export type AppointmentSetStudentsInput = {
  appointment_id: number;
  student_profile_ids: number[];
};

export type AppointmentCancelInput = {
  appointment_id: number;
  reason?: string;
};

export type AppointmentRescheduleInput = {
  appointment_id: number;
  begins_at: string;
  ends_at: string;
  reason?: string;
};

export function appointmentSchedulePath(): string {
  return "/api/appointments/schedule/";
}

export function appointmentSetStudentsPath(): string {
  return "/api/appointments/set-students/";
}

export function appointmentCancelPath(): string {
  return "/api/appointments/cancel/";
}

export function appointmentReschedulePath(): string {
  return "/api/appointments/reschedule/";
}

export function appointmentAdminInstitutionDashboardPath(): string {
  return "/api/appointments/admin-institution-dashboard/";
}

export async function scheduleAppointmentDirect(input: AppointmentDirectScheduleInput): Promise<AppointmentDetailResponse> {
  return apiFetch<AppointmentDetailResponse>(appointmentSchedulePath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function setAppointmentStudents(input: AppointmentSetStudentsInput): Promise<AppointmentDetailResponse> {
  return apiFetch<AppointmentDetailResponse>(appointmentSetStudentsPath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function cancelAppointment(input: AppointmentCancelInput): Promise<AppointmentDetailResponse> {
  return apiFetch<AppointmentDetailResponse>(appointmentCancelPath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function rescheduleAppointment(input: AppointmentRescheduleInput): Promise<AppointmentDetailResponse> {
  return apiFetch<AppointmentDetailResponse>(appointmentReschedulePath(), {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchAppointmentAdminInstitutionDashboard(): Promise<Array<Record<string, JsonValue>>> {
  return apiFetch<Array<Record<string, JsonValue>>>(appointmentAdminInstitutionDashboardPath());
}
