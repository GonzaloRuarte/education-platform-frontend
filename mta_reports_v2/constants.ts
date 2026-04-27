import { EntityName } from '@/shared/utils'

const REPORT_NAME = new EntityName({ gender: 'M', plural: 'reportes', singular: 'reporte' })
const ESCUELA_REPORTE_NAME = new EntityName({ gender: 'F', plural: 'escuelas', singular: 'escuela' })

export const COLORS = {
  navy: '#041552',
  blue: '#0b2280',
  accent: '#00a6e6',
  barFill: '#1a3080',
  barLight: '#4a7cc7',
  barMe: '#ff9800',
  lightBlue: '#C3D9FF',
  boxLight: '#7ecef4',
  tm: '#7a8399',
} as const

export const ANIO_ORDER = ['3ro', '6to', '9no', '12mo'] as const

export { REPORT_NAME, ESCUELA_REPORTE_NAME }
