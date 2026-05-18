import type { CSSProperties } from 'react'

import { PRODUCT_NAME, PRODUCT_SHORT_NAME } from '@/shared/product'

type T_LogoVariant = 'color' | 'white'
interface I_Props {
  width: CSSProperties['width']
  height: CSSProperties['height']
  variant?: T_LogoVariant
}

const Logo = ({ width, height, variant = 'color' }: I_Props) => {
  const heightNumber = typeof height === 'number' ? height : Number.parseFloat(String(height))
  const widthNumber = typeof width === 'number' ? width : Number.parseFloat(String(width))
  const fontSizeByHeight = Number.isFinite(heightNumber) ? heightNumber * 0.46 : 24
  const fontSizeByWidth = Number.isFinite(widthNumber) ? widthNumber / (PRODUCT_SHORT_NAME.length * 0.72) : 24
  const fontSize = Math.max(12, Math.min(fontSizeByHeight, fontSizeByWidth, 44))
  const color = variant === 'white' ? '#FFFFFF' : '#24315F'
  const borderColor = variant === 'white' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(36, 49, 95, 0.32)'

  return (
    <div
      aria-label={PRODUCT_NAME}
      style={{
        width,
        maxWidth: '100%',
        height,
        color,
        border: `1px solid ${borderColor}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-montserrat), sans-serif',
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        padding: '0 0.7em',
        boxSizing: 'border-box',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {PRODUCT_SHORT_NAME}
    </div>
  )
}

export default Logo
