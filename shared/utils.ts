function toCamelCase(str: string): string {
  return str
    .replace(/[\s-_]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^\w/, (match) => match.toLowerCase());
}

export {
  toCamelCase,
}