import { T_ListService } from '@/shared/service';
import data from '@/mta_schools/fake/schoolsList.json'

const schoolsList: T_ListService<I_School> = (endpoint) => {
  return Promise.resolve(data)
}
export {
  schoolsList,
}