import type {
  I_BoxplotAurora,
  I_ItemAurora,
  I_RawComboDato,
  I_RawEscuelaDatos,
  I_RawPregunta,
  I_SemaforoBandas,
} from '@/mta_reports_v2/types'

// ─── Mapeo de spec ────────────────────────────────────────────────────────────
// pct_correctas              -> studentScores (% por estudiante) + todosRate (% agregado). Se agregan tres porcentajes: las de 45, las 40 normales y las 5 PISA
// pct_correctas_mi_colegio   -> studentScores(qids, estudiantes_mi)
// pct_correctas_todos        -> todosRate(qids, pp)
// pct_correctas_por_eval     -> studentScores devuelve una entrada por evaluation_resolution
// participantes_colegio      -> estudiantes_mi.length
// participantes_todos        -> combo.todos.puntajes.length
// pct_correctas_por_grupo    -> groupBy('contenido' | 'competencia', ...)
// semaforo                   -> bandForCount + el caller itera estudiantes
// boxplot_stats              -> boxplot()  (min/max son whisker fences usando 1.5*IQR; los outliers se reportan por separado)
// scatter_por_alumno         -> ver calc/ScatterTab.ts (junta lengua y mate por índice de array - ver supuesto estructural)

export function r1(x: number): number {
  return Math.round(x * 10) / 10
}

