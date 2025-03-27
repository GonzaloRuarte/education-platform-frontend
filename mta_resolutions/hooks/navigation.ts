import pages from '@/pages'
import { navigationHook } from '@/shared/hooks'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
// const useNavigateToResolutionLogin = navigationHook(pages.R._.login.path)

export { useNavigateToResolutionPage }
