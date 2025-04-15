import Select from '@/shared/forms/Select'
import React from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

interface I_SelectControlledProps<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields> {
  label: string
  options: Array<{ value: string | number; label: string }>
}

export default function SelectControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  options,
}: I_SelectControlledProps<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <Select
      label={label}
      value={field.value}
      onChange={field.onChange}
      options={options}
      error={hasError}
      helperText={fieldState.error?.message}
    />
  )
}
