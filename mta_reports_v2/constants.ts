import { EntityName } from '@/shared/utils'

const REPORT_NAME = new EntityName({ gender: 'M', plural: 'reportes', singular: 'reporte' })
const ESCUELA_REPORTE_NAME = new EntityName({ gender: 'F', plural: 'escuelas', singular: 'escuela' })
const AURORA_REPORT_NAME = new EntityName({
  gender: 'M',
  plural: 'reportes Aurora',
  singular: 'reporte Aurora',
})

export const COLORS = {
  navy: '#041552',
  blue: '#0b2280',
  royal: '#0040a3',
  accent: '#00a6e6',
  barFill: '#1a3080',
  barLight: '#4a7cc7',
  barMe: '#ff9800',
  lightBlue: '#C3D9FF',
  boxLight: '#7ecef4',
  tm: '#7a8399',
  white: '#ffffff',
  black: '#000000',
  textGrey: 'grey',
  darkGrey: '#555555',
  mutedGrey: '#999999',
  bgGrey: 'rgb(230, 230, 230)',
  gridLight: '#eeeeee',
  gridLighter: '#eaeaea',
  refRed: '#e84c4c',
  whiteAlpha92: 'rgba(255, 255, 255, 0.92)',
  whiteAlpha85: 'rgba(255, 255, 255, 0.85)',
  navyAlpha12: 'rgba(4, 21, 82, 0.12)',
  navyAlpha15: 'rgba(4, 21, 82, 0.15)',
  lightBlueAlpha22: 'rgba(195, 217, 255, 0.22)',
  blackAlpha15: 'rgba(0, 0, 0, 0.15)',
} as const

export const ANIO_ORDER = ['3ro', '6to', '9no', '12mo'] as const

export const FONT_SIZES = {
  xs: 8,
  sm: 10,
  base: 12,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
  chart: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 13,
  },
} as const

export const SPACING = {
  cardPadding: 2.4,
  cardPaddingLarge: 3,
  cardInnerPx: 2.4,
  cardInnerPy: 1.8,
} as const

export const CHART_MARGINS = {
  vertical: { top: 16, right: 8, bottom: 30, left: 10 },
  horizontal: { top: 5, right: 72, bottom: 5, left: 8 },
  boxplot: { top: 16, right: 8, bottom: 8, left: 40 },
} as const

export { REPORT_NAME, ESCUELA_REPORTE_NAME, AURORA_REPORT_NAME }
