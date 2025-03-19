import { T_AppointmentStatus } from '@/mta_schedule/types'

const appointmentStatusCodeToColors: Record<
  T_AppointmentStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  F: 'info',
  P: 'warning',
  A: 'success',
  R: 'error',
}

import React, { ComponentProps } from 'react'
import { appointmentStatusCodeToLabels } from '@/mta_schedule/labels'
import Chip from '@/shared/components/Chip'

interface I_AppointmentStatusChipProps extends Omit<ComponentProps<typeof Chip>, 'color' | 'label'> {
  status: T_AppointmentStatus
}

const AppointmentStatusChip: React.FC<I_AppointmentStatusChipProps> = ({ status, variant = 'outlined', ...props }) => {
  const label = appointmentStatusCodeToLabels[status]
  const color = appointmentStatusCodeToColors[status]

  return <Chip {...{ color, label, ...props }} variant={variant} />
}

export default AppointmentStatusChip
