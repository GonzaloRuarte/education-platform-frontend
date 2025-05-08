import { useRemovePageBreak } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { DeleteButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { T_VoidFn } from '@/shared/types'
import { Grid2 as Grid } from '@mui/material'
import { FC } from 'react'

const PageBreak: FC<{ afterQuestionId: number; reload: T_VoidFn; disabled?: boolean }> = ({
  afterQuestionId,
  reload,
  disabled = false,
}) => {
  const remove = useRemovePageBreak()
  const { setIsInProgress, setIsNotInProgress } = useInProgress()

  const handleDelete = () => {
    setIsInProgress()
    remove({ after_question_id: afterQuestionId })
      .then(reload)
      .catch(handleServiceError)
      .finally(() => setIsNotInProgress())
  }
  return (
    <>
      <Pastilla>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size="grow">{evaluationLabels.pageBreak}</Grid>
          <MagicGrid itemSize="auto">
            <DeleteButton disabled={disabled} onClick={handleDelete} />
          </MagicGrid>
        </Grid>
      </Pastilla>
      <Spacer size="s" />
    </>
  )
}
export default PageBreak
