const formMessages = {
  required: 'Campo requerido',
  minLength: (min: number) => `La cantidad de caracteres debe ser mayor o igual a ${min}`,
  maxLength: (max: number) => `La cantidad de caracteres debe ser menor o igual a ${max}`,
  pattern: (patternDescription: string) => patternDescription,
}

const rules = {
  required: () => ({ required: { value: true, message: formMessages.required } }),
  pattern: (pattern: RegExp, patternDescription: string) => ({
    pattern: { value: pattern, message: formMessages.pattern(patternDescription) },
  }),
  minLength: (min: number) => ({ minLength: { value: min, message: formMessages.minLength(min) } }),
  maxLength: (max: number) => ({ maxLength: { value: max, message: formMessages.maxLength(max) } }),
}

export { formMessages, rules }
