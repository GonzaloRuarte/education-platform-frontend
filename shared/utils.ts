function toCamelCase(str: string): string {
  return str
    .replace(/[\s-_]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^\w/, (match) => match.toLowerCase())
}

const intersection = <T>(array1: Array<T>, array2: Array<T>) =>
  array1.filter((value) => array2.includes(value))

export { toCamelCase, intersection }
