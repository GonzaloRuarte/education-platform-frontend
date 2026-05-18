'use client'

import { Box, Button, ButtonGroup, FormHelperText } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

interface I_Props<T_FormFields extends FieldValues> extends UseControllerProps<T_FormFields> {
  options: Array<{ value: string | number; label: string }>
  orientation?: 'horizontal' | 'vertical'
}

export default function OptionToggleControlled<T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  options,
  orientation,
}: I_Props<T_FormFields>) {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  const handleChange = (value: string | number) => {
    field.onChange(value)
  }

  return (
    <Box>
      <ButtonGroup orientation={orientation} sx={{ display: 'flex', gap: 2 }}>
        {options.map((option) => {
          return (
            <Button
              key={option.value}
              variant={field.value === option.value ? 'contained' : 'outlined'}
              onClick={() => handleChange(option.value)}
            >
              {option.label}
            </Button>
          )
        })}
      </ButtonGroup>
      {hasError && <FormHelperText error>{fieldState.error?.message}</FormHelperText>}
    </Box>
  )
}
