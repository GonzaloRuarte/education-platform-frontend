'use client'

import { ReactNode, useLayoutEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { COLORS, SLIDE_BASE, ZOOM } from '@/mta_reports_v2/constants'

interface SlideStageProps {
  children: ReactNode
  zoom: number
  onFitZoomChange?: (z: number) => void
}

const SlideStage = ({ children, zoom, onFitZoomChange }: SlideStageProps) => {
  const outerRef = useRef<HTMLDivElement | null>(null)
  const lastFitRef = useRef<number>(0)

  useLayoutEffect(() => {
    const el = outerRef.current
    if (!el || !onFitZoomChange) return
    const compute = () => {
      const w = el.clientWidth - ZOOM.fitPadding * 2
      const h = el.clientHeight - ZOOM.fitPadding * 2
      if (w <= 0 || h <= 0) return
      const z = Math.min(w / SLIDE_BASE.width, h / SLIDE_BASE.height)
      if (Math.abs(z - lastFitRef.current) < 0.001) return
      lastFitRef.current = z
      onFitZoomChange(z)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [onFitZoomChange])

  const scaledW = SLIDE_BASE.width * zoom
  const scaledH = SLIDE_BASE.height * zoom

  return (
    <Box
      ref={outerRef}
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        bgcolor: COLORS.bgGrey,
        display: 'flex',
        alignItems: 'safe center',
        justifyContent: 'safe center',
        p: `${ZOOM.fitPadding}px`,
      }}
    >
      <Box sx={{ width: scaledW, height: scaledH, flexShrink: 0, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: SLIDE_BASE.width,
            height: SLIDE_BASE.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            bgcolor: COLORS.white,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export { SlideStage }
