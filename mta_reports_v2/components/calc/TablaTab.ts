import type {
  I_RawEscuelaDatos,
  I_TablaRow,
} from '@/mta_reports_v2/types'
import {
  buildAnonIds,
  calcPercentage,
  prepareCombo,
} from './_shared'

export function calcTabla(
  raw: I_RawEscuelaDatos,
  anio: string,
  division: string,
  toma: string,
  neeFilter: string = 'Todos',
): I_TablaRow[] {
  const MATS = [
    { materia: 'Matemática',             key: 'mat' as const },
    { materia: 'Prácticas del Lenguaje', key: 'len' as const },
  ]
  const infos = MATS.flatMap(({ materia, key }) => {
    const prepared = prepareCombo(raw, materia, anio, toma, division, neeFilter)
    return prepared ? [{ combo: prepared.combo, students: prepared.students, qids: prepared.qids, key }] : []
  })
  if (!infos.length) return []

  const schoolNameById = new Map<string, string>(
    (raw.escuelas ?? []).map(e => [e.id, e.name]),
  )
  const anonById = buildAnonIds(infos.map(i => i.combo), division)
  const rowsById = new Map<string, I_TablaRow>()
  for (const { students, qids, key } of infos) {
    for (const s of students) {
      const anonId = anonById.get(s.id)
      if (!anonId) continue
      let row = rowsById.get(anonId)
      if (!row) {
        row = { id: anonId }
        const name = s.school ? schoolNameById.get(s.school) : undefined
        if (name) row.school = name
        rowsById.set(anonId, row)
      }
      const answered = qids.filter(k => k in s.respuestas)
      row[key] = calcPercentage(answered, s.respuestas)
    }
  }
  return [...rowsById.values()].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  )
}
