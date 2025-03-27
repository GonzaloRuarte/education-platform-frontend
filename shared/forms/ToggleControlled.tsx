import React from 'react'
import { Switch, FormControlLabel, FormGroup } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_ToggleProps<T_FormFields extends FieldValues>
  extends UseControllerProps<T_FormFields>,
    Omit<React.ComponentProps<typeof Switch>, T_OmittedFields> {
  label: string
}

export default function ToggleControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  ...props
}: I_ToggleProps<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <FormGroup>
      <FormControlLabel control={<Switch {...field} {...props} checked={!!field.value} />} label={label} />
      {hasError && <p style={{ color: 'red' }}>{fieldState.error?.message}</p>}
    </FormGroup>
  )
}
