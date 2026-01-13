import React from 'react'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

import Button from '@/shared/components/Button'
import MagicGrid from '@/shared/components/MagicGrid'
import { Body1 } from '@/shared/components/Typography'

type Props = {
  isFirstPage: boolean
  isLastPage: boolean
  canForward?: boolean
  onPrev: () => void
  onNext: () => void
  nextLabel?: string
  cantForwardText?: string
  renderLast?: React.ReactNode
}

const ResolutionPaginatorView = ({
  isFirstPage,
  isLastPage,
  canForward = true,
  onPrev,
  onNext,
  nextLabel = 'Siguiente',
  cantForwardText = 'Para avanzar necesitas completar todas las preguntas',
  renderLast,
}: Props) => {
  return (
    <Grid container>
      <Grid>
        {!isFirstPage && (
          <Button variant="outlined" onClick={onPrev} startIcon={<ArrowBackIcon />}>
            Anterior
          </Button>
        )}
      </Grid>

      <Grid size="grow" />

      <Grid>
        {!isLastPage ? (
          <MagicGrid itemSize="auto">
            {!canForward && <Body1>{cantForwardText}</Body1>}
            <Button disabled={!canForward} endIcon={<ArrowForwardIcon />} onClick={onNext}>
              {nextLabel}
            </Button>
          </MagicGrid>
        ) : (
          <MagicGrid itemSize="auto">{renderLast ?? null}</MagicGrid>
        )}
      </Grid>
    </Grid>
  )
}

export default ResolutionPaginatorView