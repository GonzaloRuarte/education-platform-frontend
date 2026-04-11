import pages from '@/pages'
import { navigationHook } from '@/shared/hooks'
import { useRouter } from 'next/navigation'

// Set to true before intentional submit navigation so beforeunload doesn't block it
export const submitNavigationGuard = { active: false }

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
const useNavigateToResolutionSubmittedPage = () => {
  const router = useRouter()
  return () => {
    submitNavigationGuard.active = true
    router.push(pages.R._.resolucionEntregada.path)
  }
}
const useNavigateToResolutionLoginPage = navigationHook(pages.R._.login.path)

export { useNavigateToResolutionPage, useNavigateToResolutionSubmittedPage, useNavigateToResolutionLoginPage }
