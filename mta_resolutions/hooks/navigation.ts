import pages from '@/pages'
import { navigationHook } from '@/shared/hooks'
import { useRouter } from 'next/navigation'

const useNavigateToResolutionPage = navigationHook(pages.R._.resolverEvaluacion.path)
const useNavigateToResolutionSubmittedPage = () => {
  const router = useRouter()
  return (options?: { offline?: boolean }) => {
    const path = pages.R._.resolucionEntregada.path
    router.push(options?.offline ? `${path}?offline=true` : path)
  }
}
const useNavigateToResolutionLoginPage = navigationHook(pages.R._.login.path)

export { useNavigateToResolutionPage, useNavigateToResolutionSubmittedPage, useNavigateToResolutionLoginPage }
