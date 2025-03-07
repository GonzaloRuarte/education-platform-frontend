import { evaluationLabels } from '@/mta_evaluations/labels'
import Button from '@/shared/components/Button'
import Pastilla from '@/shared/components/Pastilla'
import Spacer from '@/shared/components/Spacer'
import { sharedLabels } from '@/shared/labels'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import UploadIcon from '@mui/icons-material/Upload'
import { Grid2 as Grid } from '@mui/material'
import { FC } from 'react'

const PageBreak: FC<{ afterQuestionId: number | string }> = ({ afterQuestionId }) => {
  return (
    <>
      <Pastilla>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size="grow">{evaluationLabels.pageBreak}</Grid>
          <Grid container spacing={2}>
            <Grid>
              <Button startIcon={<DeleteIcon />}>{sharedLabels.delete}</Button>
            </Grid>
            <Grid>
              <Button startIcon={<UploadIcon />}>{sharedLabels.moveUp}</Button>
            </Grid>
            <Grid>
              <Button startIcon={<DownloadIcon />}>{sharedLabels.moveDown}</Button>
            </Grid>
          </Grid>
        </Grid>
      </Pastilla>
      <Spacer space="s" />
    </>
  )
}
export default PageBreak
