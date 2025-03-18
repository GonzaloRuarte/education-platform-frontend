'use client'

import dynamic from 'next/dynamic'

const LoadFormulasResources = dynamic(
  async () => {
    const { default: ClientLoadFormulasResources } = await import('./ClientLoader')
    return () => <ClientLoadFormulasResources />
  },
  {
    ssr: false,
  },
)

export default LoadFormulasResources
