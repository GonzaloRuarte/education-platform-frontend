import { useResolutionPagination } from '@/mta_resolutions/hooks'
import Spacer from '@/shared/components/Spacer'
import { H2 } from '@/shared/components/Typography'

const ResolutionPageIndicator = () => {
  const { currentPage, pagesQuantity } = useResolutionPagination()
  return (
    <>
      <H2>
        Página {currentPage} de {pagesQuantity}
      </H2>
      <Spacer size="l" />
    </>
  )
}

export default ResolutionPageIndicator
