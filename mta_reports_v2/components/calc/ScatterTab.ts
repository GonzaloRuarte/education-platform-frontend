import type {
  I_RawEscuelaDatos,
  I_ScatterPoint,
} from '@/mta_reports_v2/types'
import {
  calcPercentage,
  prepareCombo,
} from './_shared'

export function calcScatter(
  raw: I_RawEscuelaDatos,
  anio: string,
  division: string,
  toma: string,
  neeFilter: string = 'Todos',
): I_ScatterPoint[] {
  const len = prepareCombo(raw, 'Prácticas del Lenguaje', anio, toma, division, neeFilter)
  const mat = prepareCombo(raw, 'Matemática',             anio, toma, division, neeFilter)
  if (!len || !mat) return []

  const lenStudents = len.students
  const matStudents = mat.students
  const lenIds = len.qids
  const matIds = mat.qids
  const count = Math.min(lenStudents.length, matStudents.length)

  if (lenStudents.length !== matStudents.length) {
    // Structural assumption: estudiantes_mi for the two materias is in the same order per student.
    // If this no longer holds, the scatter would mis-pair. Until backend exposes a stable student_id,
    // fall back to the truncated min and accept the data may be slightly misaligned.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[scatter] lengua/mate student counts differ', { len: lenStudents.length, mat: matStudents.length })
    }
  }

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
