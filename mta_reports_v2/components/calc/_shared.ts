import type {
  I_BoxplotAurora,
  I_ItemAurora,
  I_RawComboDato,
  I_RawEscuelaDatos,
  I_RawPregunta,
  I_SemaforoBandas,
} from '@/mta_reports_v2/types'

// ─── Spec mapping ─────────────────────────────────────────────────────────────
// pct_correctas              -> studentScores (per-student %) + todosRate (aggregate %)
// pct_correctas_mi_colegio   -> studentScores(qids, estudiantes_mi)
// pct_correctas_todos        -> todosRate(qids, pp)
// pct_correctas_por_eval     -> studentScores returns one entry per evaluation_resolution
// participantes_colegio      -> estudiantes_mi.length
// participantes_todos        -> combo.todos.puntajes.length
// pct_correctas_por_grupo    -> groupBy('contenido' | 'competencia', ...)
// semaforo                   -> bandForCount + caller iterates students
// boxplot_stats              -> boxplot()  (min/max are whisker fences using 1.5*IQR; outliers reported separately)
// scatter_por_alumno         -> see calc/ScatterTab.ts (joins lengua and mate by array index — see structural assumption)

export function r1(x: number): number {
  return Math.round(x * 10) / 10
}

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

function quantile(sorted: number[], p: number): number {
  const pos = (sorted.length - 1) * p
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return lo === hi ? sorted[lo] : (sorted[lo] + sorted[hi]) / 2
}

export function boxplot(scores: number[]): I_BoxplotAurora {
  if (!scores.length) return { min: 0, q1: 0, md: 0, q3: 0, max: 0, av: 0 }
  const s = [...scores].sort((a, b) => a - b)
  return {
    min: r1(s[0]),
    q1:  r1(quantile(s, 0.25)),
    md:  r1(quantile(s, 0.5)),
    q3:  r1(quantile(s, 0.75)),
    max: r1(s[s.length - 1]),
    av:  r1(mean(scores)),
  }
}

export function studentScores(
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

export function todosRate(
  qids: Set<string>,
  pp: Record<string, { n_correctas: number; n_total: number }>,
): number {
  let sumC = 0, sumT = 0
  for (const qid of qids) {
    const entry = pp[qid]
    if (entry) { sumC += entry.n_correctas; sumT += entry.n_total }
  }
  return sumT > 0 ? r1(sumC / sumT * 100) : 0
}

export function groupBy(
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
    mi: r1(mean(studentScores(qids, estudiantes))),
    t:  todosRate(qids, pp),
  }))
}

export function calcPercentage(
  answered: string[],
  responses: Record<string, boolean>,
): number {
  if (!answered.length) return 0
  const correct = answered.filter(k => responses[k]).length
  return Math.round(correct / answered.length * 100)
}

export function bandForCount(correct: number): keyof I_SemaforoBandas {
  if (correct >= 31) return 'verde'
  if (correct >= 20) return 'amarillo'
  if (correct >= 11) return 'naranja'
  return 'rojo'
}

export function findCombo(
  raw: I_RawEscuelaDatos,
  materia: string,
  anio: string,
  toma: string,
): I_RawComboDato | undefined {
  return raw.datos.find(d => d.materia === materia && d.anio === anio && d.toma === toma)
}

export function filterEstudiantes(combo: I_RawComboDato, division: string) {
  return division.toLowerCase() === 'todas'
    ? combo.estudiantes_mi
    : combo.estudiantes_mi.filter(s => !s.division || s.division === division)
}
