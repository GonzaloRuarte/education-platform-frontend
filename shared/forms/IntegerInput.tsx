import { TextFieldProps } from '@mui/material/TextField'
import React from 'react'
import Input from './Input'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

const IntegerInput: React.FC<TextFieldProps> = (props) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const charCode = event.key
    // Allow only numbers, backspace, and navigation keys
    if (!/^[0-9]$/.test(charCode) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'].includes(charCode)) {
      event.preventDefault()
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    // Prevent non-numeric values
    if (/^\d*$/.test(value)) {
      props.onChange?.(event)
    }
  }

  return <Input {...props} onKeyDown={handleKeyPress} onChange={handleChange} />
}

interface I_IntegerInputControlledProps<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields> {
  label?: string
  helperText?: string
}

export const IntegerInputControlled = <T_FormFields extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  label,
  helperText,
}: I_IntegerInputControlledProps<T_FormFields>) => {
  const { field, fieldState } = useController({
    name,
    control,
    rules,
    defaultValue,
    shouldUnregister,
  })

  const hasError = !!fieldState.error

  return (
    <IntegerInput
      {...field}
      label={label}
      error={hasError}
      helperText={hasError ? fieldState.error?.message : helperText}
    />
  )
}

export default IntegerInput
