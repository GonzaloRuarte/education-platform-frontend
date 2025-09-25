// components/FormActions.tsx
'use client'

import MagicGrid from '@/shared/components/MagicGrid'
import Submit from '@/shared/components/Submit'
import Button from '@/shared/components/Button'

type Props = {
  submitLabel: string
  onCancel?: () => void
  cancelLabel: string
}

export default function FormActions({ submitLabel, onCancel, cancelLabel }: Props) {
  return (
    <MagicGrid itemSize="auto">
      <Submit>{submitLabel}</Submit>
      {onCancel && (
        <Button variant="text" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
    </MagicGrid>
  )
}
