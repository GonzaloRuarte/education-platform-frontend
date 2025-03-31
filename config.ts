// Tables
const PAGE_SIZE_OPTIONS = [10, 25, 100]
const DEFAULT_PAGE_SIZE = 10
console.log('process.env.NEXT_PUBLIC_API_BASE_PATH', process.env.NEXT_PUBLIC_API_BASE_PATH)
/**
 * Returns full api urls
 * @param path REQUIRES leading slash
 * @returns
 */
const apiUrl = (path: string) => `${process.env.NEXT_PUBLIC_API_BASE_PATH}${path}`

export { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, apiUrl }
