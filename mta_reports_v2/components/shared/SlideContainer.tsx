'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS

const austral = {
  '& img[alt="Universidad Austral"]': {
    filter:
      'brightness(0) saturate(100%) invert(13%) sepia(91%) saturate(3500%) hue-rotate(228deg) brightness(85%) contrast(105%)',
  },
}

export const australFilterSx = austral

interface SlideContainerProps {
  children: ReactNode
  bgcolor?: string
  centered?: boolean
  withAustralFilter?: boolean
  sx?: SxProps<Theme>
}

const SlideContainer = ({
  children,
  bgcolor = C.white,
  centered = false,
  withAustralFilter = false,
  sx,
}: SlideContainerProps) => {
  const baseSx = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    bgcolor,
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    ...(centered && { alignItems: 'center', justifyContent: 'center' }),
    ...(withAustralFilter && austral),
  }
  return <Box sx={{ ...baseSx, ...(sx as object) }}>{children}</Box>
}

export { SlideContainer }
