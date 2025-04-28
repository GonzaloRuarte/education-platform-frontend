import { useSchoolAllNames } from '@/mta_schools/hooks'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material'
import { schoolLabels } from '@/mta_schools/labels'
import { Body1 } from '@/shared/components/Typography'

// SelectSchool Component
export const SchoolSelect: React.FC<{
  value: string | number | undefined
  onChange: (value: string | number) => void
  label?: string
  error?: boolean
  helperText?: string
}> = ({ value, onChange, label = schoolLabels.chooseSchool, error, helperText }) => {
  const { data: schools, isLoading } = useSchoolAllNames()

  if (isLoading) return <Body1>{schoolLabels.loading}</Body1>

  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value as string | number)}>
        {schools?.map((school) => (
          <MenuItem key={school.id} value={school.id}>
            {school.name}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

// SelectSchoolControlled Component
export const SchoolSelectControlled = <T_FormFields extends FieldValues>({
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
    <SchoolSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      error={hasError}
      helperText={fieldState.error?.message}
    />
  )
}
