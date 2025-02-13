import { T_GetCohortsListResponse, T_GetSchoolsListResponse } from '@/mta_schools/types';
import { axiosGet } from '@/shared/data/fetchers';
import { listService } from '@/shared/service';


const schoolsList = listService<T_GetSchoolsListResponse>('http://127.0.0.1:8000/api/schools', axiosGet)()
const cohortsList = listService<T_GetCohortsListResponse>('http://127.0.0.1:8000/api/cohorts', axiosGet)()


export {
  cohortsList, schoolsList
};

