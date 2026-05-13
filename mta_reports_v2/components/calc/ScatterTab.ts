import type {
  I_RawEscuelaDatos,
  I_ScatterPoint,
} from '@/mta_reports_v2/types'
import {
  calcPercentage,
  prepareCombo,
  type T_SchoolSelection,
} from './_shared'

export function calcScatter(
  raw: I_RawEscuelaDatos,
  anio: string,
  division: string,
  toma: string,
  neeFilter: string = 'Todos',
  schools: T_SchoolSelection = null,
): I_ScatterPoint[] {
  const len = prepareCombo(raw, 'Prácticas del Lenguaje', anio, toma, division, neeFilter, schools)
  const mat = prepareCombo(raw, 'Matemática',             anio, toma, division, neeFilter, schools)
  if (!len || !mat) return []

  const matById = new Map(mat.students.map(s => [s.id, s]))
  const points: I_ScatterPoint[] = []
  for (const lenS of len.students) {
    const matS = matById.get(lenS.id)
    if (!matS) continue
    points.push({
      id: lenS.id,
      pdl: calcPercentage(len.qids.filter(k => k in lenS.respuestas), lenS.respuestas),
      mat: calcPercentage(mat.qids.filter(k => k in matS.respuestas), matS.respuestas),
      school: lenS.school ?? matS.school ?? null,
    })
  }
  return points
}
