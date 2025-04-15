import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

// Generate all uppercase English letters
const alphabetOptions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

// LetterSelect Component
export const LetterSelect: React.FC<{
  value: string | undefined
  onChange: (value: string) => void
  label?: string
  error?: boolean
  helperText?: string
}> = ({ value, onChange, label = 'Seleccionar letra...', error, helperText }) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
        {alphabetOptions.map((letter) => (
          <MenuItem key={letter} value={letter}>
            {letter}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

// LetterSelectControlled Component
export const LetterSelectControlled = <T_FormFields extends FieldValues>({
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
    <LetterSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      error={hasError}
      helperText={fieldState.error?.message}
    />
  )
}
