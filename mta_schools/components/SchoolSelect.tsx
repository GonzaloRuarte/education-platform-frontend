import { useSchoolAllNames } from '@/mta_schools/hooks'
import { T_SchoolNames } from '@/mta_schools/types'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select, FormHelperText } from '@mui/material'
import { schoolLabels } from '@/mta_schools/labels'
import { Body1 } from '@/shared/components/Typography'

export const SchoolSelect: React.FC<{
  value: string | number | undefined
  onChange: (value: string | number) => void
  label?: string
  error?: boolean
  helperText?: string
  options?: T_SchoolNames
  disabled?: boolean
}> = ({ value, onChange, label = schoolLabels.chooseSchool, error, helperText, options, disabled = false }) => {
  const { data: fetchedSchools, isLoading } = useSchoolAllNames()
  const schools = options ?? fetchedSchools

  if (schools === undefined && isLoading) return <Body1>{schoolLabels.loading}</Body1>

  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value as string | number)} label={label} disabled={disabled}>
        {(schools ?? []).map((school) => (
          <MenuItem key={school.id} value={school.id}>
            {school.name}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export const SchoolSelectControlled = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  options,
  disabled,
}: UseControllerProps<T_FormFields> & { label?: string; options?: T_SchoolNames; disabled?: boolean }) => {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <SchoolSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      error={hasError}
      helperText={fieldState.error?.message}
      options={options}
      disabled={disabled}
    />
  )
}
