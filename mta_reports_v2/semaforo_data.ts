// Contenido descriptor estático para la página Semáforo.
// Organizado por: año → materia → nivel (verde, amarillo, naranja, rojo).

export interface SemaforoGrupo {
  titulo?: string
  items: string[]
}

export interface SemaforoNivel {
  rango: string
  min: number
  max: number
  col1: SemaforoGrupo[]
  col2?: SemaforoGrupo[]
}

export type SemaforoDescriptors = Record<string, Record<string, SemaforoNivel[]>>

const LENGUAJE = 'Prácticas del Lenguaje'
const MATEMATICA = 'Matemática'

export const SEMAFORO_NIVELES: SemaforoDescriptors = {
  '3ro': {
    [LENGUAJE]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir las características no explícitas de los personajes, de los lugares, ambientes, paisajes en que transcurren las acciones.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'inferir las características no explícitas de los lugares, ambientes, paisajes en que se presentan los hechos.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'reconocimiento de verbo o acción.',
          ]},
        ],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer las causas y las consecuencias, los obstáculos y las facilitaciones explícitas, de los hechos y de las acciones de los personajes.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'reconocer relaciones entre hechos.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'uso de minúsculas y mayúsculas, reconocimiento de cualidad o adjetivo.',
          ]},
        ],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer la secuencia de hechos y acciones, personajes principales y secundarios, sus características y las acciones explícitas que realizan.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'identificar características explícitas de los objetos y hechos de que se trata.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'silabear palabras sencillas, reconocimiento de nombre o sustantivo, uso de la "rr".',
          ]},
        ],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer los lugares, ambientes y paisajes en los que se desarrollan las acciones.',
            'reconocer al autor, su propósito y de qué tipo de texto se trata.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'reconocer lugares, ambientes, paisajes en los que se presentan los hechos.',
            'reconocer el propósito y el tipo de texto de que se trata.',
          ]},
        ],
      },
    ],
    [MATEMATICA]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [{ items: [
          'Reconocer las descomposiciones y composiciones polinómicas de números de hasta 4 cifras.',
          'Resolver problemas de la vida cotidiana que involucren unidades convencionales de medidas de tiempo.',
          'Resolver problemas de la vida cotidiana que involucren unidades no convencionales y convencionales de longitud.',
          'Reconocer descripciones de figuras planas.',
        ]}],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [{ items: [
          'Reconocer unidades no convencionales de medidas de capacidad muy usuales y resolver problemas que involucren esas medidas en situaciones de la vida cotidiana.',
          'Reconocer los patrones de series basadas en operaciones numéricas.',
          'Resolver operaciones de multiplicación y división con números naturales de hasta 4 cifras, con reagrupación.',
        ]}],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [{ items: [
          'Resolver operaciones de resta con números naturales, con reagrupación.',
          'Resolver situaciones problemáticas que involucren operaciones de resta ("sentido de completar") con números naturales.',
          'Resolver operaciones de división con números naturales.',
          'Resolver situaciones problemáticas que involucren operaciones de multiplicación con números naturales.',
        ]}],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [{ items: [
          'Leer y escribir números de hasta 4 cifras.',
          'Ordenar y comparar números de hasta 4 cifras.',
          'Resolver operaciones de suma sin y con reagrupación con números naturales de hasta 4 cifras.',
          'Resolver operaciones de resta sin reagrupación con números naturales de hasta 4 cifras.',
          'Resolver operaciones de multiplicación con números naturales de hasta 4 cifras, sin reagrupación.',
          'Resolver situaciones problemáticas que involucren operaciones de suma con números naturales de hasta 4 cifras.',
        ]}],
      },
    ],
  },

  '6to': {
    [LENGUAJE]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir los obstáculos y las facilitaciones no explícitas que se les presentan a los personajes.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'inferir las características no explícitas de los lugares, ambientes y paisajes en que se presentan los hechos.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'uso del pronombre, reconocimiento de normas de puntuación.',
          ]},
        ],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir las características no explícitas de los personajes, de los lugares, ambientes, paisajes en que transcurren las acciones.',
            'reconocer el tipo de trama, el propósito del autor y qué tipo de texto se trata.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'reconocer relaciones entre hechos.',
            'reconocer el significado de palabras a partir de claves contextuales.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'identificar las funciones de las preposiciones y de los conectores.',
            'tildación de monosílabos.',
          ]},
        ],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer las causas y las consecuencias, los obstáculos y las facilitaciones explícitas, de los hechos y de las acciones de los personajes.',
            'reconocer a los hablantes.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'reconocer lugares, ambientes, paisajes en los que se presentan los hechos.',
            'reconocer el tipo de trama, el propósito del autor y qué tipo de texto se trata.',
          ]},
        ],
        col2: [
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'reconocer el significado de palabras a partir de claves contextuales.',
            'uso de mayúsculas y minúsculas.',
          ]},
        ],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer personajes principales y secundarios, sus características y las acciones explícitas que realizan.',
            'reconocer la secuencia de hechos y acciones.',
          ]},
          { titulo: 'Ante un texto informativo', items: [
            'identificar características explícitas de los objetos y hechos de que se trata.',
          ]},
        ],
      },
    ],
    [MATEMATICA]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [{ items: [
          'Resolver operaciones con números fraccionarios usuales.',
          'Resolver problemas que involucren medidas de longitud y área aplicadas a polígonos.',
          'Reconocer las definiciones o descripciones dadas las representaciones gráficas de figuras planas y de cuerpos y viceversa.',
          'Resolver situaciones problemáticas que involucren operaciones de suma, resta, multiplicación y división con números naturales, expresiones decimales y números fraccionarios usuales.',
          'Expresar la probabilidad de un evento.',
        ]}],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [{ items: [
          'Resolver problemas que involucren medidas angulares aplicadas a polígonos.',
          'Resolver problemas que involucren medidas de peso aplicadas a situaciones de la vida cotidiana.',
          'Interpretar gráficos de coordenadas cartesianas de informaciones estadísticas usuales.',
          'Reconocer equivalencias de medidas de capacidad usuales.',
          'Resolver problemas que involucren medidas de tiempo en situaciones usuales.',
        ]}],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [{ items: [
          'Reconocer equivalencias de medidas de longitud usuales.',
          'Reconocer unidades de medida de peso más usuales en situaciones de la vida cotidiana.',
          'Resolver sumas y multiplicaciones con expresiones decimales.',
          'Ubicar y reconocer la ubicación de números naturales, fraccionarios y de expresiones decimales en la recta numérica.',
        ]}],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [{ items: [
          'Reconocer las descomposiciones y composiciones polinómicas de números de hasta 7 cifras.',
          'Resolver operaciones de división con números naturales.',
          'Reconocer representaciones gráficas de cuerpos geométricos.',
          'Ordenar y comparar números de hasta 7 cifras.',
        ]}],
      },
    ],
  },

  '9no': {
    [LENGUAJE]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'inferir las características no explícitas de los hechos, de los procesos, de los lugares y ambientes en que se presentan los hechos.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'reconocer las posiciones que se plantean ante el problema que se discute.',
            'identificar las relaciones entre los argumentos y las posiciones expresadas.',
            'interpretar el significado del problema en cuestión.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir los obstáculos y las facilitaciones no explícitas que se les presentan a los personajes.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'uso de la coma como repositora de verbo.',
          ]},
        ],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'reconocer relaciones explícitas entre hechos.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'interpretar el significado de los argumentos explícitos.',
            'inferir argumentos no planteados explícitamente.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir las características no explícitas de los personajes, de los lugares, ambientes, paisajes en que transcurren las acciones.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'uso del modo subjuntivo y el potencial relacionados.',
          ]},
        ],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'identificar características explícitas de los hechos de que se trata.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'reconocer relaciones entre los argumentos presentados.',
            'reconocer el problema sobre el que se argumenta.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer las causas y las consecuencias, los obstáculos y las facilitaciones explícitas, de los hechos y de las acciones de los personajes.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'usos pronominales. tildación de adverbios.',
          ]},
        ],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'reconocer hechos, procesos, lugares y ambientes en los que se presentan los hechos.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'identificar información explícita del problema sobre el que se argumenta.',
            'reconocer argumentos explícitos que se presentan.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer personajes principales y secundarios, sus características y las acciones explícitas que realizan.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'Escritura de palabras terminadas en "sión" y "ción".',
            'reconocimiento del uso de la coma en la aposición.',
          ]},
        ],
      },
    ],
    [MATEMATICA]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [{ items: [
          'Identificar la probabilidad de un evento.',
          'Reconocer propiedades de los triángulos.',
          'Resolver problemas que involucran medidas de capacidad y volumen.',
          'Resolver problemas que involucran perímetro.',
          'Representar fracciones en la recta.',
        ]}],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [{ items: [
          'Reconocer la equivalencia entre medidas de capacidad.',
          'Resolver una inecuación.',
          'Resolver problemas que involucran resolver una ecuación.',
          'Resolver operaciones en Q.',
        ]}],
        col2: [{ items: [
          'Resolver problemas que involucran proporcionalidad.',
          'Resolver problemas que involucren operaciones en Q.',
          'Resolver problemas que involucran propiedades de ángulos y triángulos.',
          'Identificar el desarrollo plano de un cuerpo.',
        ]}],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [{ items: [
          'Reconocer orden en Q.',
          'Resolver operaciones en Q.',
          'Identificar el gráfico que corresponde a una situación.',
          'Resolver problemas que involucran cálculo de promedio, áreas, porcentaje.',
        ]}],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [{ items: [
          'Reconocer porcentajes en un gráfico.',
          'Interpretar información de un gráfico.',
          'Identificar expresiones distintas de un mismo número.',
          'Resolver problemas que involucren operaciones en N.',
        ]}],
      },
    ],
  },

  '12mo': {
    [LENGUAJE]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'inferir las características no explícitas de los procesos, de los hechos, de los lugares y ambientes.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'reconocer las posiciones que se plantean ante el problema que se discute.',
            'identificar las relaciones entre los argumentos y las posiciones expresadas.',
            'interpretar el significado del problema en cuestión.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir los obstáculos y las facilitaciones no explícitas que se les presentan a los personajes.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'todos los desempeños de los niveles más bajos.',
          ]},
        ],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'reconocer relaciones entre hechos.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'interpretar el significado de los argumentos explícitos.',
            'inferir argumentos no planteados explícitamente.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'inferir las características no explícitas de los personajes, de los lugares, ambientes, paisajes en que transcurren las acciones.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'uso del modo subjuntivo y el potencial relacionados.',
          ]},
        ],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'identificar características explícitas de los procesos, de los hechos, de los lugares y ambientes.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'interpretar el significado de los argumentos explícitos.',
            'reconocer relaciones entre los argumentos presentados.',
            'reconocer el problema sobre el que se argumenta.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer las causas y las consecuencias, los obstáculos y las facilitaciones explícitas, de los hechos y de las acciones de los personajes.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'tildación de palabras compuestas, función repositora de la coma.',
          ]},
        ],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [
          { titulo: 'Ante un texto informativo', items: [
            'reconocer procesos, hechos, lugares y ambientes.',
          ]},
          { titulo: 'Ante un texto argumentativo', items: [
            'identificar información explícita del problema sobre el que se argumenta.',
            'reconocer argumentos explícitos que se presentan.',
            'reconocer el propósito y el tipo de texto de que se trata.',
          ]},
        ],
        col2: [
          { titulo: 'Ante un texto narrativo', items: [
            'reconocer personajes principales y secundarios, sus características y las acciones explícitas que realizan.',
            'reconocer la secuencia de hechos y acciones.',
          ]},
          { titulo: 'En reflexión sobre los hechos del lenguaje', items: [
            'uso de la coma en oraciones complejas, uso de pronombres.',
            'escritura de verbos terminados en "vir" y "bir".',
          ]},
        ],
      },
    ],
    [MATEMATICA]: [
      {
        rango: 'De 31 a 40', min: 31, max: 40,
        col1: [{ items: [
          'Identificar el gráfico de una función dada por su fórmula y viceversa.',
          'Resolver problemas que involucran plantear y resolver una ecuación y el concepto de área.',
          'Resolver problemas que involucran relaciones trigonométricas.',
          'Resolver problemas que involucran perímetro de polígonos o circunferencia.',
        ]}],
        col2: [{ items: [
          'Reconocer medidas de tendencia central.',
          'Reconocer la variación de dos magnitudes.',
          'Resolver problemas que involucran relaciones trigonométricas.',
        ]}],
      },
      {
        rango: 'De 20 a 30', min: 20, max: 30,
        col1: [{ items: [
          'Resolver una inecuación.',
          'Resolver una ecuación logarítmica o exponencial.',
          'Resolver problemas que involucran la reconstrucción de una ecuación.',
          'Resolver problemas que involucran Teorema de Pitágoras.',
        ]}],
        col2: [{ items: [
          'Resolver problemas que involucran porcentaje, cálculo de promedios y de áreas.',
          'Identificar la solución gráfica de una ecuación o inecuación.',
          'Identificar el gráfico de una función.',
        ]}],
      },
      {
        rango: 'De 11 a 19', min: 11, max: 19,
        col1: [{ items: [
          'Resolver problemas que involucran factorización de polinomios.',
          'Operar en Q aplicando propiedades y resolver problemas que las involucren.',
          'Resolver problemas que involucran operaciones en Q.',
          'Identificar las raíces de una ecuación.',
        ]}],
      },
      {
        rango: 'Hasta 10', min: 0, max: 10,
        col1: [{ items: [
          'Expresar con una fórmula la relación entre dos variables en una situación.',
          'Calcular la distancia entre dos puntos.',
          'Utilizar propiedades de las operaciones con polinomios.',
          'Identificar el enunciado que corresponde a una ecuación y viceversa.',
          'Interpretar la misma información estadística en distintos gráficos.',
        ]}],
      },
    ],
  },
}

export const ANIO_LABELS: Record<string, string> = {
  '3ro': '3° grado',
  '6to': '6° grado',
  '9no': '9° año',
  '12mo': '12° año',
}

export const NIVEL_COLORS: Record<string, string> = {
  'verde':    '#4caf50',
  'amarillo': '#f5a623',
  'naranja':  '#e07020',
  'rojo':     '#c0392b',
}

export const NIVEL_KEYS = ['verde', 'amarillo', 'naranja', 'rojo'] as const
export type NivelKey = typeof NIVEL_KEYS[number]

export function getNivelKey(min: number): NivelKey {
  if (min >= 31) return 'verde'
  if (min >= 20) return 'amarillo'
  if (min >= 11) return 'naranja'
  return 'rojo'
}
