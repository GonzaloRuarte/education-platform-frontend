import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MUI_Select,
  SelectProps as MUI_SelectProps,
} from '@mui/material'

interface I_SelectProps extends Omit<MUI_SelectProps, 'value' | 'onChange'> {
  label: string
  value: string | number | undefined
  onChange: (value: string | number) => void
  options: Array<{ value: string | number; label: string }>
  error?: boolean
  helperText?: string
}

const Select: React.FC<I_SelectProps> = ({ label, value, onChange, options, error, helperText, ...props }) => {
  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <MUI_Select {...props} value={value || ''} onChange={(e) => onChange(e.target.value as string | number)}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MUI_Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default Select
