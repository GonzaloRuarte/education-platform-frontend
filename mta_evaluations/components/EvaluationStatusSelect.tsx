import { useUserProfilesResources } from '@/mta_auth/hooks'
import { evaluationStatusCodeToLabels } from '@/mta_evaluations/labels'
import { EvaluationStatus } from '@/mta_evaluations/types'
import Spinner from '@/shared/components/Spinner'
import { Body1 } from '@/shared/components/Typography'
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectProps } from '@mui/material'
import React from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

export const EvaluationStatusSelect: React.FC<{
  value: string | undefined
  onChange: (value: string) => void
  label?: string
  error?: boolean
  helperText?: string
  size?: SelectProps['size']
}> = ({ value, onChange, label = 'Seleccionar estado', error, helperText, size }) => {
  const { isEvaluator } = useUserProfilesResources()
  if (isEvaluator === undefined) return <Spinner />
  if (isEvaluator) return <></>

  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)} fullWidth size={size}>
        {Object.entries(EvaluationStatus).map(([key, status]) => (
          <MenuItem key={key} value={status}>
            {evaluationStatusCodeToLabels(status)}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export const EvaluationStatusControlled = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
}: UseControllerProps<T_FormFields> & { label?: string }) => {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <EvaluationStatusSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      error={hasError}
      helperText={fieldState.error?.message}
    />
  )
}
