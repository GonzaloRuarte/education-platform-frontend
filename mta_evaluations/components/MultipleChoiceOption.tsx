'use client'

import { useMultipleChoiceOptionDelete } from '@/mta_evaluations/hooks'
import { I_EvaluationDetail_MultipleChoiceAnswer, T_MultiplChoiceOptionId } from '@/mta_evaluations/types'
import Chip from '@/shared/components/Chip'
import { T_ArrayElement } from '@/shared/types'
import DeleteIcon from '@mui/icons-material/Delete'
import { Checkbox, IconButton } from '@mui/material'
import Grid from '@mui/material/Grid2'
import parse from 'html-react-parser'
import { FC } from 'react'

const MultipleChoiceOption: FC<{ data: T_ArrayElement<I_EvaluationDetail_MultipleChoiceAnswer['options']>; reload?: () => void; withDelete?: boolean }> = ({
  data,
  reload,
  withDelete = false,
}) => {
  const { content, id, is_true, name } = data
  const deleteInstance = useMultipleChoiceOptionDelete()
  const handleDelete = (id: T_MultiplChoiceOptionId) => {
    deleteInstance(id)
    reload && reload()
  }
  return (
    <Grid spacing={1} key={id} component="div" container justifyContent="center" alignItems="center">
      <Grid>
        <Checkbox checked={is_true} />
      </Grid>
      <Grid size="auto">
        <Chip label={name} />
      </Grid>
      <Grid size="grow">{parse(content)}</Grid>
      {withDelete && (
        <Grid size={1} container>
          <Grid>
            <IconButton onClick={() => handleDelete(id)}>
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      )}
    </Grid>
  )
}
export default MultipleChoiceOption
