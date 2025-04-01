import pages from '@/pages'
import { navigationHook } from '@/shared/hooks'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
const useNavigateToResolutionSubmittedPage = navigationHook(pages.R._.resolucionEntregada.path)
const useNavigateToResolutionLoginPage = navigationHook(pages.R._.login.path)

export { useNavigateToResolutionPage, useNavigateToResolutionSubmittedPage, useNavigateToResolutionLoginPage }
