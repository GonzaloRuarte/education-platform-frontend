'use client'

import { useEffect, useState } from 'react'

export interface I_HistoricoBar {
  toma: string  // p.ej. "1-2024"
  pct_mi_colegio: number
  pct_promedio_red: number
  participantes: number
}

export interface I_HistoricoData {
  por_materia: {
    matematica: I_HistoricoBar[]
    lenguaje: I_HistoricoBar[]
  }
  por_anio: Record<string, I_HistoricoBar[]>
}

const MOCK: I_HistoricoData = {
  por_materia: {
    matematica: [
      { toma: '1-2022', pct_mi_colegio: 58, pct_promedio_red: 54, participantes: 92 },
      { toma: '2-2022', pct_mi_colegio: 62, pct_promedio_red: 56, participantes: 95 },
      { toma: '1-2023', pct_mi_colegio: 64, pct_promedio_red: 58, participantes: 96 },
      { toma: '2-2023', pct_mi_colegio: 67, pct_promedio_red: 60, participantes: 97 },
      { toma: '1-2024', pct_mi_colegio: 70, pct_promedio_red: 62, participantes: 99 },
    ],
    lenguaje: [
      { toma: '1-2022', pct_mi_colegio: 55, pct_promedio_red: 52, participantes: 92 },
      { toma: '2-2022', pct_mi_colegio: 60, pct_promedio_red: 55, participantes: 95 },
      { toma: '1-2023', pct_mi_colegio: 63, pct_promedio_red: 57, participantes: 96 },
      { toma: '2-2023', pct_mi_colegio: 66, pct_promedio_red: 59, participantes: 97 },
      { toma: '1-2024', pct_mi_colegio: 68, pct_promedio_red: 61, participantes: 99 },
    ],
  },
  por_anio: {
    '3ro': [],
    '6to': [],
    '9no': [],
    '12mo': [],
  },
}

export const useHistoricoEscuela = (schoolId: number | null) => {
  const [data, setData] = useState<I_HistoricoData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (schoolId === null) return
    setLoading(true)
    // TODO: reemplazar con una llamada de axios una vez que esté implementada la ingesta de Excels históricos en el backend
    const t = setTimeout(() => {
      setData(MOCK)
      setLoading(false)
    }, 200)
    return () => clearTimeout(t)
  }, [schoolId])

  return { data, loading }
}
