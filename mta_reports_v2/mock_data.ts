// Mock data for local development / testing without backend.
// Usage: replace the axiosGet call in useEscuelaReporteReact with this data.

const ANIOS = ['3ro', '6to', '9no', '12mo']
const MATERIAS = ['Matemática', 'Prácticas del Lenguaje']
const TOMAS = ['2023-1', '2024-1']

function mkPreguntas(materia: string, anio: string, startId: number) {
  // 40 non-PISA + 5 PISA questions per combo
  const competencias = materia === 'Matemática'
    ? ['Número y operaciones', 'Geometría', 'Medida', 'Estadística']
    : ['Comprensión lectora', 'Reflexión lingüística', 'Producción textual']
  const contenidos = materia === 'Matemática'
    ? ['numeración', 'operaciones', 'geometría', 'medida', 'estadística']
    : ['analisis textual', 'vocabulario', 'gramática', 'ortografía', 'inferencia']

  const qs: Array<{ id: number; orden: number; competencia: string; contenido: string; es_pisa: boolean }> = []
  for (let i = 0; i < 40; i++) {
    qs.push({
      id: startId + i,
      orden: i + 1,
      competencia: competencias[i % competencias.length],
      contenido: contenidos[i % contenidos.length],
      es_pisa: false,
    })
  }
  for (let i = 0; i < 5; i++) {
    qs.push({
      id: startId + 40 + i,
      orden: 41 + i,
      competencia: competencias[0],
      contenido: contenidos[0],
      es_pisa: true,
    })
  }
  return qs
}

function mkStudent(qids: number[], targetBand: 'verde' | 'amarillo' | 'naranja' | 'rojo', division: string | null) {
  // target correct count for non-PISA
  const targets = { verde: 35, amarillo: 25, naranja: 15, rojo: 6 }
  const target = targets[targetBand]
  const nonPisa = qids.slice(0, 40)
  const pisa = qids.slice(40)
  const respuestas: Record<string, boolean> = {}
  let correct = 0
  for (const id of nonPisa) {
    const ans = correct < target && Math.random() < 0.85
    respuestas[String(id)] = ans
    if (ans) correct++
  }
  for (const id of pisa) {
    respuestas[String(id)] = Math.random() < 0.5
  }
  return { division, respuestas }
}

function mkEstudiantes(qids: number[], n: number, divisions: string[]) {
  const bands: Array<'verde' | 'amarillo' | 'naranja' | 'rojo'> = ['verde', 'amarillo', 'naranja', 'rojo']
  return Array.from({ length: n }, (_, i) => {
    const band = bands[Math.floor((i / n) * 4)] ?? 'amarillo'
    const div = divisions[i % divisions.length]
    return mkStudent(qids, band, div)
  })
}

function mkTodos(qids: number[], nSchools = 12) {
  const por_pregunta: Record<string, { n_correctas: number; n_total: number }> = {}
  for (const id of qids) {
    const total = 120 + Math.floor(Math.random() * 80)
    por_pregunta[String(id)] = {
      n_correctas: Math.floor(total * (0.4 + Math.random() * 0.4)),
      n_total: total,
    }
  }
  const puntajes = Array.from({ length: 150 }, () => Math.round(40 + Math.random() * 45))
  const por_escuela = Array.from({ length: nSchools }, (_, i) => ({
    id: i === 0 ? 'TEST001' : `ESC${String(i + 1).padStart(3, '0')}`,
    pct: Math.round(40 + Math.random() * 40),
    n: 20 + Math.floor(Math.random() * 30),
  }))
  return { por_pregunta, puntajes, por_escuela }
}

export function getMockEscuelaDatos() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const datos: any[] = []
  let idCounter = 1000

  for (const toma of TOMAS) {
    for (const materia of MATERIAS) {
      for (const anio of ANIOS) {
        const preguntas = mkPreguntas(materia, anio, idCounter)
        const qids = preguntas.map(q => q.id)
        idCounter += preguntas.length

        const divisions = ['A', 'B']
        const estudiantes_mi = mkEstudiantes(qids, 32, divisions)
        const todos = mkTodos(qids)

        datos.push({ materia, anio, toma, preguntas, estudiantes_mi, todos })
      }
    }
  }

  return {
    colegio: 'Escuela de Prueba (Mock)',
    colegio_meta_id: 'TEST001',
    datos,
  }
}
