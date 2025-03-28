import { useResolutionPagination } from '@/mta_resolutions/hooks'
import { H2 } from '@/shared/components/Typography'

const ResolutionPageIndicator = () => {
  const { currentPage, pagesQuantity } = useResolutionPagination()
  return (
    <>
      <H2>
        Página {currentPage} de {pagesQuantity}
      </H2>
    </>
  )
}

export default ResolutionPageIndicator
