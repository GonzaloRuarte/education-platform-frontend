import { T_GetCohortsListResponse, T_GetEvaluationGroupListResponse, T_GetSchoolsListResponse, T_GetStudentProfileListResponse } from '@/mta_schools/types';
import { axiosGet } from '@/shared/data/fetchers';
import { listService } from '@/shared/service';


const schoolsList = listService<T_GetSchoolsListResponse>('http://127.0.0.1:8000/api/schools', axiosGet)()
const cohortsList = listService<T_GetCohortsListResponse>('http://127.0.0.1:8000/api/cohorts', axiosGet)()
const studentProfileList = listService<T_GetStudentProfileListResponse>('http://127.0.0.1:8000/api/student-profile', axiosGet)()
const evaluationGroupList = listService<T_GetEvaluationGroupListResponse>('http://127.0.0.1:8000/api/evaluation-group', axiosGet)()


export {
  cohortsList, schoolsList, studentProfileList, evaluationGroupList
};

