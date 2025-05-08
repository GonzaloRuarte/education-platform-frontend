import React, { useEffect, useState } from 'react'
import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { FieldValues, useController, UseControllerProps } from 'react-hook-form'
import { useEvaluationList } from '@/mta_evaluations/hooks'
import { EvaluationStatus } from '@/mta_evaluations/types'

interface I_EvaluationOption {
  id: string
  title: string
}

// EvaluationSelect Component
export const EvaluationSelect: React.FC<{
  value: I_EvaluationOption | null
  onChange: (value: I_EvaluationOption | null) => void
  label?: string
  placeholder?: string
  error?: boolean
  helperText?: string
  filterTitle?: string // Optional filter for evaluations
  onlyPublished?: boolean // Optional filter for published evaluations
}> = ({
  value,
  onChange,
  label = 'Evaluación',
  placeholder = 'Seleccionar evaluación',
  error,
  helperText,
  filterTitle,
  onlyPublished = false, // Default to false
}) => {
  const [options, setOptions] = useState<I_EvaluationOption[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<object | undefined>({ status: EvaluationStatus.Published })

  useEffect(() => {
    setFilters({
      ...(onlyPublished && { status: EvaluationStatus.Published }),
      ...(filterTitle && { title__contains: filterTitle }),
    })
  }, [filterTitle, onlyPublished])

  const { data, isLoading, reload } = useEvaluationList({
    page_size: 0,
    filters: filters,
  })

  useEffect(() => {
    if (data) {
      setOptions(
        data.results.map((evaluation) => ({
          id: String(evaluation.id),
          title: `${evaluation.title} (${evaluation.code})`,
        })),
      )
    }
    setLoading(isLoading)
  }, [data, isLoading])

  useEffect(reload, [filters])

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.title}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  )
}

// EvaluationSelectControlled Component
export const EvaluationSelectControlled = <T_FormFields extends FieldValues>({
  name,
  rules,
  shouldUnregister,
  defaultValue,
  control,
  label,
  placeholder,
  filterTitle,
  onlyPublished = false,
}: UseControllerProps<T_FormFields> & {
  label?: string
  placeholder?: string
  filterTitle?: string
  onlyPublished?: boolean
}) => {
  const { field, fieldState } = useController({ name, rules, shouldUnregister, defaultValue, control })
  const hasError = fieldState.error !== undefined

  return (
    <EvaluationSelect
      value={field.value}
      onChange={field.onChange}
      label={label}
      placeholder={placeholder}
      error={hasError}
      helperText={fieldState.error?.message}
      filterTitle={filterTitle}
      onlyPublished={onlyPublished}
    />
  )
}

export type { I_EvaluationOption }
