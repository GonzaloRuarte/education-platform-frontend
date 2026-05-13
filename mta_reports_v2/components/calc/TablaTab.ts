import type {
  I_RawEscuelaDatos,
  I_TablaRow,
} from '@/mta_reports_v2/types'
import {
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
  const rowsById = new Map<string, I_TablaRow>()
  for (const { students, qids, key } of infos) {
    for (const s of students) {
      let row = rowsById.get(s.id)
      if (!row) {
        row = { id: s.id }
        const name = s.school ? schoolNameById.get(s.school) : undefined
        if (name) row.school = name
        rowsById.set(s.id, row)
      }
      const answered = qids.filter(k => k in s.respuestas)
      row[key] = calcPercentage(answered, s.respuestas)
    }
  }
  return [...rowsById.values()].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true }),
  )
}
