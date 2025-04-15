function toCamelCase(str: string): string {
  return str
    .replace(/[\s-_]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^\w/, (match) => match.toLowerCase())
}

/**
 * Generates a random integer between min and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random integer between min and max.
 */
const randomInt = (min: number, max: number): number => {
  if (min > max) throw new Error('min should be less than or equal to max')
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Truncates a string to the first N characters and append '(...)' if the string is longer than N.
 */
const truncateWithEllipsis = (str: string, maxLength: number = 200): string => {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength) + ' (...)'
}

/**
 * Slugifies the input string
 */
const slugify = (text: string) => {
  return text
    .toString() // Cast to string (optional)
    .normalize('NFKD') // The "normalize()" using "NFKD" method returns the Unicode Normalization Form of a given string.
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
}

/**
 * Strips a string of HTML tags
 */
const strippedString = (str: string) => str.replace(/(<([^>]+)>)/gi, '')

const intersection = <T>(array1: Array<T>, array2: Array<T>) => array1.filter((value) => array2.includes(value))

const secondsToMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(remainingSeconds).padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
}
const secondsToHHMMSS = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const paddedHours = String(hours).padStart(2, '0')
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
}

/**
 * Truncate a string to the first N characters and append '...' if the string is longer than N.
 * @param str - The string to truncate.
 * @param maxLength - The maximum number of characters to show.
 * @returns The truncated string with '...' appended if it exceeds the maximum length.
 */
const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength) + '...'
}
/**
 * Converts a string to sentence case and ensures it ends with a period.
 * @param str - The input string.
 * @returns The string with the first letter capitalized and ending with a period.
 */
const sentence = (str: string): string => {
  if (!str) return ''
  const trimmedStr = str.trim()
  const capitalized = trimmedStr.charAt(0).toUpperCase() + trimmedStr.slice(1)
  return capitalized.endsWith('.') ? capitalized : `${capitalized}.`
}

type T_Gender = 'M' | 'F' | 'X'
class EntityName {
  readonly singular: string
  readonly plural: string
  readonly gender: T_Gender

  constructor(args: { singular: string; plural: string; gender: T_Gender }) {
    this.singular = args.singular
    this.plural = args.plural
    this.gender = args.gender
  }

  public genderedString(args: { m: string; f: string }) {
    return this.gender === 'F' ? args.f : args.m
  }

  /**
   * Shortcut for genderedString
   */
  public gs(args: { m: string; f: string }) {
    return this.genderedString(args)
  }
}

class ImageSize {
  private scale = 1
  constructor(
    private originalWidth: number,
    private originalHeight: number,
    options?: {
      scale?: number
    },
  ) {
    if (options?.scale !== undefined) this.scale = options.scale
  }

  public get w() {
    return this.originalWidth * this.scale
  }
  public get h() {
    return this.originalHeight * this.scale
  }

  public width(_scale?: number) {
    const s = _scale || this.scale
    return this.originalWidth * s
  }
  public height(_scale?: number) {
    const s = _scale || this.scale
    return this.originalHeight * s
  }
}

export {
  EntityName,
  ImageSize,
  intersection,
  slugify,
  strippedString,
  toCamelCase,
  truncateString,
  secondsToMMSS,
  truncateWithEllipsis,
  sentence,
  randomInt,
  secondsToHHMMSS,
}
