import { useCallback, useEffect, useState } from 'react'
import { useAuthResources } from '@/mta_auth/hooks'
import {
  I_ReportDetail,
  I_ReportUpdateRequestData,
  I_ReportCreateRequestData,
  T_ReportId,
  T_ReportList,
} from '@/mta_reports/types'
import { axiosDelete, axiosGet, axiosPatch, axiosPost } from '@/shared/data/axios'
import { creationHook, deletionHook, detailHook, listHook, updateHook, batchDeletionHook, dynamicNavigationHook, navigationHook } from '@/shared/hooks'
import pages from '@/pages'
import { reportEditPath } from '@/pages'
import { apiUrl } from '@/config'

const REPORTS_PATH = '/reports'

const useReportList = listHook<T_ReportList>(REPORTS_PATH, axiosGet, useAuthResources)
const useReportListByUserSchool = listHook<T_ReportList>(
  `${REPORTS_PATH}/list-by-user-school`,
  axiosGet,
  useAuthResources,
)



const useReportDetail = detailHook<T_ReportId, I_ReportDetail>(REPORTS_PATH, axiosGet, useAuthResources)

const useReportCreate = creationHook<I_ReportCreateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPost,
  useAuthResources,
)
const useReportUpdate = updateHook<T_ReportId, I_ReportUpdateRequestData, I_ReportDetail>(
  REPORTS_PATH,
  axiosPatch,
  useAuthResources,
)
const useReportDelete = deletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)
const useReportBatchDelete = batchDeletionHook<T_ReportId>(REPORTS_PATH, axiosDelete, useAuthResources)

const useNavigateToReportCreate = navigationHook(pages.D._.reportes._.agregar.path)
const useNavigateToReportEdit = dynamicNavigationHook(reportEditPath)
const useNavigateToReportList = navigationHook(pages.D._.reportes.path)

// ─── META Report visualization ───────────────────────────────────────────────

interface I_FiltrosMETA {
  materia: string
  anio: string
  division: string
  toma: string
}

interface I_ItemMETA {
  n: string
  mi: number
  t: number
}

interface I_BoxplotMETA {
  min: number
  q1: number
  md: number
  q3: number
  max: number
  av: number
}

interface I_ReporteMETAData {
  colegio: string
  general: {
    muestra: { mi: number; todos: number }
    pct40: { mi: number; todos: number }
    pctPISA: { mi: number; todos: number }
    pct45: { mi: number; todos: number }
  }
  por_colegio: {
    bars: Array<{ id: string; p: number }>
    miId: string
  }
  detalle: {
    contenido: I_ItemMETA[]
    competencia: I_ItemMETA[]
    boxplotMi: I_BoxplotMETA
    boxplotTodos: I_BoxplotMETA
    lenComp?: I_ItemMETA[]
    lenCont?: I_ItemMETA[]
    boxplotMiLenguaje?: I_BoxplotMETA
    boxplotTodosLenguaje?: I_BoxplotMETA
  }
}

const useReporteMETA = (escuelaId: number | null, filtros: I_FiltrosMETA) => {
  const [data, setData] = useState<I_ReporteMETAData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authResources = useAuthResources()
  const { materia, anio, division, toma } = filtros

  const fetchData = useCallback(async () => {
    if (!escuelaId) return
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ materia, anio, division, toma })
      const result = await axiosGet<I_ReporteMETAData>({
        url: `${apiUrl(`/reportes/meta/${escuelaId}/`)}?${params}`,
        requestSetup: authResources,
        options: {},
      })
      setData(result)
    } catch (err: any) {
      setError(err?.message ?? 'Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }, [escuelaId, materia, anio, division, toma, authResources.accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export type { I_FiltrosMETA, I_ReporteMETAData, I_ItemMETA, I_BoxplotMETA }
export { useReportCreate, useReportList, useReportListByUserSchool, useReportDetail, useReportUpdate, useReportDelete, useReportBatchDelete, useNavigateToReportCreate, useNavigateToReportEdit, useNavigateToReportList, useReporteMETA, REPORTS_PATH }