// El nombre de la materia llega del backend con varias formas: "Prácticas del Lenguaje",
// "PDL", o normalizado sin acentos. Acá unificamos el match para no perder el branch
// de microcompetencias por una diferencia de string.
export function isLenguajeMateria(materia: string | undefined | null): boolean {
  if (!materia) return false
  const n = materia.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
  return n === 'pdl' || n === 'practicas del lenguaje' || n === 'lenguaje'
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
  if (!scores.length) return { min: 0, q1: 0, md: 0, q3: 0, max: 0, av: 0, outliers: [], rawMin: 0, rawMax: 0 }
  const s = [...scores].sort((a, b) => a - b)
  const q1 = quantile(s, 0.25)
  const md = quantile(s, 0.5)
  const q3 = quantile(s, 0.75)
  const iqr = q3 - q1
  const fenceLo = q1 - 1.5 * iqr
  const fenceHi = q3 + 1.5 * iqr
  const inFence = s.filter(v => v >= fenceLo && v <= fenceHi)
  const outliers = s.filter(v => v < fenceLo || v > fenceHi)
  const whiskerLo = inFence.length ? inFence[0] : s[0]
  const whiskerHi = inFence.length ? inFence[inFence.length - 1] : s[s.length - 1]
  return {
    min: r1(whiskerLo),
    q1: r1(q1),
    md: r1(md),
    q3: r1(q3),
    max: r1(whiskerHi),
    av: r1(mean(scores)),
    outliers: outliers.map(r1),
    rawMin: r1(s[0]),
    rawMax: r1(s[s.length - 1]),
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
  const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  const tagMap: Record<string, string> = {}
  const register = (canonical: string, variants: string[]) => {
    for (const v of variants) tagMap[strip(v.trim())] = canonical
  }
  register('Estadística y probabilidad', [
    'Estadística y probabilidad', 'Estadistica y probabilidad',
    'Estadística', 'Estadistica', 'Probabilidad',
  ])
  register('Numeración y operaciones', [
    'Numeración y operaciones', 'Numeracion y operaciones',
    'Números y operaciones', 'Numeros y operaciones',
    'Números operaciones', 'Numeros operaciones',
    'Numeración operaciones', 'Numeracion operaciones',
  ])
  register('Geometría', [
    'Geometría', 'Geometria',
  ])
  register('Medidas', [
    'Medida', 'Medidas',
  ])
  register('Álgebra', [
    'Álgebra', 'Algebra',
  ])
  register('Funciones, ecuaciones e inecuaciones', [
    'Funciones, ecuaciones e inecuaciones',
    'Funciones ecuaciones e inecuaciones',
    'Funciones ecuaciones inecuaciones',
    'Funciones-ecuaciones-inecuaciones',
  ])
  register('Reconocimiento de conceptos', [
    'Reconocimiento de conceptos', 'Reconocimiento conceptos',
    'Reconocimiento-de-conceptos',
  ])
  register('Resolución de operaciones', [
    'Resolución de operaciones', 'Resolucion de operaciones',
    'Resolución operaciones', 'Resolucion operaciones',
    'Resolución-de-operaciones', 'Resolucion-de-operaciones',
  ])
  register('Resolución de problemas', [
    'Resolución de problemas', 'Resolucion de problemas',
    'Resolución problemas', 'Resolucion problemas',
    'Resolución-de-problemas', 'Resolucion-de-problemas',
  ])
  register('Resolución de algoritmos', [
    'Resolución de algoritmos', 'Resolucion de algoritmos',
    'Resolución-de-algoritmos', 'Resolucion-de-algoritmos',
  ])
  register('Comprensión lectora', [
    'Comprensión lectora', 'Comprension lectora',
  ])
  register('Comunicación en matemática', [
    'Comunicación en matemática', 'Comunicacion en matematica',
    'Comunicación matemática', 'Comunicacion matematica',
  ])
  register('Reflexión sobre los hechos del lenguaje', [
    'Reflexión sobre los hechos del lenguaje',
    'Reflexion sobre los hechos del lenguaje',
  ])
  register('Álgebra y funciones', [
    'Álgebra y funciones', 'Algebra y funciones',
  ])
  register('Geometría y medidas', [
    'Geometría y medidas', 'Geometria y medidas',
  ])
  register('Numeración', [
    'Numeración', 'Numeracion',
  ])
  register('Texto argumentativo', ['Texto argumentativo'])
  register('Texto informativo', ['Texto informativo'])
  register('Texto narrativo', ['Texto narrativo'])
  const normalizeTag = (t: string): string => tagMap[strip(t.trim())] ?? t

  const groups: Record<string, Set<string>> = {}
  for (const q of preguntas) {
    if (q.es_pisa) continue
    const tag = q[field] ? normalizeTag(q[field]) : null
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

// Agrupa preguntas por microcompetencia leyendo el campo `tags` (string separado por ';').
// Solo se consideran tags con prefijo 'microcompetencia-'. El slug se mapea al nombre
// canónico de display (con acentos y mayúsculas) vía MICROCOMPETENCIA_LABELS.
const MICROCOMPETENCIA_PREFIX = 'microcompetencia-'
// Las claves matchean el slug exacto que llega en el tag `microcompetencia-<slug>`,
// con underscores como en la fuente de datos. `_interpretar` se mappea al mismo
// label que `implicita` para agruparse en una sola fila del chart.
const MICROCOMPETENCIA_LABELS: Record<string, string> = {
  'analisis_textual': 'Análisis textual',
  'reconocimiento_de_informacion_explicita': 'Reconocimiento de información explícita',
  'reconocimiento_de_informacion_implicita': 'Reconocimiento de información implícita',
  'reconocimiento_de_informacion_implicita_interpretar': 'Reconocimiento de información implícita',
  'clases_de_palabras': 'Clases de palabras',
}

export function groupByMicrocompetencia(
  preguntas: I_RawPregunta[],
  pp: Record<string, { n_correctas: number; n_total: number }>,
  estudiantes: Array<Record<string, boolean>>,
): I_ItemAurora[] {
  const groups: Record<string, Set<string>> = {}
  for (const q of preguntas) {
    if (q.es_pisa) continue
    if (!q.tags) continue
    const tags = q.tags.split(';').map(t => t.trim()).filter(Boolean)
    for (const tag of tags) {
      if (!tag.startsWith(MICROCOMPETENCIA_PREFIX)) continue
      const slug = tag.slice(MICROCOMPETENCIA_PREFIX.length).replace(/-/g, '_')
      // Si el slug no está mapeado, se usa tal cual (degradación elegante).
      const label = MICROCOMPETENCIA_LABELS[slug] ?? slug
      if (!groups[label]) groups[label] = new Set()
      groups[label].add(String(q.id))
    }
  }
  return Object.entries(groups).map(([label, qids]) => ({
    n: label,
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

function aggregateCombos(
  combos: I_RawComboDato[],
  materia: string,
  anio: string,
  toma: string,
): I_RawComboDato {
  const preguntas = combos.flatMap(c => c.preguntas)
  const estudiantes_mi = combos.flatMap(c => c.estudiantes_mi)
  const por_pregunta: Record<string, { n_correctas: number; n_total: number }> = {}
  for (const c of combos) {
    for (const [qid, v] of Object.entries(c.todos?.por_pregunta ?? {})) {
      const cur = por_pregunta[qid]
      por_pregunta[qid] = cur
        ? { n_correctas: cur.n_correctas + v.n_correctas, n_total: cur.n_total + v.n_total }
        : { ...v }
    }
  }
  const puntajes = combos.flatMap(c => c.todos?.puntajes ?? [])
  const escMap: Record<string, { sumPctN: number; sumN: number }> = {}
  for (const c of combos) {
    for (const e of c.todos?.por_escuela ?? []) {
      if (!escMap[e.id]) escMap[e.id] = { sumPctN: 0, sumN: 0 }
      escMap[e.id].sumPctN += e.pct * e.n
      escMap[e.id].sumN += e.n
    }
  }
  const por_escuela = Object.entries(escMap).map(([id, { sumPctN, sumN }]) => ({
    id, pct: sumN ? r1(sumPctN / sumN) : 0, n: sumN,
  }))
  return {
    materia, anio, toma, preguntas, estudiantes_mi,
    todos: { por_pregunta, puntajes, por_escuela },
  }
}

export function findCombo(
  raw: I_RawEscuelaDatos,
  materia: string,
  anio: string,
  toma: string,
): I_RawComboDato | undefined {
  const allMat = materia === 'Todas'
  const allAnio = anio === 'Todos'
  if (!allMat && !allAnio) {
    return raw.datos.find(d => d.materia === materia && d.anio === anio && d.toma === toma)
  }
  const matching = raw.datos.filter(d =>
    (allMat || d.materia === materia) &&
    (allAnio || d.anio === anio) &&
    d.toma === toma,
  )
  if (matching.length === 0) return undefined
  if (matching.length === 1) return matching[0]
  return aggregateCombos(matching, materia, anio, toma)
}

// Mapa id_real → id anónimo secuencial (1..N), ordenado por id real.
// Se construye sobre el conjunto SIN filtro NEE para que toggleando NEE los ids
// no se reasignen. Se calcula sobre la unión de combos para que un mismo alumno
// tenga el mismo id anónimo en scatter y tabla (dos materias).
export function buildAnonIds(combos: I_RawComboDato[], division: string): Map<string, string> {
  const ids = new Set<string>()
  for (const c of combos) {
    for (const s of filterEstudiantes(c, division, 'Todos')) ids.add(s.id)
  }
  const sorted = [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  return new Map(sorted.map((id, i) => [id, String(i + 1)]))
}

// Selección de escuelas para los filtros de agrupamiento.
//   - `null`           → todas las escuelas (no se filtra por colegio).
//   - `Set<meta_id>`   → sólo estudiantes cuyo `school` cae en el set.
// `null` es el atajo idiomático del "Todas" del multi-select: anula la selección
// individual sin tener que enumerar todos los ids.
export type T_SchoolSelection = ReadonlySet<string> | null

export function isAllSchools(sel: T_SchoolSelection): sel is null {
  return sel === null
}

export function filterEstudiantes(
  combo: I_RawComboDato,
  division: string,
  neeFilter: string = 'Todos',
  schools: T_SchoolSelection = null,
) {
  let students = division.toLowerCase() === 'todas'
    ? combo.estudiantes_mi
    : combo.estudiantes_mi.filter(s => !s.division || s.division === division)
  if (neeFilter === 'Sin NEE') {
    students = students.filter(s => !s.nee)
  }
  if (schools !== null) {
    students = students.filter(s => s.school != null && schools.has(s.school))
  }
  return students
}

export interface PreparedCombo {
  combo: I_RawComboDato
  students: ReturnType<typeof filterEstudiantes>
  qids: string[]
}

export function prepareCombo(
  raw: I_RawEscuelaDatos,
  materia: string,
  anio: string,
  toma: string,
  division: string,
  neeFilter: string = 'Todos',
  schools: T_SchoolSelection = null,
): PreparedCombo | null {
  const combo = findCombo(raw, materia, anio, toma)
  if (!combo) return null
  return {
    combo,
    students: filterEstudiantes(combo, division, neeFilter, schools),
    qids: combo.preguntas.map(q => String(q.id)),
  }
}
