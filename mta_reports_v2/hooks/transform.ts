import type {
  I_BoxplotAurora,
  I_ItemAurora,
  I_RawPregunta,
  I_RawReporteAurora,
  I_ReporteAuroraData,
} from '@/mta_reports_v2/types'

function _r1(x: number): number {
  return Math.round(x * 10) / 10
}

function _mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function _quantile(sorted: number[], p: number): number {
  const pos = (sorted.length - 1) * p
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return lo === hi ? sorted[lo] : (sorted[lo] + sorted[hi]) / 2
}

function _boxplot(scores: number[]): I_BoxplotAurora {
  if (!scores.length) return { min: 0, q1: 0, md: 0, q3: 0, max: 0, av: 0 }
  const s = [...scores].sort((a, b) => a - b)
  return {
    min: _r1(s[0]),
    q1:  _r1(_quantile(s, 0.25)),
    md:  _r1(_quantile(s, 0.5)),
    q3:  _r1(_quantile(s, 0.75)),
    max: _r1(s[s.length - 1]),
    av:  _r1(_mean(scores)),
  }
}

function _studentScores(
  qids: Set<string>,
  estudiantes: Array<Record<string, boolean>>,
): number[] {
  const out: number[] = []
  for (const student of estudiantes) {
    const answered = [...qids].filter(k => k in student)
    if (!answered.length) continue
    out.push(answered.filter(k => student[k]).length / answered.length * 100)
  }
  return out
}

function _todosRate(
  qids: Set<string>,
  pp: Record<string, { n_correctas: number; n_total: number }>,
): number {
  let sumC = 0, sumT = 0
  for (const qid of qids) {
    const entry = pp[qid]
    if (entry) { sumC += entry.n_correctas; sumT += entry.n_total }
  }
  return sumT > 0 ? _r1(sumC / sumT * 100) : 0
}

function _groupBy(
  field: 'contenido' | 'competencia',
  preguntas: I_RawPregunta[],
  pp: Record<string, { n_correctas: number; n_total: number }>,
  estudiantes: Array<Record<string, boolean>>,
): I_ItemAurora[] {
  const groups: Record<string, Set<string>> = {}
  for (const q of preguntas) {
    if (q.es_pisa) continue
    const tag = q[field]
    if (!tag) continue
    if (!groups[tag]) groups[tag] = new Set()
    groups[tag].add(String(q.id))
  }
  return Object.entries(groups).map(([tag, qids]) => ({
    n: tag,
    mi: _r1(_mean(_studentScores(qids, estudiantes))),
    t:  _todosRate(qids, pp),
  }))
}

function transformReporteAurora(raw: I_RawReporteAurora, materia: string): I_ReporteAuroraData {
  const { preguntas, estudiantes_mi, todos, colegio, colegio_meta_id } = raw
  const pp = todos.por_pregunta

  const nonPisaIds = new Set(preguntas.filter(q => !q.es_pisa).map(q => String(q.id)))
  const pisaIds    = new Set(preguntas.filter(q =>  q.es_pisa).map(q => String(q.id)))
  const allIds     = new Set(preguntas.map(q => String(q.id)))

  const scores40   = _studentScores(nonPisaIds, estudiantes_mi)
  const scoresPISA = _studentScores(pisaIds,    estudiantes_mi)
  const scores45   = _studentScores(allIds,     estudiantes_mi)

  const contenido  = _groupBy('contenido',  preguntas, pp, estudiantes_mi)
  const competencia = _groupBy('competencia', preguntas, pp, estudiantes_mi)
  const bpMi    = _boxplot(scores45)
  const bpTodos = _boxplot(todos.puntajes)

  const isLenguaje = materia === 'Prácticas del Lenguaje'

  const estudiantes = estudiantes_mi.map((respuestas, idx) => {
    const answered = [...allIds].filter(k => k in respuestas)
    const score = answered.length ? _r1(answered.filter(k => respuestas[k]).length / answered.length * 100) : 0
    return { id: idx + 1, score }
  })

  return {
    colegio,
    general: {
      muestra: {
        mi:   estudiantes_mi.length,
        todos: todos.puntajes.length,
      },
      pct40:  { mi: _r1(_mean(scores40)),   todos: _todosRate(nonPisaIds, pp) },
      pctPISA:{ mi: _r1(_mean(scoresPISA)), todos: _todosRate(pisaIds,    pp) },
      pct45:  { mi: _r1(_mean(scores45)),   todos: _todosRate(allIds,     pp) },
    },
    por_colegio: {
      bars: todos.por_escuela.map(e => ({ id: e.id, p: e.pct })),
      miId: colegio_meta_id,
    },
    detalle: {
      contenido:  isLenguaje ? [] : contenido,
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
    },
  }
}

export { transformReporteAurora }
