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
    // Supuesto estructural: estudiantes_mi para las dos materias viene en el mismo orden por estudiante.
    // Si esto deja de cumplirse, el scatter emparejaría mal. Hasta que el backend exponga un student_id estable,
    // hacemos fallback al mínimo truncado y aceptamos que los datos puedan estar levemente desalineados.
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
