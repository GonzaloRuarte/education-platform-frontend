import { I_PaginatedResponse } from '@/shared/data/types';

type T_CohortLevelCode = "P" | "S"

interface I_SchoolListItem {
  name: string;
  district: string;
  school_staff: Array<{
    user_id: number;
    name: string;
  }>;
  contact_email: string;
}

interface I_CohortListItem {
  id: number
  name: string
  school: {
    id: number
    name: string
  }
  level: string
  grade: string
}

interface I_StudentProfileListItem {
  id: number
  cohort: {
    id: number
    name: string
  }
  created_at: string
  updated_at: string
  school: string
  personal_id: number
}

type T_GetSchoolsListResponse = I_PaginatedResponse<I_SchoolListItem>
type T_GetCohortsListResponse = I_PaginatedResponse<I_CohortListItem>
type T_GetStudentProfileListResponse = I_PaginatedResponse<I_StudentProfileListItem>

export type {
  T_CohortLevelCode,

  I_SchoolListItem,
  I_CohortListItem,
  I_StudentProfileListItem,

  T_GetSchoolsListResponse,
  T_GetCohortsListResponse,
  T_GetStudentProfileListResponse,
}