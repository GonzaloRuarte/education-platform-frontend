export {
  useEscuelaReporteAurora,
  useAgrupamientoReporteAurora,
  useReporteAurora,
} from './viewer'
export type { I_Subject, T_SubjectKind } from './viewer'

export { useEditableSlide } from './useEditableSlide'
export type { SlideFieldConfig, UseEditableSlideResult } from './useEditableSlide'

export { useResponsiveHeight, useResponsiveBox } from './useResponsiveSize'

export { useHistoricoEscuela, useHistoricoSubject } from './historico'
export type { I_HistoricoData, I_HistoricoBar } from './historico'

export {
  useAuroraReportList,
  useAuroraReportCreate,
  useAuroraReportBatchDelete,
  useAuroraReportRegenerateAll,
  useAuroraReportCancelRegenerate,
  useAuroraReportRegenerateStatus,
  useAuroraReportPublish,
  useAuroraReportUnpublish,
  useNavigateToAuroraReportList,
  useNavigateToAuroraReportCreate,
} from './crud'
