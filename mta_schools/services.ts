import { axiosGet } from '@/shared/data/fetchers';
import { listService } from '@/shared/service';


interface I_PaginatedResponse<T_ResultsInstance> {
  count: number
  next: string
  previous: string
  results: Array<T_ResultsInstance>
}

type T_GetSchoolsListResponse = I_PaginatedResponse<I_School>

const schoolsList = listService<T_GetSchoolsListResponse>('http://127.0.0.1:8000/api/schools', axiosGet)()


export {
  schoolsList
};

export type {
  T_GetSchoolsListResponse
};
