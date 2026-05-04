import { ANIO_ORDER } from '@/mta_reports_v2/constants'
import type {
  I_RawEscuelaDatos,
  I_SemaforoBandas,
} from '@/mta_reports_v2/types'
import {
  bandForCount,
  filterEstudiantes,
  findCombo,
} from './_shared'

export function calcSemaforo(
  raw: I_RawEscuelaDatos,
  materia: string,
  division: string,
  toma: string,
  neeFilter: string = 'Todos',
): Record<string, I_SemaforoBandas> {
  const result: Record<string, I_SemaforoBandas> = {}
  for (const anio of ANIO_ORDER) {
    const combo = findCombo(raw, materia, anio, toma)
    if (!combo) continue
    const estudiantes = filterEstudiantes(combo, division, neeFilter)
    const nonPisaIds = combo.preguntas.filter(q => !q.es_pisa).map(q => String(q.id))
    const bands = { verde: 0, amarillo: 0, naranja: 0, rojo: 0 }
    for (const est of estudiantes) {
      const correct = nonPisaIds.filter(k => k in est.respuestas && est.respuestas[k]).length
      bands[bandForCount(correct)]++
    }
    result[anio] = { ...bands, total: Object.values(bands).reduce((s, v) => s + v, 0) }
  }
  return result
}
