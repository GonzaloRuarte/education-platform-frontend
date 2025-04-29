'use client'

import { useMultipleChoiceOptionDelete, useMultipleChoiceOptionEditIsTrue } from '@/mta_evaluations/hooks'
import { I_AnswerMultipleChoiceDetail, T_MultiplChoiceOptionId } from '@/mta_evaluations/types'
import Chip from '@/shared/components/Chip'
import { T_ArrayElement, T_VoidFn } from '@/shared/types'
import DeleteIcon from '@mui/icons-material/Delete'
import { Checkbox, IconButton } from '@mui/material'
import { green } from '@mui/material/colors'
import Grid from '@mui/material/Grid2'
import parse from 'html-react-parser'
import { FC } from 'react'

const MultipleChoiceOption: FC<{
  data: T_ArrayElement<I_AnswerMultipleChoiceDetail['options']>
  reload?: T_VoidFn
  withDelete?: boolean
}> = ({ data, reload, withDelete = false }) => {
  const { content, id, is_true, name } = data
  const deleteInstance = useMultipleChoiceOptionDelete()
  const handleDelete = (id: T_MultiplChoiceOptionId) => {
    deleteInstance(id)
    reload && reload()
  }
  const multipleChoiceOptionEditIsTrue = useMultipleChoiceOptionEditIsTrue()
  const handleChangeIsTrue = (_, value: boolean) => {
    if (reload === undefined) return
    multipleChoiceOptionEditIsTrue(id, { is_true: value })
    reload()
  }

  return (
    <div suppressContentEditableWarning={true}>
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
        <Grid size="grow">{parse(content)}</Grid>
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
    </div>
  )
}
export default MultipleChoiceOption
