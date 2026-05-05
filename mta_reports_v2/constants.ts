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
  navyMid: '#214F80',
  midNavy: '#003366',
  iceBlue: '#DBEDF4',
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
  bgGrey: '#F4F4F4',
  gridLight: '#eeeeee',
  gridLighter: '#eaeaea',
  refRed: '#e84c4c',
  subjectBadge: '#4C7198',
  pagerBg: '#eaeaea',
  pagerBorder: '#c7c7c7',
  whiteAlpha92: 'rgba(255, 255, 255, 0.92)',
  whiteAlpha85: 'rgba(255, 255, 255, 0.85)',
  navyAlpha12: 'rgba(4, 21, 82, 0.12)',
  navyAlpha15: 'rgba(4, 21, 82, 0.15)',
  lightBlueAlpha22: 'rgba(195, 217, 255, 0.22)',
  blackAlpha15: 'rgba(0, 0, 0, 0.15)',
  blackAlpha18: 'rgba(0, 0, 0, 0.18)',
  blackAlpha20: 'rgba(0, 0, 0, 0.20)',
  whiteAlpha10: 'rgba(255, 255, 255, 0.10)',
  whiteAlpha16: 'rgba(255, 255, 255, 0.16)',
  gridDivider: '#C8C6C4',
  gridMid: '#d0d0d0',
  boxplotTodos: '#B1E0F2',
  kpiText: 'rgb(37, 36, 35)',
} as const

export const ANIO_ORDER = ['3ro', '6to', '9no', '12mo'] as const

export const FONT_FAMILY = '"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif'

export const FONT_SIZES = {
  xs: 8,
  sm: 10,
  base: 12,
  md: 14,
  lg: 16,
  xl: 24,
  xxl: 32,
  kpiTitle: 18,
  kpiLabel: 17,
  cardSubtitle: 19,
  kpiValue: 26,
  score: 20,
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
  slidePx: { xs: 3, md: 8 },
  slidePt: { xs: 4, md: 5 },
  slidePb: { xs: 2, md: 3 },
} as const

export const RADIUS = {
  sm: 1,
  md: 3,
  lg: 5,
  xl: 9,
  pill: 999,
} as const

export const TITLE_FONT_FAMILY = '"Segoe UI", Segoe, system-ui, sans-serif'

export const SLIDE_TITLE_SX = {
  fontFamily: TITLE_FONT_FAMILY,
  fontWeight: 800,
  color: COLORS.navy,
  fontSize: 'clamp(36px, 5vw, 52px)',
  lineHeight: 1.05,
} as const

export const SLIDE_HERO_TITLE_SX = {
  fontFamily: TITLE_FONT_FAMILY,
  fontWeight: 900,
  color: COLORS.royal,
  fontSize: 'clamp(40px, 5.5vw, 64px)',
  lineHeight: 1.1,
} as const

export const FILL_COLUMN_SX = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minHeight: 0,
} as const

export const CARD_SX = {
  bgcolor: COLORS.white,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: RADIUS.lg,
} as const

export const CHART_MARGINS = {
  vertical: { top: 16, right: 8, bottom: 30, left: 10 },
  horizontal: { top: 5, right: 72, bottom: 5, left: 8 },
  boxplot: { top: 16, right: 8, bottom: 8, left: 40 },
} as const

export { REPORT_NAME, ESCUELA_REPORTE_NAME, AURORA_REPORT_NAME }
