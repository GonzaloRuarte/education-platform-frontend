import type {
  I_DetalleTabData,
  I_FiltrosAurora,
  I_RawEscuelaDatos,
} from '@/mta_reports_v2/types'
import {
  boxplot,
  filterEstudiantes,
  findCombo,
  groupBy,
  r1,
  studentScores,
} from './_shared'

export function calcDetalle(
  raw: I_RawEscuelaDatos,
  f: I_FiltrosAurora,
): I_DetalleTabData | null {
  const combo = findCombo(raw, f.materia, f.anio, f.toma)
  if (!combo) return null
  if (!combo.todos?.por_pregunta) return null

  const estudiantes_mi = filterEstudiantes(combo, f.division, f.neeFilter).map(s => s.respuestas)
  const pp = combo.todos.por_pregunta
  const allIds = new Set(combo.preguntas.map(q => String(q.id)))
  const scores45 = studentScores(allIds, estudiantes_mi)

  const contenido   = groupBy('contenido',   combo.preguntas, pp, estudiantes_mi)
  const competencia = groupBy('competencia', combo.preguntas, pp, estudiantes_mi)
  const bpMi    = boxplot(scores45)
  const bpTodos = boxplot(combo.todos.puntajes)

  const isLenguaje = f.materia === 'Prácticas del Lenguaje'

  const estudiantes = estudiantes_mi.map((respuestas, idx) => {
    const answered = [...allIds].filter(k => k in respuestas)
    const score = answered.length
      ? r1(answered.filter(k => respuestas[k]).length / answered.length * 100)
      : 0
    const one = [respuestas]
    const stCont = groupBy('contenido',   combo.preguntas, pp, one)
    const stComp = groupBy('competencia', combo.preguntas, pp, one)
    return {
      id: idx + 1,
      score,
      contenido:   isLenguaje ? [] : stCont,
      competencia: isLenguaje ? [] : stComp,
      ...(isLenguaje && { lenCont: stCont, lenComp: stComp }),
    }
  })

  return {
    contenido:   isLenguaje ? [] : contenido,
    competencia: isLenguaje ? [] : competencia,
    boxplotMi:    bpMi,
    boxplotTodos: bpTodos,
    estudiantes,
    ...(isLenguaje && {
      lenComp: competencia,
      lenCont: contenido,
      boxplotMiLenguaje:    bpMi,
      boxplotTodosLenguaje: bpTodos,
    }),
  }
}
