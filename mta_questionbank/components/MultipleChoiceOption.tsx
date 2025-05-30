'use client'

import MultipleChoiceOptionContainer from '@/mta_questionbank/components/MultipleChoiceOptionContainer'
import { useMultipleChoiceOptionDelete, useMultipleChoiceOptionEditIsTrue } from '@/mta_questionbank/hooks'
import { I_AnswerMultipleChoiceDetail, T_MultipleChoiceOptionId } from '@/mta_questionbank/types'
import Chip from '@/shared/components/Chip'
import HTMLParser from '@/shared/components/HTMLParser'
import { useInProgress } from '@/shared/hooks'
import { handleServiceError } from '@/shared/service'
import { T_ArrayElement, T_VoidFn } from '@/shared/types'
import DeleteIcon from '@mui/icons-material/Delete'
import { Checkbox, IconButton } from '@mui/material'
import { green } from '@mui/material/colors'
import Grid from '@mui/material/Grid2'
import { FC } from 'react'

const MultipleChoiceOption: FC<{
  data: T_ArrayElement<I_AnswerMultipleChoiceDetail['options']>
  reload?: T_VoidFn
  withDelete?: boolean
}> = ({ data, reload, withDelete = false }) => {
  const { setIsInProgress, setIsNotInProgress } = useInProgress()
  const { content, id, is_true, name } = data
  const deleteInstance = useMultipleChoiceOptionDelete()
  const handleDelete = (id: T_MultipleChoiceOptionId) => {
    deleteInstance(id)
    reload && reload()
  }
  const multipleChoiceOptionEditIsTrue = useMultipleChoiceOptionEditIsTrue()
  const handleChangeIsTrue = (_, value: boolean) => {
    if (reload === undefined) return
    setIsInProgress()
    multipleChoiceOptionEditIsTrue(id, { is_true: value })
      .then(reload)
      .catch(handleServiceError)
      .finally(setIsNotInProgress)
  }

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
          <Checkbox checked={is_true} onChange={handleChangeIsTrue} color="success" />
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
              <IconButton onClick={() => handleDelete(id)}>
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
