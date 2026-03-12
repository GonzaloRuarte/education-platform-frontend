'use client'

import { useGroupingAllNames } from '@/mta_schools/hooks'
import { I_GroupingName, T_GroupingId } from '@/mta_schools/types'
import { Body1 } from '@/shared/components/Typography'
import {
  Checkbox,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
} from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'

const normalizeGroupings = (data: unknown): Array<I_GroupingName> => {
  if (Array.isArray(data)) return data as Array<I_GroupingName>
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: Array<I_GroupingName> }).results
  }
  return []
}

export const GroupingSelect: React.FC<{
  value: T_GroupingId | undefined
  onChange: (value: T_GroupingId) => void
  label?: string
  error?: boolean
  helperText?: string
}> = ({ value, onChange, label = 'Agrupamiento', error, helperText }) => {
  const { data, isLoading } = useGroupingAllNames()
  const groupings = normalizeGroupings(data)

  if (isLoading) return <Body1>Cargando agrupamientos...</Body1>

  return (
    <FormControl fullWidth error={error}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        label={label}
        onChange={(e) => onChange(Number(e.target.value) as T_GroupingId)}
      >
        {groupings?.map((grouping) => (
          <MenuItem key={grouping.id} value={grouping.id}>
            {grouping.name}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export const GroupingSelectControlled = <T_FormFields extends FieldValues>({
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
    <GroupingSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      error={hasError}
      helperText={fieldState.error?.message}
    />
  )
}

export const GroupingMultiSelectControlled = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label = 'Agrupamientos',
}: UseControllerProps<T_FormFields> & { label?: string }) => {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const { data, isLoading } = useGroupingAllNames()
  const groupings = normalizeGroupings(data)
  const hasError = fieldState.error !== undefined
  const value: number[] = Array.isArray(field.value) ? (field.value as number[]) : []

  if (isLoading) return <Body1>Cargando agrupamientos...</Body1>

  return (
    <FormControl fullWidth error={hasError}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={value}
        onChange={(event) => field.onChange((event.target.value as number[]).map(Number))}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
          const ids = selected as number[]
          if (ids.length === 0) return 'Ninguno'
          return ids
            .map((id) => groupings?.find((grouping) => grouping.id === id)?.name)
            .filter(Boolean)
            .join(', ')
        }}
      >
        {groupings?.map((grouping) => (
          <MenuItem key={grouping.id} value={grouping.id}>
            <Checkbox checked={value.includes(grouping.id)} />
            <ListItemText primary={grouping.name} />
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{hasError ? fieldState.error?.message : 'Dejar vacío para “ninguno”.'}</FormHelperText>
    </FormControl>
  )
}
