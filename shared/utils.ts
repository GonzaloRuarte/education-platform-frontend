function toCamelCase(str: string): string {
  return str.replace(/[\s-_]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : '')).replace(/^\w/, (match) => match.toLowerCase())
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
}

export { EntityName, intersection, slugify, strippedString, toCamelCase, truncateString }
