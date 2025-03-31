'use client'

import { T_ApplicationService } from '@/shared/appServices/types'
import dynamic from 'next/dynamic'

const LoadFormulasResources: T_ApplicationService = dynamic(
  async () => {
    const { default: ClientLoadFormulasResources } = await import('./ClientLoader')
    return () => <ClientLoadFormulasResources />
  },
  {
    ssr: false,
  },
)

export default LoadFormulasResources
