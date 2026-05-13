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
  groupByMicrocompetencia,
  isLenguajeMateria,
  r1,
  studentScores,
  type T_SchoolSelection,
} from './_shared'

export function calcDetalle(
  raw: I_RawEscuelaDatos,
  f: I_FiltrosAurora,
  schools: T_SchoolSelection = null,
): I_DetalleTabData | null {
  const combo = findCombo(raw, f.materia, f.anio, f.toma)
  if (!combo) return null
  if (!combo.todos?.por_pregunta) return null

  // El listado de alumnos del dropdown se construye SIEMPRE sobre el universo del
  // agrupamiento (sin filtro de escuela). Los agregados de los charts se calculan
  // sobre el subset filtrado por escuela, así "Mi escuela" en el boxplot puede
  // representar una escuela específica mientras el dropdown sigue mostrando todos
  // los alumnos.
  const allStudents = filterEstudiantes(combo, f.division, f.neeFilter)
  const aggStudents = schools === null
    ? allStudents
    : allStudents.filter(s => s.school != null && schools.has(s.school))
  const estudiantes_mi = aggStudents.map(s => s.respuestas)
  const pp = combo.todos.por_pregunta
  const allIds = new Set(combo.preguntas.map(q => String(q.id)))
  const scores45 = studentScores(allIds, estudiantes_mi)

  const isLenguajeRaw = isLenguajeMateria(f.materia)
  // Para Lenguaje el chart 02 ("Resultados por tipo de texto y microcompetencia") combina
  // dos dimensiones: tipo de texto (`contenido-texto_*`) y microcompetencia (`microcompetencia-*`).
  // Cada una aporta filas independientes al barchart.
  const contenido   = isLenguajeRaw
    ? [
        ...groupBy('contenido', combo.preguntas, pp, estudiantes_mi),
        ...groupByMicrocompetencia(combo.preguntas, pp, estudiantes_mi),
      ]
    : groupBy('contenido', combo.preguntas, pp, estudiantes_mi)
  const competencia = groupBy('competencia', combo.preguntas, pp, estudiantes_mi)
  const bpMi    = boxplot(scores45)
  const bpTodos = boxplot(combo.todos.puntajes)

  const isLenguaje = isLenguajeRaw

  const estudiantes = allStudents.map((s) => {
    const respuestas = s.respuestas
    const answered = [...allIds].filter(k => k in respuestas)
    const score = answered.length
      ? r1(answered.filter(k => respuestas[k]).length / answered.length * 100)
      : 0
    const one = [respuestas]
    // Misma lógica que arriba: microcompetencias por tags en Lenguaje, contenido por campo en el resto.
    const stCont = isLenguaje
      ? [
          ...groupBy('contenido', combo.preguntas, pp, one),
          ...groupByMicrocompetencia(combo.preguntas, pp, one),
        ]
      : groupBy('contenido', combo.preguntas, pp, one)
    const stComp = groupBy('competencia', combo.preguntas, pp, one)
    return {
      id: s.id,
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
