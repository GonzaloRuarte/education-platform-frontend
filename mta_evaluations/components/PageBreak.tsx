import { useRemovePageBreak } from '@/mta_evaluations/hooks'
import { evaluationLabels } from '@/mta_evaluations/labels'
import { DeleteButton } from '@/shared/components/buttons'
import MagicGrid from '@/shared/components/MagicGrid'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import { T_VoidFn } from '@/shared/types'
import { Grid2 as Grid } from '@mui/material'
import { FC } from 'react'

const PageBreak: FC<{ afterQuestionId: number; reload: T_VoidFn }> = ({ afterQuestionId, reload }) => {
  const remove = useRemovePageBreak()
  const handleDelete = () => {
    remove({ after_question_id: afterQuestionId }).then(reload)
  }
  return (
    <>
      <Pastilla>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size="grow">{evaluationLabels.pageBreak}</Grid>
          <MagicGrid itemSize="auto">
            <DeleteButton onClick={handleDelete} />
          </MagicGrid>
        </Grid>
      </Pastilla>
      <Spacer space="s" />
    </>
  )
}
export default PageBreak
