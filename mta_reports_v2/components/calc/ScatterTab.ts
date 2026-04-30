import type {
  I_RawEscuelaDatos,
  I_ScatterPoint,
} from '@/mta_reports_v2/types'
import {
  calcPercentage,
  filterEstudiantes,
  findCombo,
} from './_shared'

export function calcScatter(
  raw: I_RawEscuelaDatos,
  anio: string,
  division: string,
  toma: string,
): I_ScatterPoint[] {
  const lenCombo = findCombo(raw, 'Prácticas del Lenguaje', anio, toma)
  const matCombo = findCombo(raw, 'Matemática',             anio, toma)
  if (!lenCombo || !matCombo) return []

  const lenStudents = filterEstudiantes(lenCombo, division)
  const matStudents = filterEstudiantes(matCombo, division)
  const lenIds = lenCombo.preguntas.map(q => String(q.id))
  const matIds = matCombo.preguntas.map(q => String(q.id))
  const count = Math.min(lenStudents.length, matStudents.length)

  return Array.from({ length: count }, (_, i) => {
    const lenR = lenStudents[i].respuestas
    const matR = matStudents[i].respuestas
    return {
      id: i + 1,
      pdl: calcPercentage(lenIds.filter(k => k in lenR), lenR),
      mat: calcPercentage(matIds.filter(k => k in matR), matR),
    }
  })
}
