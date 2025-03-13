import React, { ComponentProps } from 'react'

import { T_EvaluationStatusCode } from '@/mta_evaluations/types'
import { evaluationStatusCodeToLabels } from '@/mta_evaluations/labels'
import Chip from '@/shared/components/Chip'

interface I_EvaluationStatusChipProps extends Omit<ComponentProps<typeof Chip>, 'color' | 'label'> {
  status: T_EvaluationStatusCode
}

const evaluationStatusCodeToColors: Record<
  T_EvaluationStatusCode,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  D: 'secondary',
  P: 'success',
}

const EvaluationStatusChip: React.FC<I_EvaluationStatusChipProps> = ({ status, variant = 'outlined', ...props }) => {
  const label = evaluationStatusCodeToLabels(status)
  const color = evaluationStatusCodeToColors[status]

  return <Chip {...{ color, label, ...props }} variant={variant} />
}

export default EvaluationStatusChip
