import axios from 'axios';

interface I_FetchParams {
  page: number;
  pageSize: number;
  filters?: Record<string, any>;
}
type T_ListService<T_EntityItem> = (endpoint: string, params?: I_FetchParams) => Promise<Array<T_EntityItem>>
const listService = async <T_EntityItem>(endpoint, params) => {
  try {
    const response = await axios.get<Array<T_EntityItem>>(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
export {
  listService
}
export type {
  T_ListService,
}