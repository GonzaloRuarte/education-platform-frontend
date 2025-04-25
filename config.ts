// Tables
type T_PageSizeOptions = 10 | 25 | 50 | 100
const PAGE_SIZE_OPTIONS: Array<T_PageSizeOptions> = [10, 25, 50, 100]
const DEFAULT_PAGE_SIZE: T_PageSizeOptions = 10
/**
 * Returns full api urls
 * @param path REQUIRES leading slash
 * @returns
 */
const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_BASE_PATH}${path}`

enum ErrorCode {
  RESOLUTION_ALREADY_SUBMITTED = 'RESOLUTION_ALREADY_SUBMITTED',
  SCHOOL_RESTRICTED_DATA = 'SCHOOL_RESTRICTED_DATA',
}

const LIGHT_BG_COLOR = '#C3D9FF'
const MAIN_BG_COLOR = '#f1f1f1'

export { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, apiUrl, ErrorCode, LIGHT_BG_COLOR, MAIN_BG_COLOR }
