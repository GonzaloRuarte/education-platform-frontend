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
  tm: '#174573',
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
  blackAlpha04: 'rgba(0, 0, 0, 0.04)',
  blackAlpha10: 'rgba(0, 0, 0, 0.10)',
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
  legend: 15,
  lg: 16,
  select: 16,
  kpiLabel: 17,
  kpiTitle: 18,
  btnLabel: 18,
  cardSubtitle: 19,
  bodyLarge: 20,
  score: 20,
  subtitle: 22,
  xl: 24,
  badge: 26,
  kpiValue: 26,
  sectionHeading: 28,
  xxl: 32,
  chart: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 13,
  },
} as const

export const FONT_WEIGHTS = {
  normal: 400,
  medium: 500,
  kpi: 550,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const

export const SPACING = {
  cardPadding: 1.2,
  cardPaddingLarge: 3,
  cardInnerPx: 2.4,
  cardInnerPy: 1.8,
  kpiCardPx: 1.25,
  kpiCardPy: 3,
  scatterCardP: 2.5,
  gutterX: 2.5,
  groupSpacing: 1.25,
  buttonInnerPadding: 1.5,
  compactPadding: 1,
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
  circle: '50%',
} as const

export const Z_INDEX = {
  sticky: 1,
  toolbar: 2,
  popover: 3,
  floating: 5,
} as const

export const BOX_SHADOWS = {
  tooltip: '0 2px 8px rgba(0, 0, 0, 0.10)',
  sidebar: '0 3px 14px rgba(0, 0, 0, 0.20), 0 3px 5px rgba(0, 0, 0, 0.20)',
} as const

export const LAYOUT_SIZES = {
  sidebarWidth: 300,
  chartHeight: 320,
  chipHeight: 36,
  boxplotWidth: 200,
  dotLarge: 16,
  dotSmall: 10,
} as const

export const BAR_CHART = {
  size: { thin: 13, thick: 26 },
  rowHeight: { normal: 50, tall: 80 },
  baseHeight: { normal: 50, compact: 40 },
  minHeight: 80,
  yAxisWidth: { label: 180, compact: 36 },
  radius: { horizontal: [0, 2, 2, 0], vertical: [2, 2, 0, 0] },
  scrollThreshold: 20,
  minBarWidth: 60,
} as const

export const BOXPLOT = {
  maxBoxWidth: 96,
  widthRatio: 0.85,
  whiskerRatio: 0.5,
  avgRadius: 4,
  outlierRadius: 3,
  defaultSize: { w: 120, h: 340 },
} as const

export const AXIS = {
  percentDomain: [0, 100] as [number, number],
  refLineDash: '4 3',
  labelOffset: -25,
} as const

export const SCATTER = {
  bubbleRange: [500, 1000] as [number, number],
  dotRadius: 20,
  dotOpacity: 0.75,
} as const

export const SEMAFORO = {
  colorColWidth: 160,
  rowGap: 3,
  rowPy: 2,
  boxPy: 2.5,
  boxPx: 1,
  boxMinHeight: 130,
} as const

export const TABLA = {
  maxWidth: 560,
  maxHeight: 680,
  headerPt: 2,
  headerPb: 1,
  footerPy: 1,
  emptyPy: 3,
} as const

export const TITLE_FONT_FAMILY = '"Segoe UI", Segoe, system-ui, sans-serif'

export const SLIDE_TITLE_SX = {
  fontFamily: TITLE_FONT_FAMILY,
  fontWeight: FONT_WEIGHTS.extrabold,
  color: COLORS.navy,
  fontSize: 'clamp(36px, 5vw, 52px)',
  lineHeight: 1.05,
} as const

export const SLIDE_HERO_TITLE_SX = {
  fontFamily: TITLE_FONT_FAMILY,
  fontWeight: FONT_WEIGHTS.black,
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
  scatter: { top: 16, right: 24, bottom: 36, left: 16 },
  composedBoxplot: { top: 8, right: 4, bottom: 8, left: 4 },
} as const

export { REPORT_NAME, ESCUELA_REPORTE_NAME, AURORA_REPORT_NAME }
