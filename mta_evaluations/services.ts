import { T_GetSchoolsListResponse } from '@/mta_schools/types';
import { axiosGet } from '@/shared/data/fetchers';
import { listService } from '@/shared/service';


const evaluationList = listService<T_GetSchoolsListResponse>('http://127.0.0.1:8000/api/evaluations', axiosGet)()


export {
  evaluationList
};

