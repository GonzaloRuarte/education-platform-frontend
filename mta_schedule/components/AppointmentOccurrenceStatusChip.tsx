import { appointmentOccurrenceStatusCodeToLabels } from '@/mta_schedule/labels'
import { T_AppointmentOccurrenceStatus } from '@/mta_schedule/types'
import Chip from '@/shared/components/Chip'
import React, { ComponentProps } from 'react'

const appointmentOccurrenceStatusCodeToColors: Record<
  T_AppointmentOccurrenceStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  PAST: 'default',
  ONGOING: 'info',
  UPCOMING: 'secondary',
}

interface I_Props extends Omit<ComponentProps<typeof Chip>, 'color' | 'label'> {
  status: T_AppointmentOccurrenceStatus
}

const AppointmentOccurrenceStatusChip: React.FC<I_Props> = ({ status, variant = 'outlined', ...props }) => {
  const label = appointmentOccurrenceStatusCodeToLabels[status]
  const color = appointmentOccurrenceStatusCodeToColors[status]

  return (
    <Chip
      sx={{ borderWidth: 2, fontWeight: 'bold', borderRadius: 2 }}
      {...{ color, label, ...props }}
      variant={'filled'}
    />
  )
}

export default AppointmentOccurrenceStatusChip
