// Tables
const PAGE_SIZE_OPTIONS = [10, 25, 100]
const DEFAULT_PAGE_SIZE = 10
/**
 * Returns full api urls
 * @param path REQUIRES leading slash
 * @returns
 */
const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_BASE_PATH}${path}`

enum ErrorCode {
  RESOLUTION_ALREADY_SUBMITTED = 'RESOLUTION_ALREADY_SUBMITTED',
}

export { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, apiUrl, ErrorCode }
