'use client'

import MultipleChoiceOptionContainer from '@/mta_evaluations/components/MultipleChoiceOptionContainer'
import { I_AnswerMultipleChoiceDetail } from '@/mta_evaluations/types'
import Chip from '@/shared/components/Chip'
import HTMLParser from '@/shared/components/HTMLParser'
import { T_ArrayElement } from '@/shared/types'
import DeleteIcon from '@mui/icons-material/Delete'
import { Checkbox, IconButton } from '@mui/material'
import { green } from '@mui/material/colors'
import Grid from '@mui/material/Grid2'
import { FC } from 'react'

const MultipleChoiceOption: FC<{
  data: T_ArrayElement<I_AnswerMultipleChoiceDetail['options']>
  onDelete?: () => void
  onToggleTrue?: (val: boolean) => void
  withDelete?: boolean
}> = ({ data, onDelete, onToggleTrue, withDelete = false }) => {
  const { content, id, is_true, name } = data
  const handleDelete = () => onDelete?.()


  return (
    <MultipleChoiceOptionContainer>
      <Grid
        spacing={1}
        key={id}
        component="div"
        container
        justifyContent="center"
        alignItems="center"
        bgcolor={is_true ? green[50] : undefined}
        borderRadius={is_true ? 5 : undefined}
      >
        <Grid>
          <Checkbox
            checked={is_true}
            onChange={(_, v) => onToggleTrue?.(v)}   // ← local state update
            color="success"
          />
        </Grid>
        <Grid size="auto">
          <Chip label={name} />
        </Grid>
        <Grid size="grow">
          <HTMLParser htmlContent={content} />
        </Grid>
        {is_true && (
          <Grid paddingRight={2} sx={{ fontWeight: 'bold', color: 'green' }}>
            Respuesta Correcta
          </Grid>
        )}
        {withDelete && (
          <Grid size={1} container>
            <Grid>
              <IconButton onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        )}
      </Grid>
    </MultipleChoiceOptionContainer>
  )
}
export default MultipleChoiceOption
