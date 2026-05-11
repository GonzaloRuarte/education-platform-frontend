import type {
  I_FiltrosAurora,
  I_RawEscuelaDatos,
  I_ResumenTabData,
} from '@/mta_reports_v2/types'
import {
  filterEstudiantes,
  findCombo,
  mean,
  r1,
  studentScores,
  todosRate,
  type T_SchoolSelection,
} from './_shared'

export function calcResumen(
  raw: I_RawEscuelaDatos,
  f: I_FiltrosAurora,
  schools: T_SchoolSelection = null,
): I_ResumenTabData | null {
  const combo = findCombo(raw, f.materia, f.anio, f.toma)
  if (!combo) return null
  if (!combo.todos?.por_pregunta) return null

  const estudiantes_mi = filterEstudiantes(combo, f.division, f.neeFilter, schools).map(s => s.respuestas)
  const pp = combo.todos.por_pregunta

  const nonPisa = new Set(combo.preguntas.filter(q => !q.es_pisa).map(q => String(q.id)))
  const pisa    = new Set(combo.preguntas.filter(q =>  q.es_pisa).map(q => String(q.id)))
  const all     = new Set(combo.preguntas.map(q => String(q.id)))

  const pct40Mi = r1(mean(studentScores(nonPisa, estudiantes_mi)))

  // En agrupamiento, "mi" no es una sola escuela sino un subconjunto variable de la
  // selección, así que las barras se dejan tal cual vienen agregadas por escuela y
  // el highlight lo resuelve el componente con `highlightIds`. Solo en modo escuela
  // sustituimos la barra de mi colegio por el pct recalculado bajo los filtros.
  const isAgrupamiento = (raw.escuelas?.length ?? 0) > 0
  const miId = raw.colegio_meta_id
  const bars = isAgrupamiento
    ? combo.todos.por_escuela.map(e => ({ id: e.id, p: e.pct }))
    : combo.todos.por_escuela.map(e =>
        e.id === miId ? { id: e.id, p: pct40Mi } : { id: e.id, p: e.pct },
      )
  if (!isAgrupamiento && miId && !bars.some(b => b.id === miId)) {
    bars.push({ id: miId, p: pct40Mi })
  }

  return {
    general: {
      muestra: { mi: estudiantes_mi.length, todos: combo.todos.puntajes.length },
      pct40:   { mi: pct40Mi,                                              todos: todosRate(nonPisa, pp) },
      pctPISA: { mi: r1(mean(studentScores(pisa, estudiantes_mi))),        todos: todosRate(pisa,    pp) },
      pct45:   { mi: r1(mean(studentScores(all,  estudiantes_mi))),        todos: todosRate(all,     pp) },
    },
    por_colegio: {
      bars,
      miId,
    },
  }
}
