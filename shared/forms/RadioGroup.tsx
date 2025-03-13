import React from 'react'
import {
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  FormControl,
  FormLabel,
  RadioGroupProps as MuiRadioGroupProps,
} from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

type T_OmittedFields = 'value' | 'helperText' | 'error' | 'onChange' | 'onBlur' | 'name' | 'ref' | 'defaultValue'

interface I_Option {
  label: string
  value: string | number
}

interface I_Props<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields>, Omit<MuiRadioGroupProps, T_OmittedFields> {
  options: I_Option[]
  label: string
}

export default function RadioGroup<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  options,
  label,
  ...props
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <FormControl component="fieldset" error={hasError}>
      <FormLabel component="legend">{label}</FormLabel>
      <MuiRadioGroup {...field} {...props}>
        {options.map((option) => (
          <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} />
        ))}
      </MuiRadioGroup>
      {hasError && <FormHelperText>{fieldState.error?.message}</FormHelperText>}
    </FormControl>
  )
}
