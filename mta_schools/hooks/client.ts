'use client'

import pages from '@/pages'
import { useRouter } from 'next/navigation'

const useNavigateToSchoolList = () => {
  const router = useRouter()

  return () => {
    router.push(pages.D._.escuelas.path)
  }
}

export { useNavigateToSchoolList }
