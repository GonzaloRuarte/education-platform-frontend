import type {
  I_RawEscuelaDatos,
  I_ScatterPoint,
} from '@/mta_reports_v2/types'
import {
  buildAnonIds,
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

  const anonById = buildAnonIds([len.combo, mat.combo], division)
  const matById = new Map(mat.students.map(s => [s.id, s]))
  const points: I_ScatterPoint[] = []
  for (const lenS of len.students) {
    const matS = matById.get(lenS.id)
    if (!matS) continue
    const anonId = anonById.get(lenS.id)
    if (!anonId) continue
    points.push({
      id: anonId,
      pdl: calcPercentage(len.qids.filter(k => k in lenS.respuestas), lenS.respuestas),
      mat: calcPercentage(mat.qids.filter(k => k in matS.respuestas), matS.respuestas),
    })
  }
  return points
}
