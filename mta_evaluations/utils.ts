import { strippedString } from '@/shared/utils'

/**
 * Cleans evaluation's pinned text for sending to API
 * @returns
 */
const cleanPinnedText = (dirty: string | null) => {
  if (dirty === null) return null

  const trimmed = dirty.trim()
  return strippedString(trimmed) === '' ? null : trimmed
}

export { cleanPinnedText }
