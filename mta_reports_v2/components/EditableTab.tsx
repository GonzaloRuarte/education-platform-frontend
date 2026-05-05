'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import {
  EditableContentSection,
  FieldConfig,
  RenderFieldArgs,
} from '@/mta_reports_v2/components/EditableContentSection'

const australFilterSx = {
  '& img[alt="Universidad Austral"]': {
    filter:
      'brightness(0) saturate(100%) invert(13%) sepia(91%) saturate(3500%) hue-rotate(228deg) brightness(85%) contrast(105%)',
  },
}

interface EditableTabProps<F extends string> {
  schoolId: number
  initialEditing?: boolean
  diapositivaId: string
  successMessage: string
  fields: Record<F, FieldConfig>
  maxWidth?: number
  withAustralFilter?: boolean
  children?: (args: RenderFieldArgs<F>) => ReactNode
}

const EditableTab = <F extends string,>({
  schoolId,
  initialEditing,
  diapositivaId,
  successMessage,
  fields,
  maxWidth = 820,
  withAustralFilter = true,
  children,
}: EditableTabProps<F>) => {
  const defaultRender = ({ renderField }: RenderFieldArgs<F>) => {
    const keys = Object.keys(fields) as F[]
    return (
      <Box sx={{ maxWidth }}>
        {keys.map((key, i) => renderField(key, i < keys.length - 1 ? { mb: 4 } : {}))}
      </Box>
    )
  }

  const section = (
    <EditableContentSection
      schoolId={schoolId}
      diapositivaId={diapositivaId}
      successMessage={successMessage}
      fields={fields}
      initialEditing={initialEditing}
    >
      {children ?? defaultRender}
    </EditableContentSection>
  )

  return withAustralFilter ? <Box sx={{ height: '100%', ...australFilterSx }}>{section}</Box> : section
}

export { EditableTab }
