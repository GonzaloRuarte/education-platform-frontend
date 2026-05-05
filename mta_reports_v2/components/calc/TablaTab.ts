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
    return prepared ? [{ students: prepared.students, qids: prepared.qids, key }] : []
  })
  const maxLen = Math.max(...infos.map(m => m.students.length), 0)

  return Array.from({ length: maxLen }, (_, i) => {
    const row: I_TablaRow = { id: i + 1 }
    for (const { students, qids, key } of infos) {
      if (i >= students.length) continue
      const answered = qids.filter(k => k in students[i].respuestas)
      row[key] = calcPercentage(answered, students[i].respuestas)
    }
    return row
  })
}
