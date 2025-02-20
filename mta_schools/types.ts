import { I_PaginatedResponse } from '@/shared/data/types';


interface I_SchoolListItem {
  name: string;
  district: string;
  school_staff: Array<{
    user_id: number;
    name: string;
  }>;
  contact_email: string;
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

type T_GetStudentProfileListResponse = I_PaginatedResponse<I_StudentProfileListItem>


export type {
  I_SchoolListItem,

  I_StudentProfileListItem,

  T_GetSchoolsListResponse,

  T_GetStudentProfileListResponse,

}