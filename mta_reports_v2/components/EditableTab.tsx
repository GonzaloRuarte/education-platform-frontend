'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import {
  EditableContentSection,
  FieldConfig,
  RenderFieldArgs,
} from '@/mta_reports_v2/components/EditableContentSection'
import { australFilterSx } from '@/mta_reports_v2/components/shared/SlideContainer'
import type { I_Subject } from '@/mta_reports_v2/hooks'

interface EditableTabProps<F extends string> {
  subject: I_Subject
  initialEditing?: boolean
  diapositivaId: string
  successMessage: string
  fields: Record<F, FieldConfig>
  maxWidth?: number
  withAustralFilter?: boolean
  children?: (args: RenderFieldArgs<F>) => ReactNode
}

const EditableTab = <F extends string,>({
  subject,
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
      subject={subject}
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
