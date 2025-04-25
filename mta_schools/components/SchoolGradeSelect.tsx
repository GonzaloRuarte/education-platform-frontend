import { SchoolGrade } from '@/mta_schools/constants'
import { gradeLabel, schoolLabels } from '@/mta_schools/labels'
import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material'
import React from 'react'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

// SchoolGradeSelect Component
export const SchoolGradeSelect: React.FC<{
  value: string | undefined
  onChange: (value: string) => void
  label?: string
  error?: boolean
  helperText?: string
}> = ({ value, onChange, label = schoolLabels.chooseGrade, error, helperText }) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {Object.entries(SchoolGrade).map(([key, grade]) => (
          <MenuItem key={key} value={grade}>
            {gradeLabel(grade)}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

// SchoolGradeSelectControlled Component
export const SchoolGradeSelectControlled = <T_FormFields extends FieldValues>({
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
    <SchoolGradeSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      error={hasError}
      helperText={fieldState.error?.message}
    />
  )
}
