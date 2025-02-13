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

type T_GetSchoolsListResponse = I_PaginatedResponse<I_SchoolListItem>
type T_GetCohortsListResponse = I_PaginatedResponse<I_CohortListItem>

export type {
  T_CohortLevelCode as T_CohortLevel,

  I_SchoolListItem,
  I_CohortListItem,

  T_GetSchoolsListResponse,
  T_GetCohortsListResponse,
}