import React from 'react'
import Chip from '@mui/material/Chip'
import { T_AnswerType } from '@/mta_evaluations/types'

interface I_AnswerTypeChipProps {
  type: T_AnswerType
}

const answerTypeColors: Record<T_AnswerType, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  MultipleChoice: 'info',
  Numeric: 'warning',
}
const answerTypeLabels: Record<T_AnswerType, string> = {
  MultipleChoice: 'Opción Múltiple',
  Numeric: 'Numérica',
}

const AnswerTypeChip: React.FC<I_AnswerTypeChipProps> = ({ type }) => {
  const color = answerTypeColors[type]
  return <Chip variant="outlined" size="small" label={answerTypeLabels[type]} color={color} />
}

export default AnswerTypeChip
