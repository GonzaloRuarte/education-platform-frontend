'use client'

import { RefObject, useEffect, useState } from 'react'

interface ResponsiveHeightOpts {
  bottomMargin?: number
  minHeight?: number
}

const useResponsiveHeight = (
  ref: RefObject<HTMLElement | null>,
  { bottomMargin = 80, minHeight = 300 }: ResponsiveHeightOpts = {},
) => {
  const [height, setHeight] = useState(minHeight + 100)

  useEffect(() => {
    const compute = () => {
      const el = ref.current
      if (!el) return
      const available = window.innerHeight - el.getBoundingClientRect().top - bottomMargin
      setHeight(Math.max(minHeight, available))
    }
    const observer = new ResizeObserver(compute)
    const parent = ref.current?.parentElement
    if (parent) observer.observe(parent)
    window.addEventListener('resize', compute)
    compute()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [ref, bottomMargin, minHeight])

  return height
}

interface ResponsiveBoxOpts {
  initialW?: number
  initialH?: number
  minW?: number
  maxW?: number
  minH?: number
  hRatio?: number
}

const useResponsiveBox = (
  ref: RefObject<HTMLElement | null>,
  { initialW = 90, initialH = 280, minW = 100, maxW = 180, minH = 280, hRatio = 0.8 }: ResponsiveBoxOpts = {},
) => {
  const [dimensions, setDimensions] = useState({ w: initialW, h: initialH })

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const parent = ref.current?.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const w = Math.max(minW, Math.min(rect.width - 16, maxW))
      const h = Math.max(minH, rect.height * hRatio)
      setDimensions({ w, h })
    })
    const parent = ref.current?.parentElement
    if (parent) observer.observe(parent)
    return () => observer.disconnect()
  }, [ref, minW, maxW, minH, hRatio])

  return dimensions
}

export { useResponsiveHeight, useResponsiveBox }
