import { useStore } from '@/shared/state'

const useIsAuthorized = () => useStore(state => state.isAuthorized)


export {
  useIsAuthorized
}