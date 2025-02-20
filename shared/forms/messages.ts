import { ValidationRule } from 'react-hook-form'

const formMessages = {
  required: 'Campo requerido'
}


const rules: {
  required: ValidationRule<boolean>
} = {
  required: { value: true, message: formMessages.required }
}


export {
  rules,
  formMessages,
}