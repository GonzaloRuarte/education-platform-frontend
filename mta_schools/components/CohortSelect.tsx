import React, { ReactNode, useState } from 'react'
import { useCohortsDistinctBySchool } from '@/mta_schools/hooks'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { Autocomplete, TextField, FormHelperText } from '@mui/material'
import { Body1 } from '@/shared/components/Typography'

interface ICohortSelectProps {
  value: string | undefined
  onChange: (value: string) => void
  schoolId: number
  label?: string
  error?: boolean
  helperText?: ReactNode
}

// CohortSelect Component
export const CohortSelect: React.FC<ICohortSelectProps> = ({
  value,
  onChange,
  schoolId,
  label = 'Seleccione o escriba una división',
  error,
  helperText,
}) => {
  const { data: cohorts, isLoading } = useCohortsDistinctBySchool(schoolId ? { schoolId } : undefined)

  if (!schoolId) return <Body1>Seleccione una escuela para cargar las divisiones</Body1>
  if (isLoading) return <Body1>Cargando divisiones...</Body1>

  return (
    <div>
      <Autocomplete
        freeSolo
        options={cohorts?.cohorts || []}
        value={value || ''}
        onChange={(_, newValue) => onChange(newValue || '')}
        inputValue={value}
        onInputChange={(_, newInputValue) => onChange(newInputValue)}
        renderInput={(params) => (
          <TextField {...params} label={label} error={error} helperText={helperText} variant="outlined" fullWidth />
        )}
      />
      {/* {error && <FormHelperText error>{helperText}</FormHelperText>} */}
    </div>
  )
}

// CohortSelectControlled Component
export const CohortSelectControlled = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  schoolId,
  label,
  helperText,
}: UseControllerProps<T_FormFields> & { schoolId: number; label?: string; helperText?: ReactNode }) => {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <CohortSelect
      value={field.value}
      onChange={field.onChange}
      schoolId={schoolId}
      label={label}
      error={hasError}
      helperText={
        <>
          {helperText ? helperText : ''}
          {helperText && hasError && <br />}
          {hasError && fieldState.error?.message}
        </>
      }
    />
  )
}
