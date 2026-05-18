'use client'

import { ReactNode } from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { COLORS } from '@/mta_reports_v2/constants'

const C = COLORS

interface SlideContainerProps {
  children: ReactNode
  bgcolor?: string
  centered?: boolean
  sx?: SxProps<Theme>
}

const SlideContainer = ({
  children,
  bgcolor = C.white,
  centered = false,
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
  }
  return <Box sx={{ ...baseSx, ...(sx as object) }}>{children}</Box>
}

export { SlideContainer }
