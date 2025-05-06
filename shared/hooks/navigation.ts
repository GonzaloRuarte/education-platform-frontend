'use client'

import { pages, pathWithId } from '@/pages'

import { useRouter } from 'next/navigation'

const navigationHook = (path: string) => {
  return () => {
    const router = useRouter()
    return () => {
      router.push(path)
    }
  }
}

const navigationWithIdHook = (path: string) => {
  return () => {
    const router = useRouter()

    return (id: string | number) => {
      router.push(pathWithId(path, id))
    }
  }
}
type T_ExtractPathParams<T extends string> = T extends `${infer _Start}{${infer Param}:${infer _Type}}${infer Rest}`
  ? Param | T_ExtractPathParams<Rest>
  : never
const dynamicNavigationHook = <T extends string>(path: T) => {
  return () => {
    const router = useRouter()

    return (args: Record<T_ExtractPathParams<T>, string | number>) => {
      const resolvedPath = path.replace(/{(\w+):\w+}/g, (_, key) => args[key].toString())

      router.push(resolvedPath)
    }
  }
}

const useNavigateToDashboardHome = navigationHook(pages.D.path)

export { dynamicNavigationHook, navigationHook, navigationWithIdHook, useNavigateToDashboardHome }
